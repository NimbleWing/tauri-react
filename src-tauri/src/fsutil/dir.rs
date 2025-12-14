use std::path::PathBuf;

/// Returns a `PathBuf` representing a nested subdirectory structure derived from a pattern string.
///
/// This is commonly used to shard files by hash (e.g., SHA1) to avoid too many files in a single directory.
///
/// # Arguments
///
/// * `pattern` - A string (typically a hash) from which to derive directory names.
/// * `depth`   - Number of directory levels to create (must be ≥ 1).
/// * `length`  - Number of characters per level (must be ≥ 1).
///
/// # Returns
///
/// * `Some(PathBuf)` if valid parameters and enough characters in `pattern`.
/// * `None` if:
///   - `depth < 1`
///   - `length < 1`
///   - `pattern` is too short (`depth * length > pattern.len()`)
///
/// # Examples
///
/// ```
/// let path = get_intra_dir("0af63ce3c99162e9df23a997f62621c5", 2, 3);
/// assert_eq!(path, Some(PathBuf::from("0af/63c"))); // or "0af\\63c" on Windows
/// ```
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
