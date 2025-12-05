use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{Pool, Sqlite, SqlitePool, Row};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::mpsc;
use walkdir::WalkDir;

#[tokio::main]
async fn main() -> Result<()> {
    // 0. 连接池
    let pool = SqlitePool::connect("sqlite:stash.db").await?;

    // 1. 建表
    init_db(&pool).await?;

    // 2. 通道
    let (tx, mut rx) = mpsc::unbounded_channel::<DirEntry>();

    // 3. walker 任务（同步线程）
    let root = std::env::args().nth(1).unwrap_or_else(|| ".".into());
    let walker_handle = tokio::task::spawn_blocking(move || {
        if let Err(e) = walker(&root, tx) {
            eprintln!("walker error: {}", e);
        }
    });

    // 4. processor 任务（异步）
    let processor_handle = tokio::spawn(async move {
        while let Some(entry) = rx.recv().await {
            if let Err(e) = handle_entry(&pool, &entry).await {
                eprintln!("processor error: {}", e);
            }
        }
    });

    // 5. 等待两端结束
    walker_handle.await?;
    processor_handle.await?;
    println!("scan complete!");
    Ok(())
}

/* ---------------- 数据结构 ---------------- */
#[derive(Debug, Clone)]
struct DirEntry {
    path: PathBuf,
    is_dir: bool,
    size: u64,
    mtime: i64, // epoch seconds
}

/* ---------------- walker ---------------- */
fn walker(root: &str, tx: mpsc::UnboundedSender<DirEntry>) -> Result<()> {
    for e in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        let md = e.metadata()?;
        let mtime = md.modified()?.duration_since(UNIX_EPOCH)?.as_secs() as i64;
        let de = DirEntry {
            path: e.path().to_path_buf(),
            is_dir: md.is_dir(),
            size: md.len(),
            mtime,
        };
        if tx.send(de).is_err() {
            break;
        }
    }
    Ok(())
}

/* ---------------- 建表 ---------------- */
async fn init_db(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        r#"
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS folders(
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            parent_folder_id INTEGER,
            mod_time TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS files(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL UNIQUE,
            folder_id INTEGER,
            size  INTEGER,
            mtime INTEGER,
            hash  TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS covers(
            file_id INTEGER PRIMARY KEY,
            width  INTEGER,
            height INTEGER,
            FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE CASCADE
        );
        "#,
    )
    .execute(pool)
    .await?;
    Ok(())
}

/* ---------------- 处理器 ---------------- */
async fn handle_entry(pool: &SqlitePool, entry: &DirEntry) -> Result<()> {
    // 1. 目录：UPSERT
    if entry.is_dir {
        let now = Utc::now().to_rfc3339();
        sqlx::query(
            "INSERT INTO folders(path,parent_folder_id,mod_time,created_at,updated_at)
             VALUES($1,NULL,$2,$3,$3)
             ON CONFLICT(path) DO UPDATE SET mod_time=$2, updated_at=$3",
        )
        .bind(entry.path.to_string_lossy().as_ref())
        .bind(entry.mtime)
        .bind(now)
        .execute(pool)
        .await?;
        return Ok(());
    }

    // 2. 文件：存在性
    let rec = sqlx::query("SELECT id, mtime FROM files WHERE path = $1")
        .bind(entry.path.to_string_lossy().as_ref())
        .fetch_optional(pool)
        .await?;
    let (id, db_mtime): (Option<i64>, Option<i64>) = match rec {
        Some(r) => (Some(r.try_get("id")?), r.try_get("mtime").ok()),
        None => (None, None),
    };

    // 3. 无变化跳过
    if id.is_some() && db_mtime == Some(entry.mtime) {
        return Ok(());
    }

    // 4. 计算 hash & dummy 分辨率
    let hash = tokio::task::spawn_blocking(|| hash_file(&entry.path))
        .await
        .unwrap()
        .unwrap_or_default();
    let (w, h) = (1920, 1080);

    // 5. 父目录 id
    let folder_id = if let Some(parent) = entry.path.parent() {
        sqlx::query_scalar("SELECT id FROM folders WHERE path = $1")
            .bind(parent.to_string_lossy().as_ref())
            .fetch_optional(pool)
            .await?
    } else {
        None
    };

    let now = Utc::now().to_rfc3339();
    if id.is_some() {
        // UPDATE
        sqlx::query("UPDATE files SET size=$1, mtime=$2, hash=$3, updated_at=$4 WHERE id=$5")
            .bind(entry.size as i64)
            .bind(entry.mtime)
            .bind(&hash)
            .bind(&now)
            .bind(id.unwrap())
            .execute(pool)
            .await?;
    } else {
        // INSERT
        let id = sqlx::query_scalar::<_, i64>(
            "INSERT INTO files(path,folder_id,size,mtime,hash,created_at,updated_at)
             VALUES($1,$2,$3,$4,$5,$6,$6)
             RETURNING id",
        )
        .bind(entry.path.to_string_lossy().as_ref())
        .bind(folder_id)
        .bind(entry.size as i64)
        .bind(entry.mtime)
        .bind(&hash)
        .bind(&now)
        .fetch_one(pool)
        .await?;

        // cover 表
        sqlx::query("INSERT OR IGNORE INTO covers(file_id,width,height) VALUES($1,$2,$3)")
            .bind(id)
            .bind(w)
            .bind(h)
            .execute(pool)
            .await?;
    }
    Ok(())
}

/* ---------------- 工具 ---------------- */
fn hash_file(path: &Path) -> Result<String> {
    let mut hasher = blake3::Hasher::new();
    let mut file = std::fs::File::open(path)?;
    std::io::copy(&mut file, &mut hasher)?;
    Ok(hasher.finalize().to_hex().to_string())
}
