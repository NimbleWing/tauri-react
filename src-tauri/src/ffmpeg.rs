use crate::ffprobe::{probe_video, VideoFile};
use crate::video::{Video, VideoMetadata};
use log::info;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::{self, Read, Seek};
use std::path::{Path, PathBuf};
use std::process::Command;
use tokio::task::spawn_blocking;
#[derive(Debug, Deserialize)]
struct Probe {
    format: Format,
    streams: Vec<Stream>,
}

#[derive(Debug, Deserialize)]
struct Format {
    duration: Option<String>,
    size: Option<String>,     // ++ 文件体积（字节）
    bit_rate: Option<String>, // ++ 整体码率
    tags: Tags,
}

#[derive(Debug, Deserialize, Default)]
struct Tags {
    title: String,
    #[serde(rename = "PERFORMERS")]
    performers: String,
    #[serde(rename = "COUNTRY")]
    country: String,
    #[serde(rename = "TAGS")]
    tags: String,
    #[serde(rename = "STUDIO")]
    studio: Option<String>,
    #[serde(rename = "SUBTITLE")]
    subtitle: Option<String>,
    #[serde(rename = "CODE")]
    code: Option<String>,
}

#[derive(Debug, Deserialize)]
struct Stream {
    codec_type: String, // "video" | "audio"
    codec_name: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
    r_frame_rate: Option<String>, // "30/1" 这种
    bit_rate: Option<String>,
    sample_rate: Option<String>,
    channels: Option<u32>,
    disposition: Option<serde_json::Value>, // 封
}

