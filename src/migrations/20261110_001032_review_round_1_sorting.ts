import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "skills" ADD COLUMN "stars_for_sort" numeric DEFAULT -1 NOT NULL;
  UPDATE "skills" SET "stars_for_sort" = "stars" WHERE "stars" IS NOT NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "skills" DROP COLUMN "stars_for_sort";`)
}
