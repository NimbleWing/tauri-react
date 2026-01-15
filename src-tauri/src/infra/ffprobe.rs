use std::{
    path::Path,
    process::{Command, Stdio},
};

use anyhow::{Context, Result};
use serde::Deserialize;
#[derive(Debug, Deserialize)]
pub struct FFProbeJSON {
    pub streams: Vec<FFProbeStream>,
    pub format: FFProbeFormat,
}
#[derive(Debug, Deserialize)]
pub struct FFProbeStream {
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub codec_type: String,
}
#[derive(Debug, Deserialize)]
pub struct FFProbeFormat {
    pub duration: String,
    pub tags: FFProbeFormatTags,
}
#[derive(Debug, Deserialize)]
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
    #[serde(rename = "RATING")]
    pub rating: Option<String>,
}
#[derive(Debug, Deserialize)]
pub struct VideoFile {
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
    pub rating: Option<String>,
}

pub async fn probe_video_info(video_path: &Path) -> Result<VideoFile> {
    let out = Command::new("ffprobe")
        .arg("-v")
        .arg("quiet")
        .arg("-print_format")
        .arg("json")
        .arg("-show_format")
        .arg("-show_streams")
        .arg(video_path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .context("ffprobe 启动失败")?;
    if !out.status.success() {
        anyhow::bail!("ffprobe 执行失败: {}", String::from_utf8_lossy(&out.stderr));
    }
    let probe_json: FFProbeJSON = serde_json::from_slice(&out.stdout)
        .map_err(|e| {
            eprintln!("JSON 解析失败，原始原因: {}", e);
            eprintln!("原始字节: {}", String::from_utf8_lossy(&out.stdout));
            e
        })
        .context("probe json 解析失败")?;
    let video_file = parse(probe_json, video_path)?;
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
        rating: tags.rating,
    })
}