pub async fn get_video_info(video_path: &str) -> Result<Video, String> {
    let path = PathBuf::from(video_path);
    spawn_blocking(move || {
        if !Path::new(&path).exists() {
            return Err("Video file does not exist.".into());
        }
        // let hash = {
        //     let mut file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
        //     let mut hasher = Sha256::new();
        //     std::io::copy(&mut file, &mut hasher).map_err(|e| e.to_string())?;
        //     format!("{:x}", hasher.finalize())
        //         .get(..16)
        //         .unwrap_or_default()
        //         .to_string()
        // };
        let hash = oshash(&path).map_err(|e| format!("生成 oshash 失败: {}", e))?;
        info!("文件hash：{}", hash);

        let out = Command::new("ffprobe")
            .args(&[
                "-v",
                "quiet",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
                // "-select_streams",
                // "v:0",
                &path.to_string_lossy(),
            ])
            .output()
            .map_err(|e| format!("ffprobe 启动失败: {}", e))?;

        if !out.status.success() {
            return Err(String::from_utf8_lossy(&out.stderr).into_owned().into());
        }
        let v: Probe =
            serde_json::from_slice(&out.stdout).map_err(|e| format!("JSON 解析失败: {}", e))?;

        // 找视频流 + 音频流
        let video_stream = v.streams.iter().find(|s| s.codec_type == "video");
        let audio_stream = v.streams.iter().find(|s| s.codec_type == "audio");

        // 视频信息
        let w = video_stream.and_then(|s| s.width);
        let h = video_stream.and_then(|s| s.height);
        let fps = video_stream
            .and_then(|s| s.r_frame_rate.as_deref())
            .and_then(eval_fps);
        let bitrate = v
            .format
            .bit_rate
            .as_ref()
            .and_then(|b| b.parse::<u64>().ok());
        let codec = video_stream.and_then(|s| s.codec_name.clone());

        // 音频信息
        let audio_codec = audio_stream.and_then(|s| s.codec_name.clone());
        let audio_bitrate = audio_stream
            .and_then(|s| s.bit_rate.as_ref())
            .and_then(|b| b.parse::<u64>().ok());
        let sample_rate = audio_stream
            .and_then(|s| s.sample_rate.as_ref())
            .and_then(|s| s.parse::<u32>().ok());
        let channels = audio_stream.and_then(|s| s.channels);

        // 封面（base64）
        let cover_b64 = extract_cover_if_exists(&path, &v.streams)?;
        // let cover_b64 = extract_mkv_cover(&path)?;
        // 标签
        let Tags {
            title,
            subtitle,
            performers,
            tags,
            studio,
            country,
            code,
        } = &v.format.tags;
        info!("{:?}", v.format.tags);
        info!("{:?}", cover_b64);
        Ok(Video {
            hash: title.to_string(),
            path,
            metadata: VideoMetadata {
                title: title.to_string(),
                duration: v.format.duration,
                fps,
                resolution: w.zip(h),
                bitrate,
                codec,
                audio_codec,
                audio_bitrate,
                sample_rate,
                channels,
                cover: cover_b64,
            },
        })
    })
    .await
    .map_err(|e| format!("任务 join 失败: {}", e))?
    // let v: Probe =
    //     serde_json::from_slice(&out.stdout).map_err(|e| format!("JSON 解析失败: {}", e))?;

    // let (title, artist) = match v.format.tags {
    //     Some(tags) => (tags.title, tags.artist),
    //     None => (None, None),
    // };
    // let dur = v.format.duration;
    // let (w, h) = v
    //     .streams
    //     .get(0)
    //     .map(|s| (s.width, s.height))
    //     .unwrap_or((None, None));

    // Ok(Video {
    //     hash: String::new(),
    //     path: path.into(),
    //     size: 0,
    //     metadata: VideoMetadata {
    //         title,
    //         duration: dur,
    //         fps: None,
    //         resolution: w.zip(h),
    //         bitrate: None,
    //         codec: None,
    //         audio_codec: None,
    //         audio_bitrate: None,
    //         sample_rate: None,
    //         channels: None,
    //         album: None,
    //         artist,
    //     },
    // })
    // })
    // .await
    // .map_err(|e| format!("任务 join 失败: {}", e))?
}
/// 把封面和任意元数据一次性写进媒体文件（不重新编码）
/// meta: 元数据 Vec<(key, value)>
pub async fn embed_cover_and_metadata<P: AsRef<Path>>(
    src: P,
    dst: P,
    cover: Option<P>,
    meta: Vec<(String, String)>,
) -> Result<(), String>
where
    P: AsRef<Path> + Send + Sync + 'static,
{
    let src = src.as_ref().to_path_buf();
    let dst = dst.as_ref().to_path_buf();

    spawn_blocking(move || {
        if !src.exists() {
            return Err("源文件不存在".into());
        }

        let mut args: Vec<String> = vec!["-i".into(), src.to_string_lossy().into_owned()];
        // 在 spawn_blocking 里先判断
        let is_mkv_dst = is_mkv(&dst);
        // 只有封面存在时才加封面输入
        if let Some(cover_path) = cover {
            let cover = cover_path.as_ref();
            if !cover.exists() {
                return Err("封面图不存在".into());
            }
            //todo 临时反向操作
            if !is_mkv_dst {
                /* ======== MKV 附件模式 ======== */
                args.push("-attach".into());
                args.push(cover.to_string_lossy().into_owned());
                // 必须再映射一路“假视频流”才能 -map，否则 ffmpeg 会报错
                args.push("-map".into());
                args.push("0".into()); // 原视频全部流
                                       // 给附件写 MIME 类型和文件名（标签）
                args.push("-metadata:s:t".into());
                args.push("mimetype=image/jpeg".into());
                args.push("-metadata:s:t".into());
                args.push("filename=cover.jpg".into());
                // 告诉播放器“这是封面”
                args.push("-metadata".into());
                args.push("COVER_ART=1".into());
            } else {
                /* ======== MP4/其他 老逻辑 ======== */
                args.push("-i".into());
                args.push(cover.to_string_lossy().into_owned());
                args.push("-map".into());
                args.push("0".into());
                args.push("-map".into());
                args.push("1:v".into());
                args.push("-c".into());
                args.push("copy".into());
                args.push("-disposition:v:1".into());
                args.push("attached_pic".into());
            }
        } else {
            // 无封面，直接 copy
            args.push("-c".into());
            args.push("copy".into());
        }

        // 写入元数据
        for (k, v) in meta {
            args.push("-metadata".into());
            args.push(format!("{}={}", k, v));
        }

        args.push("-y".into());
        args.push(dst.to_string_lossy().into_owned());

        let out = Command::new("ffmpeg")
            .args(&args)
            .output()
            .map_err(|e| format!("FFmpeg 启动失败: {}", e))?;

        if !out.status.success() {
            let err = String::from_utf8_lossy(&out.stderr);
            return Err(format!("FFmpeg 执行失败: {}", err));
        }
        info!("嵌入完成");
        Ok(())
    })
    .await
    .map_err(|e| format!("任务 join 失败: {}", e))?
}

