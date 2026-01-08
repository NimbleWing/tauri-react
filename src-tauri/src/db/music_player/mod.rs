mod album;
mod artist;
mod playlist;
mod track;

use serde::Deserialize;
use sqlx::FromRow;

#[derive(FromRow)]
pub struct TrackRow {
    pub hash: String,
    pub path: String,
    pub name: String,
    pub extension: String,
    pub duration: i64,
    pub cover: Option<String>,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub album_artist: Option<String>,
    pub date: Option<String>,
    pub genre: Option<String>,
    pub rules: Option<String>,
    pub number: Option<i64>,
    #[sqlx(default)]
    pub position: Option<i64>,
    #[sqlx(default)]
    pub rank: Option<i64>,
}

#[derive(Deserialize)]
pub struct GetTracksFilters {
    pub album: Option<String>,
    pub artist: Option<String>,
}
