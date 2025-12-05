use crate::{studios::Studio, AppState, Error};
use base64::Engine as _;
use log::info;
use md5;
use tauri::State;
///获取所有工作室列表
#[tauri::command]
pub async fn hyp_studio_list(state: State<AppState, '_>) -> Result<Vec<Studio>, Error> {
    let res = state.db.hyp_studio_list(&state.blob_store).await?;

    Ok(res)
}

///新建工作室
#[tauri::command]
pub async fn hyp_studio_add(
    state: State<AppState, '_>,
    name: String,
    image: Option<String>,
) -> Result<(), Error> {
    let cover_checksum = if let Some(b64) = image {
        // 去 data:url 头
        let raw = b64
            .strip_prefix("data:image/")
            .and_then(|s| s.split_once(',').map(|(_, data)| data))
            .unwrap_or(&b64);

        let bytes = base64::engine::general_purpose::STANDARD
            .decode(raw)
            .map_err(|e| Error {
                message: format!("非法 base64: {}", e),
            })?;

        if bytes.is_empty() {
            return Err(Error {
                message: "封面不能为空".into(),
            });
        }

        // 计算 md5 字符串
        let checksum = format!("{:x}", md5::compute(&bytes));
        let blob_data = None;
        // ① 先写 blobs
        state
            .db
            .blob_add(&checksum, blob_data)
            .await
            .map_err(|e| Error {
                message: e.to_string(),
            })?;
        // 写 blob（BlobStore 内部自己再算一遍 md5 也行，或者你改接口传 checksum 进去）
        state
            .blob_store
            .write(&checksum, &bytes)
            .await
            .map_err(|e| Error {
                message: e.to_string(),
            })?;

        Some(checksum)
    } else {
        None
    };
    info!("新建工作室: {:?}", cover_checksum);
    state.db.hyp_studio_add(name, cover_checksum).await?;

    Ok(())
}
