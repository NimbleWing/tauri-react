use std::path::PathBuf;

pub struct DirEntry {
    pub path: PathBuf,
    pub is_dir: bool,
    pub size: u64,
    pub mtime: i64,
}
