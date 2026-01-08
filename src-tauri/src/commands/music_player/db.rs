use crate::{AppState, Error};
use tauri::State;

/// 获取用户设置的音乐目录
#[tauri::command]
pub async fn mp_db_get_dirs(state: State<AppState, '_>) -> Result<Vec<String>, Error> {
    let res = state.db.get_dirs().await?;

    Ok(res)
}

/// 保存用户设置的目录列表（会覆盖旧值）
#[tauri::command]
pub async fn mp_db_set_dirs(state: State<AppState, '_>, dirs: Vec<String>) -> Result<(), Error> {
    state.db.set_dirs(&dirs).await?;

    Ok(())
}

/// 立即扫描已配置的目录，返回扫描结果摘要
#[tauri::command]
pub async fn mp_db_scan_dirs(state: State<AppState, '_>) -> Result<String, Error> {
    let dirs = state.db.get_dirs().await?;
    let res = state.db.scan_dirs(&dirs).await?;
    Ok(res)
}
