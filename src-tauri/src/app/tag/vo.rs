use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TagDetailVo {
    pub id: i64,
    pub name: String,
    pub sort_name: Option<String>,
}
