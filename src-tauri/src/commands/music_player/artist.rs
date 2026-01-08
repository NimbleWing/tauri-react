use crate::{AppState, Error};
use tauri::State;

/// 获取全部艺术家（去重后字符串列表）
#[tauri::command]
pub async fn mp_artist_list(state: State<AppState, '_>) -> Result<Vec<String>, Error> {
    let res = state.db.get_artists().await?;

    Ok(res)
}
