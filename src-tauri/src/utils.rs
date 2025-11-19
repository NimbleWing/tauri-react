pub fn hash(value: &[u8]) -> String {
  blake3::hash(value).to_string()
}
