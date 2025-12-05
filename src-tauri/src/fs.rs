use std::{fs, path::Path};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMetadata {
    pub path: String,
    pub file_name: String,
    pub mine_type: String,
    pub extension: String,
    pub size: u64,
}

pub fn get_file_metadata(path: &str) -> Result<FileMetadata, String> {
    let metadata_ref = fs::metadata(path);
    if metadata_ref.is_err() {
        return Err(String::from("File does not exist in the given path"));
    }

    let metadata = metadata_ref.unwrap();
    let file_path = Path::new(path);
    let mine_type = infer::get_from_path(path).unwrap();
    Ok(FileMetadata {
        path: String::from(path),
        file_name: String::from(file_path.file_name().unwrap().to_str().unwrap()),
        mine_type: match mine_type {
            Some(m) => m.to_string(),
            None => String::from(""),
        },
        extension: String::from(file_path.extension().unwrap().to_str().unwrap()),
        size: metadata.len(),
    })
}
