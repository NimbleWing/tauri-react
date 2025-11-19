CREATE TABLE IF NOT EXISTS dirs (
    path    TEXT    PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS tracks (
    hash            TEXT        PRIMARY KEY,
    path            TEXT        NOT NULL,
    name            TEXT        NOT NULL,
    extension       TEXT        NOT NULL,
    duration        INTEGER     NOT NULL,
    cover           TEXT,
    title           TEXT,
    artist          TEXT,
    album           TEXT,
    album_artist    TEXT,
    date            TEXT,
    genre           TEXT,
    number          INTEGER
);
CREATE TABLE IF NOT EXISTS playlists (
    name    TEXT    PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_name   TEXT        NOT NULL,
    track_hash      TEXT        NOT NULL,
    position        INTEGER     NOT NULL,

    PRIMARY KEY (playlist_name, track_hash),
    FOREIGN KEY (playlist_name) REFERENCES playlists(name)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS ruleset (
    id              INTEGER     PRIMARY KEY AUTOINCREMENT,
    track_hash      TEXT        NOT NULL,
    rules           TEXT        NOT NULL
);
