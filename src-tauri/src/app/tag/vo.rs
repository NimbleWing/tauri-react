use serde::Serialize;
use ts_rs::TS;
#[derive(TS, Serialize)]
#[ts(export, export_to = "../../src/lib/bindings/")]
#[serde(rename_all = "camelCase")]
pub struct TagDetailVo {
    #[ts(type = "number")]
    pub id: i64,
    pub name: String,
    pub sort_name: Option<String>,
}
