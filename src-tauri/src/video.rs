use crate::ffmpeg::get_video_info;
use crate::ffmpeg::oshash;
use crate::ffprobe::probe_video;
use crate::ffprobe::VideoFile;
use crate::AppState;
use anyhow::anyhow;
use anyhow::Result;
use chrono::Utc;
use futures::stream::{self, StreamExt};
use log::info;
use serde::{Deserialize, Serialize};
use sqlx::Row;
use sqlx::Transaction;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, State};
use tokio::sync::{mpsc, Mutex, Semaphore};
use tokio::task::spawn_blocking;
use tokio::time::Instant;
use walkdir::WalkDir;
pub const SUPPORTED_VIDEO_EXTENSIONS: &[&str] = &["mkv"];

#[derive(Serialize)] // 用于给前端 JSON
#[serde(rename_all = "camelCase")]
struct Progress {
    current: usize,
    current_path: String,
    success: usize,
    failed: usize,
    total: usize,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoMetadata {
    pub title: String,
    pub duration: Option<String>,
    pub fps: Option<f64>, // ++
    pub resolution: Option<(u32, u32)>,
    pub bitrate: Option<u64>,        // ++ bps
    pub codec: Option<String>,       // ++ 视频编码
    pub audio_codec: Option<String>, // ++
    pub audio_bitrate: Option<u64>,  // ++
    pub sample_rate: Option<u32>,    // ++
    pub channels: Option<u32>,       // ++
    pub cover: Option<String>,       // ++ base64 编码的封面 JPEG，前 1 MB 限制
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Video {
    pub hash: String,
    pub path: PathBuf,
    pub metadata: VideoMetadata,
}
struct DirEntry {
    path: PathBuf,
    is_dir: bool,
    size: u64,
    mtime: i64, // epoch seconds
}
static COUNTER: AtomicUsize = AtomicUsize::new(0);
static TOTAL: AtomicUsize = AtomicUsize::new(0);
static SUCCESS: AtomicUsize = AtomicUsize::new(0);
static FAILED: AtomicUsize = AtomicUsize::new(0);
pub async fn test(dirs: impl AsRef<Path>, state: &AppState, handle: AppHandle) {
    let start = Instant::now();
    let state = Arc::new(state.clone());
    let state_proc = state.clone();
    // 1. 收集所有视频文件路径
    let mut files = Vec::new();
    for entry in WalkDir::new(&dirs).into_iter().filter_map(|e| e.ok())
    // .filter(|e| e.file_type().is_file())
    {
        let path = entry.path();
        if SUPPORTED_VIDEO_EXTENSIONS.iter().any(|&ext| {
            path.extension()
                .and_then(|s| s.to_str())
                .is_some_and(|e| ext.eq_ignore_ascii_case(e))
        }) {
            files.push(path.to_path_buf());
        }
    }
    // 重置为 0
    COUNTER.store(0, Ordering::Relaxed);
    TOTAL.store(files.len(), Ordering::Relaxed);
    SUCCESS.store(0, Ordering::Relaxed);
    FAILED.store(0, Ordering::Relaxed);
    let (tx, mut rx) = mpsc::unbounded_channel::<DirEntry>();
    let dir_str = dirs.as_ref().to_str().unwrap().to_owned();
    let walker_handle = tokio::spawn(async move {
        if let Err(e) = walker(&dir_str, tx).await {
            eprintln!("walker error: {}", e);
        }
    });
    // 4. processor 任务（异步）
    let processor_handle = tokio::spawn(async move {
        while let Some(entry) = rx.recv().await {
            if let Err(e) = handle_entry(&entry, &state_proc, &handle).await {
                eprintln!("processor error: {}", e);
            }
        }
    });

    // 5. 等待两端结束
    let _ = walker_handle.await;
    info!("发送 complete!");
    let _ = processor_handle.await;
    let total = TOTAL.load(Ordering::Relaxed);
    info!("扫描到 {} 个文件", total);
    let elapsed = start.elapsed();
    info!("scan complete!耗时：{:?}", elapsed);
}
async fn handle_entry(entry: &DirEntry, state: &AppState, handle: &AppHandle) -> Result<()> {
    let mut tx = state.db.pool.begin().await?;

    if entry.is_dir {
        // 目录：upsert folder
        upsert_folder(&mut tx, entry).await?;
    } else {
        // ===== 文件分支：计数 + 推送 =====
        let curr = COUNTER.fetch_add(1, Ordering::Relaxed) + 1;

        // 先推“当前文件”
        let payload = Progress {
            current: curr,
            current_path: entry.path.display().to_string(),
            success: SUCCESS.load(Ordering::Relaxed),
            failed: FAILED.load(Ordering::Relaxed),
            total: TOTAL.load(Ordering::Relaxed),
        };
        let _ = handle.emit("scan_progress", &payload);

        // 业务逻辑
        match probe_video(&entry.path).await {
            Ok(video) => {
                insert_full_video(&mut tx, entry, &video).await?;
                SUCCESS.fetch_add(1, Ordering::Relaxed);
            }
            Err(e) => {
                FAILED.fetch_add(1, Ordering::Relaxed);
            }
        }
    }

    tx.commit().await?;
    Ok(())
}
// ---------- 文件 upsert ----------
async fn upsert_file(tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>, entry: &DirEntry) -> Result<()> {
    let basename = entry
        .path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or_default()
        .to_owned();

    // 1. 找父目录 id
    let parent_folder_id: Option<i64> = if let Some(parent) = entry.path.parent() {
        let parent_path = parent.to_string_lossy().into_owned();
        sqlx::query_scalar("SELECT id FROM folders WHERE path = ?")
            .bind(&parent_path)
            .fetch_optional(&mut **tx)
            .await?
    } else {
        None
    };

    let now = Utc::now().timestamp();

    // 2. upsert 文件
    sqlx::query(
        "INSERT INTO files (basename, parent_folder_id, size, mod_time, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT DO UPDATE
           SET size         = excluded.size,
               mod_time     = excluded.mod_time,
               updated_at   = excluded.updated_at",
    )
    .bind(&basename)
    .bind(parent_folder_id)
    .bind(entry.size as i64)
    .bind(entry.mtime)
    .bind(now)
    .bind(now)
    .execute(&mut **tx)
    .await?;

    Ok(())
}
// ---------- 目录 upsert ----------
async fn upsert_folder(tx: &mut Transaction<'_, sqlx::Sqlite>, entry: &DirEntry) -> Result<i64> {
    let path_str = entry.path.to_string_lossy().into_owned();
    let now = Utc::now().timestamp();

    // 1. 查是否已存在
    let maybe_id: Option<i64> = sqlx::query_scalar("SELECT id FROM folders WHERE path = ?")
        .bind(&path_str)
        .fetch_optional(&mut **tx)
        .await?;

    if let Some(id) = maybe_id {
        // 已存在，直接返回 id；如有需要可额外 update mod_time
        return Ok(id);
    }

    // 2. 取父路径
    let parent_path_str: Option<String> = entry
        .path
        .parent()
        .and_then(|p| p.to_str())
        .map(|s| s.to_owned());

    // 3. 查父目录的 id
    let parent_folder_id: Option<i64> = if let Some(ref p) = parent_path_str {
        sqlx::query_scalar("SELECT id FROM folders WHERE path = ?")
            .bind(p)
            .fetch_optional(&mut **tx)
            .await?
    } else {
        None
    };

    // 4. 插入新目录
    let row = sqlx::query(
        "INSERT INTO folders (path, parent_folder_id, mod_time, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         RETURNING id",
    )
    .bind(&path_str)
    .bind(parent_folder_id)
    .bind(entry.mtime)
    .bind(now)
    .bind(now)
    .fetch_one(&mut **tx)
    .await?;

    let id: i64 = row.try_get("id")?;
    Ok(id)
}
// 单独把 files 的 upsert 抽出来，返回 file_id
async fn upsert_file_only(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry: &DirEntry,
) -> Result<i64> {
    let basename = entry
        .path
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or_default();
    let parent_path = entry
        .path
        .parent()
        .map(|p| p.to_string_lossy().into_owned());
    let parent_id: Option<i64> = if let Some(ref p) = parent_path {
        sqlx::query_scalar("SELECT id FROM folders WHERE path = ?")
            .bind(p)
            .fetch_optional(&mut **tx)
            .await?
    } else {
        None
    };
    let now = Utc::now().timestamp();

    let id: i64 = sqlx::query_scalar::<_, i64>(
        "INSERT OR IGNORE INTO files
         (basename, parent_folder_id, size, mod_time, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING id",
    )
    .bind(basename)
    .bind(parent_id)
    .bind(entry.size as i64)
    .bind(entry.mtime)
    .bind(now)
    .bind(now)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| anyhow!("文件已存在，无法获取 id"))?;

    Ok(id)
}
/// 入口：文件扫进来后，一次性写完 6 张表
pub async fn insert_full_video(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry: &DirEntry,  // 你的原始 DirEntry
    video: &VideoFile, // probe_video 返回
) -> Result<i64> {
    // // 1. 先 upsert files（你原来已写，这里返回 file_id）
    // let file_id = upsert_file_only(tx, entry).await?;

    // // 2. 算 ohash
    // let path_clone = entry.path.clone();
    // let hash = spawn_blocking(move || oshash(path_clone)).await??;

    // // 3. files_fingerprints
    // sqlx::query(
    //     "INSERT OR IGNORE INTO files_fingerprints (file_id, type, fingerprint)
    //      VALUES (?, 'ohash', ?)",
    // )
    // .bind(file_id)
    // .bind(hash.as_bytes()) // 转 bytes 存 blob
    // .execute(&mut **tx)
    // .await?;
    // 1. 算指纹（提前）
    let path_clone = entry.path.clone();
    let hash = spawn_blocking(move || oshash(path_clone)).await??;

    // 2. 先看指纹是否已存在
    let existing_file_id: Option<i64> = sqlx::query_scalar(
        "SELECT file_id
     FROM files_fingerprints
     WHERE type = 'ohash' AND fingerprint = ?",
    )
    .bind(hash.as_bytes())
    .fetch_optional(&mut **tx)
    .await?;

    let file_id = if let Some(id) = existing_file_id {
        // --- 去重命中：复用旧文件记录 ---
        return Ok(0);
    } else {
        // --- 新文件：先插 files，再插指纹 ---
        let new_id = upsert_file_only(tx, entry).await?; // 你原来的 upsert
        sqlx::query(
            "INSERT INTO files_fingerprints (file_id, type, fingerprint)
         VALUES (?, 'ohash', ?)",
        )
        .bind(new_id)
        .bind(hash.as_bytes())
        .execute(&mut **tx)
        .await?;
        new_id
    };

    // 4. video_files（缺的数据先写空）
    sqlx::query(
        "INSERT OR IGNORE INTO video_files
         (file_id,duration,video_codec,format,audio_codec,width,height,frame_rate,bit_rate,interactive)
         VALUES (?,?,?,?,?,?,?,?,?,?)",
    )
    .bind(file_id)
    .bind(video.duration)
    .bind("") // video_codec
    .bind("") // format
    .bind("") // audio_codec
    .bind(video.width as i64)
    .bind(video.height as i64)
    .bind(0f64) // frame_rate
    .bind(0i64) // bit_rate
    .bind(false) // interactive
    .execute(&mut **tx)
    .await?;

    // 5. scenes
    let now = Utc::now().timestamp();
    let scene_id: i64 = sqlx::query_scalar::<_, i64>(
        "INSERT INTO scenes (title, details, date, studio_id, code, created_at, updated_at)
     VALUES (?, '', '', NULL, ?, ?, ?)
     RETURNING id",
    )
    .bind(&video.title)
    .bind(&video.code)
    .bind(now)
    .bind(now)
    .fetch_optional(&mut **tx)
    .await?
    .ok_or_else(|| anyhow!("插入 scene 失败，未返回 id"))?;

    // 6. scenes_files (1文件↔1scene, 且 primary=true)
    sqlx::query(
        "INSERT OR IGNORE INTO scenes_files (scene_id, file_id, \"primary\")
         VALUES (?, ?, 1)",
    )
    .bind(scene_id)
    .bind(file_id)
    .execute(&mut **tx)
    .await?;

    // 7. studios
    if let Some(st) = &video.studio {
        let studio_id: Option<i64> = sqlx::query_scalar("SELECT id FROM studios WHERE name = ?")
            .bind(st)
            .fetch_optional(&mut **tx)
            .await?;

        let studio_id = match studio_id {
            Some(id) => id,
            None => sqlx::query_scalar::<_, i64>(
                "INSERT INTO studios (name, created_at, updated_at)
                VALUES (?, ?, ?)
                RETURNING id",
            )
            .bind(st)
            .bind(now)
            .bind(now)
            .fetch_optional(&mut **tx)
            .await?
            .ok_or_else(|| anyhow!("插入 studio 后未返回 id"))?,
        };
        // 把 scene 关联到 studio
        sqlx::query("UPDATE scenes SET studio_id = ? WHERE id = ?")
            .bind(studio_id)
            .bind(scene_id)
            .execute(&mut **tx)
            .await?;
    }

    // 8. tags
    for tag_name in video.tags.split(',') {
        let tag_name = tag_name.trim();
        if tag_name.is_empty() {
            continue;
        }
        let tag_id: i64 = match sqlx::query_scalar::<_, i64>("SELECT id FROM tags WHERE name = ?")
            .bind(tag_name)
            .fetch_optional(&mut **tx)
            .await?
        {
            Some(id) => id,
            None => {
                // 不存在再插入
                sqlx::query_scalar::<_, i64>(
                    "INSERT INTO tags (name, sort_name, created_at, updated_at)
                 VALUES (?, ?, ?, ?)
                 RETURNING id",
                )
                .bind(tag_name)
                .bind(tag_name)
                .bind(now)
                .bind(now)
                .fetch_optional(&mut **tx)
                .await?
                .ok_or_else(|| anyhow!("插入 tag 后未返回 id"))?
            }
        };
        sqlx::query("INSERT OR IGNORE INTO scenes_tags (scenes_id, tag_id) VALUES (?, ?)")
            .bind(scene_id)
            .bind(tag_id)
            .execute(&mut **tx)
            .await?;
    }

    // 9. performers
    for perf_name in video.performers.split(',') {
        let perf_name = perf_name.trim();
        if perf_name.is_empty() {
            continue;
        }
        let perf_id: i64 =
            match sqlx::query_scalar::<_, i64>("SELECT id FROM performers WHERE name = ?")
                .bind(perf_name)
                .fetch_optional(&mut **tx)
                .await?
            {
                Some(id) => id,
                None => sqlx::query_scalar::<_, i64>(
                    "INSERT INTO performers (name, created_at, updated_at)
             VALUES (?, ?, ?)
             RETURNING id",
                )
                .bind(perf_name)
                .bind(now)
                .bind(now)
                .fetch_optional(&mut **tx)
                .await?
                .ok_or_else(|| anyhow!("插入 performer 后未返回 id"))?,
            };

        sqlx::query(
            "INSERT OR IGNORE INTO performers_scenes (performer_id, scene_id) VALUES (?, ?)",
        )
        .bind(perf_id)
        .bind(scene_id)
        .execute(&mut **tx)
        .await?;
    }

    Ok(scene_id)
}
async fn walker(root: &str, tx: mpsc::UnboundedSender<DirEntry>) -> Result<()> {
    for e in WalkDir::new(root).into_iter().filter_map(|e| e.ok())
    // .filter(|e| e.file_type().is_file())
    {
        let md = e.metadata()?;
        let is_dir = md.is_dir();
        let mtime = md.modified()?.duration_since(UNIX_EPOCH)?.as_secs() as i64;
        // 无论目录还是文件，都先包装成 DirEntry 发出去
        let de = DirEntry {
            path: e.path().to_path_buf(),
            is_dir,
            size: md.len(),
            mtime,
        };
        // 如果是目录，直接发；如果是文件，再检查扩展名
        if is_dir {
            if tx.send(de).is_err() {
                break;
            }
            continue;
        }
        // 文件扩展名校验
        let is_video = SUPPORTED_VIDEO_EXTENSIONS.iter().any(|&ext| {
            e.path()
                .extension()
                .and_then(|s| s.to_str())
                .map_or(false, |e| ext.eq_ignore_ascii_case(e))
        });
        if !is_video {
            continue;
        }

        // 视频文件也发出去
        if tx.send(de).is_err() {
            break;
        }
    }
    Ok(())
}

pub async fn scan_dirs<R: tauri::Runtime>(dirs: &[impl AsRef<Path>], handle: &AppHandle<R>) {
    println!("开始扫描视频文件...");
    let start = Instant::now();
    // 1. 收集所有视频文件路径
    let mut files = Vec::new();
    for dir in dirs {
        for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok())
        // .filter(|e| e.file_type().is_file())
        {
            let path = entry.path();
            if SUPPORTED_VIDEO_EXTENSIONS.iter().any(|&ext| {
                path.extension()
                    .and_then(|s| s.to_str())
                    .is_some_and(|e| ext.eq_ignore_ascii_case(e))
            }) {
                files.push(path.to_path_buf());
            }
        }
    }

    let total = files.len();
    if total == 0 {
        println!("未找到任何视频文件");
        return;
    }

    info!("找到 {} 个视频文件", total);

    // 3. 并发限流：同时最多 N 个任务
    const CONCURRENCY: usize = 20;
    let sem = Arc::new(Semaphore::new(CONCURRENCY));
    let total = Arc::new(Mutex::new(total));
    let current = Arc::new(Mutex::new(0usize));
    let success = Arc::new(Mutex::new(0usize));
    let failed = Arc::new(Mutex::new(0usize));
    // 4. 并发处理
    stream::iter(files)
        .for_each_concurrent(CONCURRENCY, |path| {
            let sem = sem.clone();
            let handle = handle.clone();
            let total = total.clone();
            let current = current.clone();
            let success = success.clone();
            let failed = failed.clone();
            info!("开始处理：{}", path.display());
            async move {
                let _permit = sem.acquire().await.unwrap();
                let path_str = path.as_os_str().to_string_lossy().into_owned();
                let mut c = current.lock().await;
                *c += 1;
                drop(c);
                info!("接着处理{}", path_str);
                match probe_video(&path_str).await {
                    Ok(_info) => {
                        info!("处理完成{:?}", _info);
                        // 添加到数据库

                        *success.lock().await += 1;
                    }
                    Err(e) => {
                        *failed.lock().await += 1;
                        eprintln!("失败 {}: {}", path.display(), e);
                    }
                }
                // 推送最新进度
                let payload = Progress {
                    current: *current.lock().await,
                    current_path: path_str,
                    success: *success.lock().await,
                    failed: *failed.lock().await,
                    total: *total.lock().await,
                };
                let _ = handle.emit("scan_progress", &payload);
            }
        })
        .await;

    let elapsed = start.elapsed();

    // 推给前端或打印
    println!("全部完成，总耗时: {:.2?}", elapsed);
}
