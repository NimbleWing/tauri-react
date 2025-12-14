use std::path::PathBuf;

use crate::app::tag::vo::TagDetailVo;
use serde::Serialize;
use ts_rs::TS;

#[derive(TS, Serialize)]
#[ts(export, export_to = "../../src/lib/bindings/")]
#[serde(rename_all = "camelCase")]
pub struct PerformerDetailVo {
    #[ts(type = "number")]
    pub id: i64,
    pub name: String,
    #[ts(type = "number")]
    pub rating: Option<i64>,
    pub country: Option<String>,
    pub image_path: Option<PathBuf>,
    pub tags: Vec<TagDetailVo>,
}
