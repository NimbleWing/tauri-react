use tauri::State;

use crate::{performers::Performer, AppState, Error};

///获取所有演员列表
#[tauri::command]
pub async fn hyp_performer_list(state: State<AppState, '_>) -> Result<Vec<Performer>, Error> {
    let res = state.db.hyp_performer_list().await?;

    Ok(res)
}

///新建演员
#[tauri::command]
pub async fn hyp_performer_add(state: State<AppState, '_>, name: String) -> Result<(), Error> {
    state.db.hyp_performer_add(name).await?;

    Ok(())
}
