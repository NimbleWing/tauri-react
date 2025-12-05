use crate::video::test;
use crate::AppState;
use crate::{ffmpeg, video::Video};
use log::info;
use serde::Deserialize;
use std::path::Path;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::State;
use tokio::fs;
#[derive(Deserialize, Debug)]
pub struct VideoMetadata {
    pub title: String,
    pub subtitle: Option<String>,
    pub performers: String,
    pub studio: Option<String>,
    pub code: Option<String>,
    pub tags: String,
    pub country: String,
}
#[tauri::command]
pub async fn video_info(video_path: &str) -> Result<Video, String> {
    ffmpeg::get_video_info(video_path).await
}

#[tauri::command]
pub async fn video_embed_cover_and_metadata(
    video_path: &str,
    save_dir: &str,
    cover_path: &str,
    metadata: VideoMetadata,
) -> Result<(), String> {
    info!("开始video_embed_cover_and_metadata");
    // 1. 解析第一个演员
    let first_actor = metadata
        .performers
        .split(',')
        .next()
        .unwrap_or("Unknown")
        .trim();
    // 2. 拼主体字符串
    let mut body = format!("{}-{}", first_actor, metadata.title);
    if let Some(sub) = &metadata.subtitle {
        body.push(' ');
        body.push_str(sub);
    }

    // 3. 保留原扩展名
    let src_path = Path::new(video_path);
    let ext = src_path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("mp4");
    let new_name = format!("{}.{}", body, ext);

    // 4. 最终输出路径
    let dst_video_path = PathBuf::from(save_dir).join(new_name);

    // 4. 处理封面（仅当 cover_path 非空）
    let dst_cover_path = if cover_path.trim().is_empty() {
        None
    } else {
        let cover_ext = Path::new(cover_path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("jpg");
        let cover_new_name = format!("{}.{cover_ext}", body);
        let dst = PathBuf::from(save_dir).join(&cover_new_name);
        fs::copy(cover_path, &dst)
            .await
            .map_err(|e| format!("复制封面失败: {e}"))?;
        Some(dst)
    };

    // 必填字段直接 as_str，可选字段用 as_deref
    let mut meta = vec![
        ("title".to_string(), metadata.title),
        ("performers".to_string(), metadata.performers),
        ("country".to_string(), metadata.country),
        ("tags".to_string(), metadata.tags),
    ];

    if let Some(s) = &metadata.subtitle {
        meta.push(("subtitle".to_string(), s.clone()));
    }
    if let Some(s) = &metadata.studio {
        meta.push(("studio".to_string(), s.clone()));
    }
    if let Some(c) = &metadata.code {
        meta.push(("code".to_string(), c.clone()));
    }

    // 先把可能用到的路径全部变成 owned
    let src_path = video_path.to_owned();
    let dst_path = dst_video_path.to_string_lossy().into_owned();
    let cover_path: Option<String> = dst_cover_path
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned());
    ffmpeg::embed_cover_and_metadata(src_path, dst_path, cover_path, meta).await
}

// 扫描视频
#[tauri::command]
pub async fn video_scan(
    state: State<AppState, '_>,
    path: &str,
    handle: AppHandle,
) -> Result<(), String> {
    info!("开始扫描视频: ");
    test(path, &state, handle).await;
    Ok(())
}
