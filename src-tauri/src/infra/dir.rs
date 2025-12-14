use std::path::PathBuf;

pub fn get_intra_dir(pattern: &str, depth: usize, length: usize) -> Option<PathBuf> {
    if depth == 0 || length == 0 {
        return None;
    }

    let total_needed = depth.checked_mul(length)?;
    if total_needed > pattern.len() {
        return None;
    }

    let mut path = PathBuf::new();

    for i in 0..depth {
        let start = i * length;
        let end = start + length;
        let segment = &pattern[start..end];
        path.push(segment);
    }
    Some(path)
}
const BLOBS_DIR_DEPTH: usize = 2;
const BLOBS_DIR_LENGTH: usize = 2;
pub fn checksum_to_path(checksum: &str) -> Option<PathBuf> {
    let intra = get_intra_dir(checksum, BLOBS_DIR_DEPTH, BLOBS_DIR_LENGTH)?;
    let mut path = PathBuf::from("d:\\hyp\\blobs");
    path.push(intra);
    path.push(checksum);
    Some(path)
}
