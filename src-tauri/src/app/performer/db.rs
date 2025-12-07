use anyhow::Result;
use chrono::Utc;

use crate::{app::performer::dto::PerformerDto, infra::sqlite::pool::DbPool};

pub async fn list(pool: &DbPool) -> Result<Vec<PerformerDto>> {
    let rows: Vec<PerformerDto> = sqlx::query_as!(
        PerformerDto,
        r#"
          SELECT
            id,
            name
          FROM
            performers
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
          INSERT INTO performers (name,  created_at,updated_at)
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
