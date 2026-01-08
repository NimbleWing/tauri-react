// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod app;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
mod dir;
mod fs;
mod infra;
use anyhow::Result;
use infra::tauri::cmds::*;
use log::info;
use serde::Serialize;
use std::sync::Arc;
use tauri::Manager;

use crate::{
    app::{blob, performer, studio, tag, video},
    infra::sqlite::pool::DbPool,
};
pub async fn run() -> Result<()> {
    info!("程序启动");
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let handle = app.handle();
            tauri::async_runtime::spawn(init_pool_on_setup(handle.clone()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            cmd_tag::tag_add,
            cmd_tag::tag_list,
            cmd_tag::tag_delete,
            cmd_tag::tag_update,
            cmd_studio::studio_add,
            cmd_studio::studio_list,
            cmd_performer::performer_add,
            cmd_performer::performer_list,
            cmd_video::video_embed,
            cmd_video::video_scan,
            cmd_video::video_cover,
            cmd_video::video_probe,
            cmd_video::video_list_probe,
            cmd_video::check_folder_exists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
async fn init_pool_on_setup(app_handle: tauri::AppHandle) {
    match infra::sqlite::pool::init_pool(&app_handle).await {
        Ok(pool) => {
            let state = Arc::new(AppService::new(pool));
            app_handle.manage(state);
        }
        Err(e) => {
            log::error!("Failed to initialize database: {}", e)
            // 可选：弹窗、退出等
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Error {
    message: String,
}

impl From<anyhow::Error> for Error {
    fn from(err: anyhow::Error) -> Self {
        print!("{}", err);
        Self {
            message: err.to_string(),
        }
    }
}

pub struct AppService {
    pub blob: Arc<blob::BlobService>,
    pub studio: Arc<studio::StudioService>,
    pub tag: Arc<tag::TagService>,
    pub performer: Arc<performer::PerformerService>,
    pub video: Arc<video::VideoService>,
}
impl AppService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            blob: Arc::new(blob::BlobService),
            studio: Arc::new(studio::StudioService::new(pool.clone())),
            tag: Arc::new(tag::TagService::new(pool.clone())),
            performer: Arc::new(performer::PerformerService::new(pool.clone())),
            video: Arc::new(video::VideoService::new(pool.clone())),
        }
    }
}
