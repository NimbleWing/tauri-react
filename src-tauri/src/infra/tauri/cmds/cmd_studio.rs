use std::sync::Arc;
use tauri::State;

use crate::{
    app::studio::{dto::CreateStudioDto, StudioDetailVo},
    AppService,
};

#[tauri::command]
pub async fn studio_add(
    dto: CreateStudioDto,
    service: State<'_, Arc<AppService>>,
) -> Result<i64, String> {
    service.studio.create(dto).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn studio_list(
    service: State<'_, Arc<AppService>>,
) -> Result<Vec<StudioDetailVo>, String> {
    service.studio.list().await.map_err(|e| e.to_string())
}
