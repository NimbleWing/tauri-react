-- Add migration script here
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

CREATE TABLE IF NOT EXISTS tags (
  id                INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name              VARCHAR(255) NOT NULL,
  sort_name         Text,
  created_at        DATETIME NOT NULL,
  updated_at        DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS studios (
  id               INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name             TEXT NOT NULL,
  url              TEXT,
  created_at       DATETIME NOT NULL,
  updated_at       DATETIME NOT NULL,
  image_blob       TEXT REFERENCES `blobs`(`checksum`)
);
CREATE TABLE IF NOT EXISTS `studios_tags` (
  `studio_id` integer NOT NULL,
  `tag_id` integer NOT NULL,
  foreign key(`studio_id`) references `studios`(`id`) on delete CASCADE,
  foreign key(`tag_id`) references `tags`(`id`) on delete CASCADE,
  PRIMARY KEY(`studio_id`, `tag_id`)
);

CREATE TABLE IF NOT EXISTS performers (
  id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  country         TEXT,
  rating          TINYINT DEFAULT 0,
  `image_blob`    TEXT REFERENCES `blobs`(`checksum`),
  created_at      DATETIME NOT NULL,
  updated_at      DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "performers_tags" (
  `performer_id` integer NOT NULL,
  `tag_id` integer NOT NULL,
  foreign key(`performer_id`) references `performers`(`id`) on delete CASCADE,
  foreign key(`tag_id`) references `tags`(`id`) on delete CASCADE,
  PRIMARY KEY(`performer_id`, `tag_id`)
);
CREATE TABLE IF NOT EXISTS "performers_scenes" (
  `performer_id` integer,
  `scene_id` integer,
  foreign key(`performer_id`) references `performers`(`id`) on delete CASCADE,
  foreign key(`scene_id`) references `scenes`(`id`) on delete CASCADE,
  PRIMARY KEY (`scene_id`, `performer_id`)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_unique ON tags(name);

CREATE TABLE IF NOT EXISTS blobs (
    `checksum` varchar(255) NOT NULL PRIMARY KEY,
    `blob` blob
);
CREATE TABLE IF NOT EXISTS `folders` (
  `id` integer not null primary key autoincrement,
  `path` varchar(255) NOT NULL,
  `parent_folder_id` integer,
  `mod_time` datetime not null,
  `created_at` datetime not null,
  `updated_at` datetime not null,
  foreign key(`parent_folder_id`) references `folders`(`id`) on delete SET NULL
);
CREATE TABLE IF NOT EXISTS  `files` (
  `id` integer not null primary key autoincrement,
  `basename` varchar(255) NOT NULL,
  `parent_folder_id` integer not null,
  `size` integer NOT NULL,
  `mod_time` datetime not null,
  `created_at` datetime not null,
  `updated_at` datetime not null,
  foreign key(`parent_folder_id`) references `folders`(`id`),
  CHECK (`basename` != '')
);
CREATE TABLE IF NOT EXISTS  `files_fingerprints` (
  `file_id` integer NOT NULL,
  `type` varchar(255) NOT NULL,
  `fingerprint` blob NOT NULL,
  foreign key(`file_id`) references `files`(`id`) on delete CASCADE,
  PRIMARY KEY (`file_id`, `type`, `fingerprint`)
);
CREATE TABLE IF NOT EXISTS  `video_files` (
  `file_id` integer NOT NULL primary key,
  `duration` float NOT NULL,
	`video_codec` varchar(255) NOT NULL,
	`format` varchar(255) NOT NULL,
	`audio_codec` varchar(255) NOT NULL,
	`width` tinyint NOT NULL,
	`height` tinyint NOT NULL,
	`frame_rate` float NOT NULL,
	`bit_rate` integer NOT NULL,
  `interactive` boolean not null default '0',
  `interactive_speed` int,
  foreign key(`file_id`) references `files`(`id`) on delete CASCADE
);
CREATE TABLE IF NOT EXISTS  `scenes_files` (
    `scene_id` integer NOT NULL,
    `file_id` integer NOT NULL,
    `primary` boolean NOT NULL,
    foreign key(`scene_id`) references `scenes`(`id`) on delete CASCADE,
    foreign key(`file_id`) references `files`(`id`) on delete CASCADE,
    PRIMARY KEY(`scene_id`, `file_id`)
);
CREATE TABLE IF NOT EXISTS  `scenes` (
  `id` integer not null primary key autoincrement,

  `title` varchar(255),
  `subtitle` varchar(255),
  `details` text,
  `date` date,
  `rating` tinyint,

  `studio_id` integer,
  `code` TEXT,
  `cover_blob` TEXT REFERENCES `blobs`(`checksum`),
  `created_at` datetime not null,
  `updated_at` datetime not null,

  foreign key(`studio_id`) references `studios`(`id`) on delete SET NULL
);
CREATE TABLE IF NOT EXISTS `scenes_tags` (
  `scenes_id` integer NOT NULL,
  `tag_id` integer NOT NULL,
  foreign key(`scenes_id`) references `scenes`(`id`) on delete CASCADE,
  foreign key(`tag_id`) references `tags`(`id`) on delete CASCADE,
  PRIMARY KEY(`scenes_id`, `tag_id`)
);
CREATE TABLE IF NOT EXISTS `performers_scenes` (
  `performer_id` integer,
  `scene_id` integer,
  foreign key(`performer_id`) references `performers`(`id`),
  foreign key(`scene_id`) references `scenes`(`id`)
);
