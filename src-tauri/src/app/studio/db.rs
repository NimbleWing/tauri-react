use crate::{app::studio::dto::StudioDto, infra::sqlite::pool::DbPool};
use anyhow::Result;
use chrono::Utc;

pub async fn list(pool: &DbPool) -> Result<Vec<StudioDto>> {
    let rows: Vec<StudioDto> = sqlx::query_as!(
        StudioDto,
        r#"
          SELECT
            id,
            name
          FROM
            studios
        "#
    )
    .fetch_all(&**pool)
    .await?;
    Ok(rows)
}
pub async fn add(pool: &DbPool, name: &str) -> Result<()> {
    let now = Utc::now().to_rfc3339();
    sqlx::query!(
        r#"
          INSERT INTO studios (name,  created_at,updated_at)
              VALUES (?, ?, ?)
        "#,
        name,
        now,
        now
    )
    .execute(&**pool)
    .await?;
    Ok(())
}
