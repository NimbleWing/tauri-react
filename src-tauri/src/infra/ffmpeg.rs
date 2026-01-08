use std::{
    path::{Path, PathBuf},
    process::Command,
};

use anyhow::Result;
use base64::Engine;
use tauri::async_runtime::spawn_blocking;

pub async fn attach(
    video_path: PathBuf,
    cover_path: Option<PathBuf>,
    dst_video_path: PathBuf,
    metadata: Vec<(String, String)>,
) -> Result<(), String> {
    spawn_blocking(move || {
        let mut args: Vec<String> = vec!["-i".into(), video_path.to_string_lossy().into_owned()];
        if let Some(cover) = cover_path {
            let cover_path = cover.as_path();
            if !cover_path.exists() {
                return Err("封面图不存在".into());
            }
            args.push("-i".into());
            args.push(cover_path.to_string_lossy().into_owned());
            args.push("-map".into());
            args.push("0".into());
            args.push("-map".into());
            args.push("1:v".into());
            args.push("-c".into());
            args.push("copy".into());
            args.push("-disposition:v:1".into());
            args.push("attached_pic".into());
        } else {
            args.push("-c".into());
            args.push("copy".into());
        }
        for (k, v) in metadata {
            args.push("-metadata".into());
            args.push(format!("{}={}", k, v));
        }
        args.push("-y".into());
        args.push(dst_video_path.to_string_lossy().into_owned());
        let out = Command::new("ffmpeg")
            .args(&args)
            .output()
            .map_err(|e| format!("FFmpeg 启动失败: {}", e))?;
        if !out.status.success() {
            let err = String::from_utf8_lossy(&out.stderr);
            return Err(format!("FFmpeg 执行失败: {}", err));
        }
        Ok(())
    })
    .await
    .map_err(|e| format!("视频附加数据失败：{}", e))?
}
pub async fn extract_embedded_cover(video_path: &Path) -> Result<String, String> {
    let mut cmd = Command::new("ffmpeg");
    cmd.args(&[
        "-i",
        &video_path.to_string_lossy().into_owned(),
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
    let img = output.stdout;
    if img.is_empty() {
        return Err(format!("ffmpeg 没有提取到封面"));
    }
    let b64 = base64::engine::general_purpose::STANDARD.encode(&img);
    Ok(format!("data:image/jpeg;base64,{b64}"))
}
pub async fn extract_cover_from_video_stream(video_path: &Path) -> Result<String, String> {
    let mut cmd = Command::new("ffmpeg");
    cmd.args(&[
        "-i",
        video_path.to_string_lossy().as_ref(),
        "-ss",
        "00:00:01.00",
        "-vframes",
        "1",
        "-c:v",
        "png",
        "-f",
        "image2pipe",
        "-y",
        "-",
    ])
    .stdout(std::process::Stdio::piped())
    .stderr(std::process::Stdio::piped());

    let output = cmd
        .output()
        .map_err(|e| format!("启动 ffmpeg 失败: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("ffmpeg 提取封面失败: {}", err));
    }

    let img = output.stdout;
    if img.is_empty() {
        // 没有提取到封面
        return Err(format!("ffmpeg 没有提取到封面"));
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&img);
    Ok(format!("data:image/png;base64,{}", b64))
}
