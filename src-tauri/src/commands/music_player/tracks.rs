use crate::db::GetTracksFilters;
use crate::tracks::Track;
use crate::{AppState, Error};
use tauri::State;
/// 按过滤条件批量获取曲目
#[tauri::command]
pub async fn mp_track_list(
    state: State<AppState, '_>,
    filters: GetTracksFilters,
) -> Result<Vec<Track>, Error> {
    let res = state.db.get_tracks(&filters).await?;

    Ok(res)
}

/// 根据 hash 获取单条曲目
#[tauri::command]
pub async fn mp_track_get(
    state: State<AppState, '_>,
    hash: String,
) -> Result<Option<Track>, Error> {
    let res = state.db.get_track(&hash).await?;

    Ok(res)
}
