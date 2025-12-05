use sqlx::FromRow;

use crate::app::tag::model::Tag;

#[derive(FromRow)]
pub struct TagRow {
    pub id: i64,
    pub name: String,
}

impl From<TagRow> for Tag {
    fn from(row: TagRow) -> Self {
        Self {
            id: row.id,
            name: row.name,
        }
    }
}
