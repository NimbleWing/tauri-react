use anyhow::{Context, Result};
use log::info;
use serde::Deserialize;
use std::{
    path::Path,
    process::{Command, Stdio},
};
#[derive(Debug, Deserialize)]
struct FFProbeFormat {
    pub filename: String,
    pub duration: String,
    pub tags: FFProbeFormatTags,
}
#[derive(Debug, Deserialize, Default)]
pub struct FFProbeFormatTags {
    pub title: String,
    #[serde(rename = "PERFORMERS")]
    pub performers: String,
    #[serde(rename = "COUNTRY")]
    pub country: String,
    #[serde(rename = "TAGS")]
    pub tags: String,
    #[serde(rename = "STUDIO")]
    pub studio: Option<String>,
    #[serde(rename = "SUBTITLE")]
    pub subtitle: Option<String>,
    #[serde(rename = "CODE")]
    pub code: Option<String>,
}
#[derive(Debug, Deserialize)]
pub struct FFProbeStream {
    pub codec_type: String,
    pub width: Option<u32>,
    pub height: Option<u32>,
}
#[derive(Debug, Deserialize)]
pub struct FFProbeJSON {
    pub format: FFProbeFormat,
    pub streams: Vec<FFProbeStream>,
}
#[derive(Debug, Deserialize)]
pub struct VideoFile {
    pub path: String,
    pub width: u32,
    pub height: u32,
    pub duration: f64,
    pub size: u64,
    pub title: String,
    pub performers: String,
    pub country: String,
    pub tags: String,
    pub studio: Option<String>,
    pub subtitle: Option<String>,
    pub code: Option<String>,
}

pub async fn probe_video<P: AsRef<Path>>(path: P) -> Result<VideoFile> {
    info!("Probing video file: {}", path.as_ref().display());
    let out = Command::new("ffprobe")
        .arg("-v")
        .arg("quiet")
        .arg("-print_format")
        .arg("json")
        .arg("-show_format")
        .arg("-show_streams")
        .arg(path.as_ref())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        // .map_err(|e| format!("ffmpeg 导出封面失败: {}", e))?;
        .context("ffprobe 启动失败")?;
    if !out.status.success() {
        // return Err(String::from_utf8_lossy(&out.stderr).to_string());
        // 把 stderr 转成 anyhow::Error
        anyhow::bail!("ffprobe 返回错误: {}", String::from_utf8_lossy(&out.stderr));
    }
    let probe_json: FFProbeJSON =
        serde_json::from_slice(&out.stdout).context("probeJSON 解析失败")?;
    let video_file = parse(probe_json, path)?;
    Ok(video_file)
}

fn parse<P: AsRef<Path>>(probe_json: FFProbeJSON, file_path: P) -> Result<VideoFile> {
    let video_stream = probe_json
        .streams
        .into_iter()
        .find(|stream| stream.codec_type == "video")
        // .ok_or("未找到视频流")?;
        .context("未找到视频流")?;
    let duration: f64 = probe_json.format.duration.parse().unwrap_or(0.);
    let size = file_path
        .as_ref()
        .metadata()
        .context("parse size 失败")?
        // .map_err(|e| e.to_string())?
        .len();
    let tags = probe_json.format.tags;
    Ok(VideoFile {
        path: file_path.as_ref().display().to_string(),
        width: video_stream.width.unwrap_or(0),
        height: video_stream.height.unwrap_or(0),
        duration: duration,
        size: size,
        title: tags.title,
        performers: tags.performers,
        country: tags.country,
        tags: tags.tags,
        studio: tags.studio,
        subtitle: tags.subtitle,
        code: tags.code,
    })
}
