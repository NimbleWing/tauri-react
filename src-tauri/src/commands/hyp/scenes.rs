use tauri::State;

use crate::db::scenes::SceneItem;
use crate::{AppState, Error};

///获取所有场景列表
#[tauri::command]
pub async fn hyp_scene_list(state: State<AppState, '_>) -> Result<Vec<SceneItem>, Error> {
    let res = state.db.hyp_scene_list().await?;

    Ok(res)
}
