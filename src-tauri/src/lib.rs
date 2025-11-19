// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
// mod commandes;
mod commands;
mod db;
mod players;
mod tracks;
mod utils;

use anyhow::Result;
use db::Db;
use parking_lot::Mutex;
use players::Player;
use rodio::{OutputStream, Sink};
use serde::Serialize;
use std::sync::Arc;
use tauri::{Builder, Emitter, Manager};
use tokio::runtime::Handle as RuntimeHandle;
use tracks::Track;
pub async fn run() -> Result<()> {
    let (_stream, handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&handle)?;
    let player = Arc::new(Mutex::new(Player::new(sink)?));

    let (_stream, handle) = OutputStream::try_default()?;
    let sink = Sink::try_new(&handle)?;
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
            app.manage(AppState { db, player });
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}

struct AppState {
    db: Db,
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
