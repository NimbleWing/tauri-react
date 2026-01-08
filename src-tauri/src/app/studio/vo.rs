use std::path::PathBuf;

use serde::Serialize;

use crate::app::tag::vo::TagDetailVo;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StudioDetailVo {
    pub id: i64,
    pub name: String,
    pub url: Option<String>,
    pub image_path: Option<PathBuf>,
    pub tags: Vec<TagDetailVo>,
}
