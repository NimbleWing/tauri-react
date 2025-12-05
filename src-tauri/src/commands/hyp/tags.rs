use tauri::State;

use crate::{tags::Tag, AppState, Error};

///获取所有标签名称列表
#[tauri::command]
pub async fn hyp_tag_list(state: State<AppState, '_>) -> Result<Vec<Tag>, Error> {
    let res = state.db.hyp_tag_list().await?;

    Ok(res)
}

///新建标签
#[tauri::command]
pub async fn hyp_tag_add(
    state: State<AppState, '_>,
    name: String,
    sort_name: String,
) -> Result<(), Error> {
    state.db.hyp_tag_add(name, sort_name).await?;

    Ok(())
}
