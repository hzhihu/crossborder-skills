import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "crawl_tasks" ADD COLUMN "skill_id" integer;
  ALTER TABLE "crawl_tasks" ADD CONSTRAINT "crawl_tasks_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "repository_url_repository_path_idx" ON "skills" USING btree ("repository_url","repository_path");
  CREATE INDEX "crawl_tasks_skill_idx" ON "crawl_tasks" USING btree ("skill_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "crawl_tasks" DROP CONSTRAINT "crawl_tasks_skill_id_skills_id_fk";
  
  DROP INDEX "repository_url_repository_path_idx";
  DROP INDEX "crawl_tasks_skill_idx";
  ALTER TABLE "crawl_tasks" DROP COLUMN "skill_id";`)
}
