use std::{
    path::{Path, PathBuf},
    sync::Arc,
    thread,
    time::{Instant, UNIX_EPOCH},
};

use anyhow::{anyhow, Result};
use chrono::Utc;
use log::info;
use sqlx::Row;
use sqlx::{SqlitePool, Transaction};
use tauri::{AppHandle, Emitter};
use tokio::{fs, sync::mpsc, task::spawn_blocking};
use walkdir::WalkDir;

use crate::{
    app::video::{
        dto::{VideoEmbedDto, VideoScanDirDto},
        vo::VideoProbeDetailVo,
    },
    dir::DirEntry,
    fs::oshash,
    infra::{
        ffmpeg,
        ffprobe::{self, VideoFile},
    },
};
pub const SUPPORTED_VIDEO_EXTENSIONS: &[&str] = &["mkv"];
pub struct VideoService {
    pool: SqlitePool,
}

impl VideoService {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
    pub async fn probe_video(video_path: &Path) -> Result<VideoProbeDetailVo, String> {
        match ffprobe::probe_video_info(video_path).await {
            Ok(video) => {
                let performers: Vec<String> = video
                    .performers
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .collect();
                let tags: Vec<String> = video
                    .tags
                    .split(',')
                    .map(|s| s.trim().to_string())
                    .collect();

                // 尝试提取嵌入的封面
                let cover_image = match ffmpeg::extract_embedded_cover(video_path).await {
                    Ok(cover_image) => Some(cover_image), // 成功提取嵌入封面
                    Err(_e) => {
                        match ffmpeg::extract_cover_from_video_stream(video_path).await {
                            Ok(cover_image) => Some(cover_image), // 成功提取视频流封面
                            Err(_e) => {
                                None // 提取封面失败
                            }
                        }
                    }
                };

                Ok(VideoProbeDetailVo {
                    path: video_path.to_string_lossy().into_owned(),
                    title: video.title,
                    subtitle: video.subtitle,
                    performers,
                    studio: video.studio,
                    code: video.code,
                    tags,
                    country: video.country,
                    duration: video.duration,
                    width: video.width,
                    height: video.height,
                    base64_cover: cover_image,
                    size: video.size,
                })
            }
            Err(e) => {
                return Err(e.to_string());
            }
        }
    }