// —————— 小工具函数 ——————
/// 把 ffprobe 的 "30/1" 或 "30000/1001" 解析成 f64
fn eval_fps(s: &str) -> Option<f64> {
    let parts: Vec<&str> = s.split('/').collect();
    match parts.len() {
        1 => s.parse().ok(),
        2 => {
            let n: f64 = parts[0].parse().ok()?;
            let d: f64 = parts[1].parse().ok()?;
            Some(n / d)
        }
        _ => None,
    }
}
fn extract_mkv_cover(video: &Path) -> Result<Option<String>, String> {
    info!("开始提取封面");
    let out = Command::new("ffmpeg")
        .args(&[
            "-i",
            &video.to_string_lossy(),
            "-map",
            "0:2", // 封面流索引（已知 2）
            "-update",
            "1", // 覆盖已存在文件
            "-y",
            "cover.jpg", // 输出文件名
        ])
        .output()
        .map_err(|e| format!("ffmpeg 导出封面失败: {}", e))?;

    if !out.status.success() {
        info!("抽取失败");
        return Err(String::from_utf8_lossy(&out.stderr).to_string());
    }

    let bytes = std::fs::read("cover.jpg").map_err(|e| format!("读取 cover.jpg 失败: {}", e))?;
    // 清理临时文件
    // std::fs::remove_file("cover.jpg").ok();
    Ok(Some(base64::encode(&bytes[..bytes.len().min(1_048_576)])))
}
/// 如果视频里已存在 attached_pic，就把它抽出来并 base64 编码（前 1 MB）
fn extract_cover_if_exists(video: &Path, streams: &[Stream]) -> Result<Option<String>, String> {
    // 找 disposition.attached_pic == 1 的视频流
    let pic_stream = streams.iter().find(|s| {
        s.codec_type == "video"
            && s.disposition
                .as_ref()
                .and_then(|d| d.get("attached_pic"))
                .and_then(|v| v.as_u64())
                .unwrap_or(0)
                == 1
    });
    if pic_stream.is_none() {
        return Ok(None);
    }
    info!("有图");
    // 用 ffmpeg 把封面抽成 jpeg 管道输出
    let out = Command::new("ffmpeg")
        .args(&[
            "-i",
            &video.to_string_lossy(),
            "-map",
            "0:v",
            "-c:v",
            "mjpeg", // 强制 jpeg
            "-f",
            "image2pipe",
            "-vframes",
            "1",
            "-q:v",
            "2", // 质量 2-31，2 最好
            "-",
        ])
        .output()
        .map_err(|e| format!("ffmpeg 封面抽取失败: {}", e))?;
    if !out.status.success() {
        return Err(String::from_utf8_lossy(&out.stderr).to_string());
    }
    // 只取前 1 MB，防止超大图
    let len = out.stdout.len().min(1_048_576);
    Ok(Some(base64::encode(&out.stdout[..len])))
}

/// 返回 16 位小写 hex，与 OpenSubtitles 官方算法一致
pub fn oshash(path: impl AsRef<Path>) -> io::Result<String> {
    const SAMPLE: usize = 64 * 1024; // 64 kB

    let mut file = File::open(path)?;
    let len = file.metadata()?.len();

    // 头 64 kB
    let mut head = vec![0; SAMPLE.min(len as usize)];
    file.read_exact(&mut head)?;

    // 尾 64 kB
    let mut tail = vec![0; SAMPLE.min(len as usize)];
    if len > SAMPLE as u64 {
        file.seek(io::SeekFrom::End(-(SAMPLE as i64)))?;
        file.read_exact(&mut tail)?;
    }

    let mut hasher = Sha256::new();
    hasher.update(&head);
    hasher.update(&tail);
    let hash = hasher.finalize();

    // 取前 8 字节 → 16 位 hex
    Ok(hex::encode(&hash[..8]))
}

fn is_mkv(p: &Path) -> bool {
    p.extension()
        .and_then(|s| s.to_str())
        .map(|e| e.eq_ignore_ascii_case("mkv"))
        .unwrap_or(false)
}
