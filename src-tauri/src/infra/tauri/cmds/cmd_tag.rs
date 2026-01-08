use std::sync::Arc;

use crate::app::tag::dto::CreateTagDto;
use crate::app::tag::vo::TagDetailVo;
use crate::AppService;
use anyhow::Result;
use tauri::State;

#[tauri::command]
pub async fn tag_list(service: State<'_, Arc<AppService>>) -> Result<Vec<TagDetailVo>, String> {
    service.tag.list().await.map_err(|e| e.to_string())
}
#[tauri::command]
pub async fn tag_add(
    dto: CreateTagDto,
    service: State<'_, Arc<AppService>>,
) -> Result<i64, String> {
    service.tag.create(dto).await.map_err(|e| e.to_string())
}
#[tauri::command]
pub async fn tag_delete(tag_id: i64, service: State<'_, Arc<AppService>>) -> Result<(), String> {
    service.tag.delete(tag_id).await.map_err(|e| e.to_string())
}
