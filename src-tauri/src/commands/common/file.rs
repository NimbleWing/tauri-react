use crate::fs::{self, FileMetadata};

#[tauri::command]
pub async fn common_file_metadata(file_path: &str) -> Result<FileMetadata, String> {
    println!("common_file_metadata: {}", file_path);
    fs::get_file_metadata(file_path)
}
