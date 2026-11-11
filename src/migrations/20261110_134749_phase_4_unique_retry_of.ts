import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
    await db.execute(sql`
        DROP INDEX IF EXISTS "crawl_tasks_retry_of_idx";
        CREATE UNIQUE INDEX "retry_of_idx" ON "crawl_tasks" ("retry_of_id");
        CREATE INDEX "crawl_tasks_retry_of_idx" ON "crawl_tasks" ("retry_of_id");
    `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
    await db.execute(sql`
        DROP INDEX IF EXISTS "retry_of_idx";
        DROP INDEX IF EXISTS "crawl_tasks_retry_of_idx";
        CREATE INDEX "crawl_tasks_retry_of_idx" ON "crawl_tasks" ("retry_of_id");
    `)
}
