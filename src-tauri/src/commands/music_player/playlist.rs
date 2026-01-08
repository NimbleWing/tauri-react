use crate::tracks::Track;
use crate::{AppState, Error};
use tauri::State;

/// 获取所有歌单名称列表（仅返回名称，不含曲目）
#[tauri::command]
pub async fn mp_playlist_list(state: State<AppState, '_>) -> Result<Vec<String>, Error> {
    let res = state.db.get_playlists().await?;

    Ok(res)
}

/// 新建空歌单
#[tauri::command]
pub async fn mp_playlist_create(state: State<AppState, '_>, name: String) -> Result<(), Error> {
    state.db.add_playlist(name).await?;

    Ok(())
}

/// 重命名歌单
#[tauri::command]
pub async fn mp_playlist_rename(
    state: State<AppState, '_>,
    name: String,
    new_name: String,
) -> Result<(), Error> {
    state.db.rename_playlist(name, new_name).await?;

    Ok(())
}

/// 删除整个歌单（会同时清空内部曲目）
#[tauri::command]
pub async fn mp_playlist_delete(state: State<AppState, '_>, name: String) -> Result<(), Error> {
    state.db.remove_playlist(name).await?;

    Ok(())
}

/// 获取指定歌单里的所有曲目（按顺序返回）
#[tauri::command]
pub async fn mp_playlist_tracks(
    state: State<AppState, '_>,
    name: String,
) -> Result<Vec<Track>, Error> {
    let res = state.db.get_playlist_tracks(name).await?;

    Ok(res)
}

/// 向歌单追加一批曲目（去重由 DB 层负责）
#[tauri::command]
pub async fn mp_playlist_tracks_add(
    state: State<AppState, '_>,
    name: String,
    hashes: Vec<String>,
) -> Result<(), Error> {
    state.db.add_playlist_tracks(name, &hashes).await?;

    Ok(())
}

/// 从歌单移除一批曲目；hashes = None 时清空全部
#[tauri::command]
pub async fn mp_playlist_tracks_remove(
    state: State<AppState, '_>,
    name: String,
    hashes: Option<Vec<String>>,
) -> Result<(), Error> {
    state
        .db
        .remove_playlist_tracks(name, hashes.as_deref())
        .await?;

    Ok(())
}

/// 拖拽排序：把指定 hash 的曲目从 src 位置移到 dst 位置
#[tauri::command]
pub async fn mp_playlist_tracks_reorder(
    state: State<AppState, '_>,
    name: String,
    hash: String,
    src: i64,
    dst: i64,
) -> Result<(), Error> {
    state
        .db
        .reorder_playlist_track(name, hash, src, dst)
        .await?;

    Ok(())
}
