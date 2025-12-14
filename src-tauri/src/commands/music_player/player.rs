use crate::{AppState, Error};
use std::path::PathBuf;
use tauri::State;

/// 当前是否处于暂停状态
#[tauri::command]
pub fn mp_player_is_paused(state: State<AppState, '_>) -> Result<bool, Error> {
    let res = state.player.lock().is_paused();

    Ok(res)
}

/// 设置播放音量 (0.0 ~ 1.0)
#[tauri::command]
pub fn mp_player_set_volume(state: State<AppState, '_>, volume: f32) -> Result<(), Error> {
    state.player.lock().set_volume(volume);

    Ok(())
}

/// 替换整队播放列表
#[tauri::command]
pub fn mp_player_set_queue(state: State<AppState, '_>, queue: Vec<PathBuf>) -> Result<(), Error> {
    state.player.lock().set_queue(queue);

    Ok(())
}

/// 开始 / 继续播放
#[tauri::command]
pub fn mp_player_play(state: State<AppState, '_>) -> Result<(), Error> {
    println!("player_play");
    state.player.lock().play();

    Ok(())
}

/// 暂停
#[tauri::command]
pub fn mp_player_pause(state: State<AppState, '_>) -> Result<(), Error> {
    println!("player_pause");
    state.player.lock().pause();

    Ok(())
}

/// 停止并清空当前播放状态
#[tauri::command]
pub fn mp_player_stop(state: State<AppState, '_>) -> Result<(), Error> {
    println!("player_stop");
    state.player.lock().stop();

    Ok(())
}

/// 跳到队列指定索引
#[tauri::command]
pub fn mp_player_goto(state: State<AppState, '_>, index: usize) -> Result<(), Error> {
    state.player.lock().goto(index)?;

    Ok(())
}

/// 定位到当前歌曲的 elapsed 秒
#[tauri::command]
pub fn mp_player_seek(state: State<AppState, '_>, elapsed: u64) -> Result<(), Error> {
    state.player.lock().seek(elapsed)?;

    Ok(())
}

/// 设置当前播放索引（不触发 play，仅指针移动）
#[tauri::command]
pub fn mp_player_set_current(state: State<AppState, '_>, index: usize) -> Result<(), Error> {
    state.player.lock().set_current(index)?;

    Ok(())
}
