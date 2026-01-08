// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
// #[tokio::main]
// async fn main() {
//     // 处理 lib 返回的 Result
//     if let Err(e) = tauri_app_lib::run().await {
//         eprintln!("应用启动失败: {}", e.message);
//         std::process::exit(1); // 非零退出码表示错误
//     }
// }
use tauri_app_lib::{run, Error};

#[tokio::main] // ✅ 必须添加这个属性宏
async fn main() -> Result<(), Error> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    // ✅ 返回 Result
    // ✅ 现在可以正确调用 lib.rs 的 run 函数
    run().await?;
    Ok(())
}
