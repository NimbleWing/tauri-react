use crate::{
    app::video::{
        dto::{VideoEmbedDto, VideoScanDirDto},
        vo::VideoProbeDetailVo,
        VideoService,
    },
    AppService,
};
use anyhow::Result;
use base64::Engine;
use log::info;
use serde::Serialize;
use std::{path::PathBuf, process::Command, sync::Arc};
use tauri::Emitter;
use tauri::{AppHandle, State, Window};
use walkdir::WalkDir;

#[tauri::command]
pub async fn video_embed(dto: VideoEmbedDto) -> Result<(), String> {
    VideoService::embed_metadata(dto)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn video_scan(
    dto: VideoScanDirDto,
    app_handle: AppHandle,
    service: State<'_, Arc<AppService>>,
) -> Result<(), String> {
    service.video.scan_dir(dto, app_handle).await
}
#[tauri::command]
pub async fn video_probe(video_path: PathBuf) -> Result<VideoProbeDetailVo, String> {
    info!("{}", video_path.to_string_lossy().into_owned());
    VideoService::probe_video(&video_path).await
}

#[tauri::command]
pub async fn video_list_probe(video_dir: PathBuf, app_handle: AppHandle) -> Result<(), String> {
    VideoService::probe_video_list(&video_dir, app_handle).await
}

#[tauri::command]
pub async fn check_folder_exists(base_dir: String, folder_name: String) -> Result<bool, String> {
    let path = PathBuf::from(base_dir).join(folder_name);
    Ok(path.exists() && path.is_dir())
}

#[derive(Serialize, Clone)]
struct CoverPayload {
    path: String,
    base64: String,
}

/// 前端：invoke('scan_covers', { dir: 'D:/Movies' })
#[tauri::command]
pub async fn video_cover(window: Window, dir: String) -> Result<(), String> {
    // 遍历目录
    for entry in WalkDir::new(&dir)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path()
                .extension()
                .map_or(false, |ext| ext.eq_ignore_ascii_case("mkv"))
        })
    {
        let path = entry.path().to_owned();
        let window = window.clone();
        info!("找到一个");
        info!("{}", path.to_string_lossy().to_string());
        // 把提取动作扔进阻塞线程池，不卡主线程
        // 直接复用你的函数
        match video_covers(path.to_string_lossy().to_string()).await {
            Ok(base64) => {
                info!("发送");
                let _ = window.emit(
                    "cover",
                    CoverPayload {
                        path: path.to_string_lossy().to_string(),
                        base64,
                    },
                );
            }
            Err(_e) => {
                // 也可以 emit 一个失败事件，这里先忽略
                log::warn!("cover extract failed for {:?}", path);
            }
        }
    }
    info!("wa");
    Ok(())
}
pub async fn video_covers(video_path: String) -> Result<String, String> {
    let mut cmd = Command::new("ffmpeg");
    cmd.args(&[
        "-i",
        &video_path,
        "-map",
        "0:2", // 封面流
        "-f",
        "image2", // 强制图片格式
        "-vframes",
        "1", // 只取一帧
        "-c:v",
        "copy", // 不重新编码
        "-update",
        "1",
        "-y",
        "-", // 关键：输出到 stdout
    ])
    .stdout(std::process::Stdio::piped())
    .stderr(std::process::Stdio::piped());

    let output = cmd
        .output()
        .map_err(|e| format!("启动 ffmpeg 失败: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        // 有些文件没有封面流，可按需返回 Ok(None)
        return Err(format!("ffmpeg 导出封面失败: {}", err));
    }

    // 此时 output.stdout 就是图片二进制
    let img = output.stdout;
    if img.is_empty() {}
    let b64 = base64::engine::general_purpose::STANDARD.encode(&img);
    Ok(format!("data:image/jpeg;base64,{b64}"))
}

#[tauri::command]
pub async fn create_folder(path: String) -> Result<(), String> {
    use std::fs;

    let path = PathBuf::from(&path);

    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err(format!("Parent directory does not exist: {:?}", parent));
        }
    }

    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    Ok(())
}
