// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod app;
mod blob;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
// mod commandes;
mod commands;
mod db;
mod dir;
mod ffmpeg;
mod ffprobe;
mod fs;
mod fsutil;
mod infra;
mod players;
mod tracks;
mod utils;
mod video;

use anyhow::Result;
use db::Db;
use infra::tauri::cmds::*;
use log::info;
use parking_lot::Mutex;
use players::Player;
use rodio::{OutputStream, Sink};
use serde::Serialize;
use std::sync::Arc;
use tauri::Manager;
use tokio::runtime::Handle as RuntimeHandle;
use tracks::Track;
pub async fn run() -> Result<()> {
    info!("程序启动");
    let (_stream, handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&handle)?;
    let player = Arc::new(Mutex::new(Player::new(sink)?));

    let (_stream, handle) = OutputStream::try_default()?;
    let _sink = Sink::try_new(&handle)?;
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(move |app| {
            let tauri::Config { product_name, .. } = app.config();
            let name = product_name.as_deref().unwrap_or(env!("CARGO_PKG_NAME"));
            let data_path = app.path().document_dir()?.join(name);
            let covers_path = data_path.join("covers");
            let db = Db::new(data_path.join(format!("{name}.db")), &covers_path);
            // could always do this from UI side but, oh well
            tokio::task::block_in_place(|| RuntimeHandle::current().block_on(db.init()))?;
            if let Some(path) = std::env::args().nth(1) {
                if let Ok(track) = Track::new(path, &covers_path) {
                    player.lock().arbitrary_tracks.push(track);
                }
            }
            let blob_store = blob::FilesystemReader::new(covers_path);
            app.manage(AppState {
                db,
                player,
                blob_store,
            });
            let handle = app.handle();
            tauri::async_runtime::spawn(init_pool_on_setup(handle.clone()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::mp_db_get_dirs,
            commands::mp_db_scan_dirs,
            commands::mp_db_set_dirs,
            commands::mp_track_list,
            commands::mp_track_get,
            commands::mp_playlist_create,
            commands::mp_playlist_delete,
            commands::mp_playlist_list,
            commands::mp_playlist_rename,
            commands::mp_playlist_tracks,
            commands::mp_playlist_tracks_add,
            commands::mp_playlist_tracks_remove,
            commands::mp_playlist_tracks_reorder,
            commands::mp_album_list,
            commands::mp_artist_list,
            commands::mp_player_goto,
            commands::mp_player_is_paused,
            commands::mp_player_pause,
            commands::mp_player_play,
            commands::mp_player_stop,
            commands::mp_player_seek,
            commands::mp_player_set_queue,
            commands::mp_player_set_current,
            commands::mp_player_set_volume,
            commands::common_file_metadata,
            commands::video_info,
            commands::video_embed_cover_and_metadata,
            commands::video_scan,
            commands::hyp_scene_list,
            cmd_tag::tag_list,
            cmd_tag::tag_add,
            cmd_performer::performer_list,
            cmd_performer::performer_add,
            cmd_studio::studio_list,
            cmd_studio::studio_add,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
async fn init_pool_on_setup(app_handle: tauri::AppHandle) {
    match infra::sqlite::pool::init_pool(&app_handle).await {
        Ok(pool) => {
            app_handle.manage(pool); // 注入到 Tauri 状态管理
        }
        Err(e) => {
            eprintln!("Failed to initialize database: {}", e);
            // 可选：弹窗、退出等
        }
    }
}
#[derive(Clone)]
struct AppState {
    db: Db,
    blob_store: blob::FilesystemReader,
    player: Arc<Mutex<Player>>,
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