    pub async fn probe_video_list(video_dir: &Path, app_handle: AppHandle) -> Result<(), String> {
        info!("开始");
        for entry in WalkDir::new(video_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| {
                e.path()
                    .extension()
                    .map_or(false, |ext| ext.eq_ignore_ascii_case("mkv"))
            })
        {
            let path = entry.path().to_owned();
            info!("开始处理:{:?}", path);
            match VideoService::probe_video(&path).await {
                Ok(info) => {
                    info!("开始发送");
                    let _ = app_handle.emit("probe_video_list", &info);
                }
                Err(_e) => {
                    info!("处理失败：{:?}", path);
                }
            };
        }
        Ok(())
    }
    pub async fn embed_metadata(dto: VideoEmbedDto) -> Result<(), String> {
        info!("{:?}", dto);
        let first_performer = dto
            .metadata
            .performers
            .split(',')
            .next()
            .unwrap_or("未知")
            .trim();
        let mut basename = format!("【{}】", first_performer);
        if let Some(code) = &dto.metadata.code {
            basename.push_str(code);
            basename.push(' ');
            basename.push_str(&dto.metadata.title.trim());
        } else {
            basename.push_str(&dto.metadata.title.trim());
        }

        if let Some(subtitle) = &dto.metadata.subtitle {
            basename.push(' ');
            basename.push_str(subtitle);
        }
        let video_ext = dto
            .video_path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("mkv");
        let video_filename = format!("{}.{}", basename, video_ext);
        let dst_video_path = PathBuf::from(&dto.save_dir).join(video_filename);

        let dst_cover_path = match dto.cover_path.as_ref() {
            None => None,
            Some(cp) if cp.as_os_str().is_empty() => None, // 允许传空路径
            Some(cp) => {
                let cover_ext = cp.extension().and_then(|e| e.to_str()).unwrap_or("jpg");
                let cover_new_name = format!("{}.{cover_ext}", basename);
                let dst = dto.save_dir.join(&cover_new_name);
                fs::copy(cp, &dst)
                    .await
                    .map_err(|e| format!("复制封面失败: {e}"))?;
                // 简单校验：目标文件存在且大小 > 0
                let dst_meta = fs::metadata(&dst)
                    .await
                    .map_err(|e| format!("无法读取目标文件元数据: {e}"))?;
                if dst_meta.len() == 0 {
                    return Err("复制后文件大小为 0，可能未真正写入".into());
                }
                fs::remove_file(cp)
                    .await
                    .map_err(|e| format!("删除封面失败: {e}"))?;
                Some(dst)
            }
        };
        let mut meta = vec![
            ("title".to_string(), dto.metadata.title),
            ("performers".to_string(), dto.metadata.performers),
            ("country".to_string(), dto.metadata.country),
            ("rating".to_string(), dto.metadata.rating),
            ("tags".to_string(), dto.metadata.tags),
        ];

        if let Some(subtitle) = &dto.metadata.subtitle {
            meta.push(("subtitle".to_string(), subtitle.clone()));
        }
        if let Some(studio) = &dto.metadata.studio {
            meta.push(("studio".to_string(), studio.clone()));
        }
        if let Some(code) = &dto.metadata.code {
            meta.push(("code".to_string(), code.clone()));
        }
        let origin_video_path = dto.video_path.clone();
        ffmpeg::attach(dto.video_path, dst_cover_path, dst_video_path, meta).await?;
        // 删除原始视频
        fs::remove_file(origin_video_path)
            .await
            .map_err(|e| format!("删除源视频失败: {e}"))?;

        Ok(())
    }
    pub async fn scan_dir(
        &self,
        dto: VideoScanDirDto,
        app_handle: AppHandle,
    ) -> Result<(), String> {
        let start = Instant::now();
        let pool = Arc::new(self.pool.clone());
        let app_handle = Arc::new(app_handle);
        let mut files = Vec::new();
        for entry in WalkDir::new(&dto.dir_path)
            .into_iter()
            .filter_map(|e| e.ok())
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
        let (tx, mut rx) = mpsc::unbounded_channel::<DirEntry>();
        let sender_handle = tokio::task::spawn_blocking(move || {
            info!("sendStart");
            info!("發送者運行在執行緒: {:?}", thread::current().id());
            if let Err(e) = sender_walker(&dto.dir_path, tx) {
                eprintln!("sender walker error: {}", e);
            }
        });
        let processor_handle = tokio::spawn(async move {
            info!("processorStart");
            info!("處理者運行在執行緒: {:?}", thread::current().id());
            while let Some(entry) = rx.recv().await {
                if let Err(e) = handle_entry(&entry, &pool, &app_handle).await {
                    eprintln!("processor error: {}", e);
                }
            }
        });
        let _ = sender_handle.await;
        info!("sender finished");
        let _ = processor_handle.await;
        info!("processor finished");
        let elapsed = start.elapsed();
        info!(
            "视频扫描结束 耗时: {}s, 扫描到{}个文件",
            elapsed.as_secs(),
            files.len()
        );
        Ok(())
    }
}
async fn handle_entry(dir_entry: &DirEntry, pool: &SqlitePool, _handle: &AppHandle) -> Result<()> {
    let mut tx = pool.begin().await?;
    if dir_entry.is_dir {
        upsert_folder(&mut tx, dir_entry).await?;
    } else {
        match ffprobe::probe_video_info(&dir_entry.path).await {
            Ok(video) => {
                insert_full_video(&mut tx, dir_entry, &video).await?;
            }
            Err(_e) => {
                info!("解析失败：{}", &dir_entry.path.to_string_lossy());
            }
        }
    }

    tx.commit().await?;
    Ok(())
}
fn sender_walker(dir: &Path, tx: mpsc::UnboundedSender<DirEntry>) -> Result<()> {
    for entry in WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
        let meta = entry.metadata()?;
        let is_dir = meta.is_dir();
        let mtime = meta.modified()?.duration_since(UNIX_EPOCH)?.as_secs() as i64;
        let dir_entry = DirEntry {
            path: entry.path().to_path_buf(),
            is_dir,
            size: meta.len(),
            mtime,
        };
        if is_dir {
            if tx.send(dir_entry).is_err() {
                break;
            }
            continue;
        }
        // 文件扩展名校验
        let is_video = SUPPORTED_VIDEO_EXTENSIONS.iter().any(|&ext| {
            entry
                .path()
                .extension()
                .and_then(|s| s.to_str())
                .map_or(false, |e| ext.eq_ignore_ascii_case(e))
        });
        if !is_video {
            continue;
        }

        // 视频文件也发出去
        if tx.send(dir_entry).is_err() {
            break;
        }
    }
    Ok(())
}
pub async fn insert_full_video(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry: &DirEntry,  // 你的原始 DirEntry
    video: &VideoFile, // probe_video 返回
) -> Result<i64> {
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

    let file_id = if let Some(_id) = existing_file_id {
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
