use serde::Serialize;
use ts_rs::TS;
#[derive(TS, Serialize)]
#[ts(export, export_to = "../../src/lib/bindings/")]
#[serde(rename_all = "camelCase")]
pub struct VideoProbeDetailVo {
    pub path: String,
    pub title: String,
    pub subtitle: Option<String>,
    pub performers: Vec<String>,
    pub studio: Option<String>,
    pub code: Option<String>,
    pub tags: Vec<String>,
    pub country: String,
    pub duration: f64,
    pub width: u32,
    pub height: u32,
    pub base64_cover: Option<String>,
    #[ts(type = "number")]
    pub size: u64,
}
