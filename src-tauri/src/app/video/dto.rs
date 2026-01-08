use std::path::PathBuf;

use serde::Deserialize;
#[derive(Debug, Deserialize)]
pub struct VideoMetadata {
    pub title: String,
    pub subtitle: Option<String>,
    pub performers: String,
    pub studio: Option<String>,
    pub code: Option<String>,
    pub tags: String,
    pub rating: String,
    pub country: String,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoEmbedDto {
    pub video_path: PathBuf,
    pub save_dir: PathBuf,

    pub cover_path: Option<PathBuf>,
    pub metadata: VideoMetadata,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VideoScanDirDto {
    pub dir_path: PathBuf,
}
