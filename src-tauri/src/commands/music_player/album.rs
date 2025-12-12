use crate::tracks::Album;
use crate::{AppState, Error};
use tauri::State;

/// 获取全部专辑（按专辑名聚合）
#[tauri::command]
pub async fn mp_album_list(state: State<AppState, '_>) -> Result<Vec<Album>, Error> {
    let res = state.db.get_albums().await?;

    Ok(res)
}
