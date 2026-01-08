use std::sync::Arc;

use anyhow::Result;
use tauri::State;

use crate::{
    app::performer::{dto::CreatePerformerDto, vo::PerformerDetailVo},
    AppService,
};

#[tauri::command]
pub async fn performer_list(
    service: State<'_, Arc<AppService>>,
) -> Result<Vec<PerformerDetailVo>, String> {
    service.performer.list().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn performer_add(
    dto: CreatePerformerDto,
    service: State<'_, Arc<AppService>>,
) -> Result<i64, String> {
    service
        .performer
        .create(dto)
        .await
        .map_err(|e| e.to_string())
}
