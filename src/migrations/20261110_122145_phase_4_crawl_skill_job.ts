import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'crawlSkill' BEFORE 'systemHealthCheck';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'crawlSkill' BEFORE 'systemHealthCheck';`)
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  const crawlJobs = await payload.find({
    collection: 'payload-jobs',
    limit: 1,
    overrideAccess: true,
    where: { taskSlug: { equals: 'crawlSkill' } },
  })
  if (crawlJobs.totalDocs > 0) {
    throw new Error('存在 crawlSkill 任务记录，为保护任务历史，不能回滚该枚举迁移。')
  }

  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'systemHealthCheck');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'systemHealthCheck');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";`)
}
