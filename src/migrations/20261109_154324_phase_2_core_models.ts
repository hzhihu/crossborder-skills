import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_skills_resource_type" AS ENUM('Skill', 'MCP Server', 'Agent', 'Workflow', 'Prompt', 'Tool');
  CREATE TYPE "public"."enum_skills_status" AS ENUM('draft', 'pending', 'published', 'rejected', 'archived');
  CREATE TYPE "public"."enum_tags_type" AS ENUM('business', 'technology');
  CREATE TYPE "public"."enum_tags_status" AS ENUM('active', 'archived');
  CREATE TYPE "public"."enum_collections_status" AS ENUM('draft', 'published', 'archived');
  CREATE TYPE "public"."enum_crawl_tasks_resource_type" AS ENUM('Skill', 'MCP Server', 'Agent', 'Workflow', 'Prompt', 'Tool');
  CREATE TYPE "public"."enum_crawl_tasks_task_type" AS ENUM('crawl', 'parse', 'ai', 'sync');
  CREATE TYPE "public"."enum_crawl_tasks_status" AS ENUM('queued', 'running', 'succeeded', 'needs_review', 'failed');
  CREATE TABLE "skills" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"name_zh" varchar,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"description_zh" varchar,
  	"content" varchar,
  	"raw_content" varchar,
  	"installation_instructions" varchar,
  	"icon_id" integer,
  	"problem_solved" varchar,
  	"applicable_scenarios" varchar,
  	"main_features" varchar,
  	"usage_prerequisites" varchar,
  	"recommendation_reason" varchar,
  	"resource_type" "enum_skills_resource_type" DEFAULT 'Skill' NOT NULL,
  	"source_url" varchar,
  	"repository_url" varchar,
  	"repository_path" varchar,
  	"repository_name" varchar,
  	"repository_full_name" varchar,
  	"owner" varchar,
  	"author" varchar,
  	"default_branch" varchar,
  	"stars" numeric,
  	"forks" numeric,
  	"repository_pushed_at" timestamp(3) with time zone,
  	"repository_updated_at" timestamp(3) with time zone,
  	"source_file_updated_at" timestamp(3) with time zone,
  	"status" "enum_skills_status" DEFAULT 'draft' NOT NULL,
  	"is_featured" boolean DEFAULT false NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"last_verified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "skills_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer,
  	"tags_id" integer,
  	"platforms_id" integer,
  	"tools_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"description" varchar,
  	"icon_id" integer,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"is_active" boolean DEFAULT true NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"type" "enum_tags_type" NOT NULL,
  	"description" varchar,
  	"status" "enum_tags_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "platforms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "collections_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"skill_id" integer NOT NULL,
  	"sort_order" numeric DEFAULT 0 NOT NULL
  );
  
  CREATE TABLE "collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"detailed_content" varchar,
  	"cover_image_id" integer,
  	"status" "enum_collections_status" DEFAULT 'draft' NOT NULL,
  	"sort_order" numeric DEFAULT 0 NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "skill_versions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"skill_id_id" integer NOT NULL,
  	"version" numeric NOT NULL,
  	"content_hash" varchar NOT NULL,
  	"raw_content" varchar NOT NULL,
  	"changelog" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "crawl_tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_url" varchar NOT NULL,
  	"repository_path" varchar,
  	"resource_type" "enum_crawl_tasks_resource_type" DEFAULT 'Skill',
  	"category_id" integer,
  	"task_type" "enum_crawl_tasks_task_type" DEFAULT 'crawl' NOT NULL,
  	"status" "enum_crawl_tasks_status" DEFAULT 'queued' NOT NULL,
  	"retry_of_id" integer,
  	"result" jsonb,
  	"error_message" varchar,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "skills_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "platforms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tools_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "collections_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "skill_versions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "crawl_tasks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "skills" ADD CONSTRAINT "skills_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_platforms_fk" FOREIGN KEY ("platforms_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "skills_rels" ADD CONSTRAINT "skills_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "collections_skills" ADD CONSTRAINT "collections_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "collections_skills" ADD CONSTRAINT "collections_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections" ADD CONSTRAINT "collections_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "skill_versions" ADD CONSTRAINT "skill_versions_skill_id_id_skills_id_fk" FOREIGN KEY ("skill_id_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crawl_tasks" ADD CONSTRAINT "crawl_tasks_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "crawl_tasks" ADD CONSTRAINT "crawl_tasks_retry_of_id_crawl_tasks_id_fk" FOREIGN KEY ("retry_of_id") REFERENCES "public"."crawl_tasks"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "skills_slug_idx" ON "skills" USING btree ("slug");
  CREATE INDEX "skills_icon_idx" ON "skills" USING btree ("icon_id");
  CREATE INDEX "skills_updated_at_idx" ON "skills" USING btree ("updated_at");
  CREATE INDEX "skills_created_at_idx" ON "skills" USING btree ("created_at");
  CREATE INDEX "skills_rels_order_idx" ON "skills_rels" USING btree ("order");
  CREATE INDEX "skills_rels_parent_idx" ON "skills_rels" USING btree ("parent_id");
  CREATE INDEX "skills_rels_path_idx" ON "skills_rels" USING btree ("path");
  CREATE INDEX "skills_rels_categories_id_idx" ON "skills_rels" USING btree ("categories_id");
  CREATE INDEX "skills_rels_tags_id_idx" ON "skills_rels" USING btree ("tags_id");
  CREATE INDEX "skills_rels_platforms_id_idx" ON "skills_rels" USING btree ("platforms_id");
  CREATE INDEX "skills_rels_tools_id_idx" ON "skills_rels" USING btree ("tools_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_icon_idx" ON "categories" USING btree ("icon_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "platforms_slug_idx" ON "platforms" USING btree ("slug");
  CREATE INDEX "platforms_updated_at_idx" ON "platforms" USING btree ("updated_at");
  CREATE INDEX "platforms_created_at_idx" ON "platforms" USING btree ("created_at");
  CREATE UNIQUE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");
  CREATE INDEX "tools_updated_at_idx" ON "tools" USING btree ("updated_at");
  CREATE INDEX "tools_created_at_idx" ON "tools" USING btree ("created_at");
  CREATE INDEX "collections_skills_order_idx" ON "collections_skills" USING btree ("_order");
  CREATE INDEX "collections_skills_parent_id_idx" ON "collections_skills" USING btree ("_parent_id");
  CREATE INDEX "collections_skills_skill_idx" ON "collections_skills" USING btree ("skill_id");
  CREATE UNIQUE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");
  CREATE INDEX "collections_cover_image_idx" ON "collections" USING btree ("cover_image_id");
  CREATE INDEX "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");
  CREATE INDEX "skill_versions_skill_id_idx" ON "skill_versions" USING btree ("skill_id_id");
  CREATE INDEX "skill_versions_updated_at_idx" ON "skill_versions" USING btree ("updated_at");
  CREATE INDEX "skill_versions_created_at_idx" ON "skill_versions" USING btree ("created_at");
  CREATE UNIQUE INDEX "skill_id_version_idx" ON "skill_versions" USING btree ("skill_id_id","version");
  CREATE INDEX "crawl_tasks_category_idx" ON "crawl_tasks" USING btree ("category_id");
  CREATE INDEX "crawl_tasks_retry_of_idx" ON "crawl_tasks" USING btree ("retry_of_id");
  CREATE INDEX "crawl_tasks_updated_at_idx" ON "crawl_tasks" USING btree ("updated_at");
  CREATE INDEX "crawl_tasks_created_at_idx" ON "crawl_tasks" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skills_fk" FOREIGN KEY ("skills_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_platforms_fk" FOREIGN KEY ("platforms_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tools_fk" FOREIGN KEY ("tools_id") REFERENCES "public"."tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_skill_versions_fk" FOREIGN KEY ("skill_versions_id") REFERENCES "public"."skill_versions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_crawl_tasks_fk" FOREIGN KEY ("crawl_tasks_id") REFERENCES "public"."crawl_tasks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_skills_id_idx" ON "payload_locked_documents_rels" USING btree ("skills_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_platforms_id_idx" ON "payload_locked_documents_rels" USING btree ("platforms_id");
  CREATE INDEX "payload_locked_documents_rels_tools_id_idx" ON "payload_locked_documents_rels" USING btree ("tools_id");
  CREATE INDEX "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");
  CREATE INDEX "payload_locked_documents_rels_skill_versions_id_idx" ON "payload_locked_documents_rels" USING btree ("skill_versions_id");
  CREATE INDEX "payload_locked_documents_rels_crawl_tasks_id_idx" ON "payload_locked_documents_rels" USING btree ("crawl_tasks_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "skills_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "collections_skills" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "collections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "skill_versions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "crawl_tasks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "skills" CASCADE;
  DROP TABLE "skills_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "platforms" CASCADE;
  DROP TABLE "tools" CASCADE;
  DROP TABLE "collections_skills" CASCADE;
  DROP TABLE "collections" CASCADE;
  DROP TABLE "skill_versions" CASCADE;
  DROP TABLE "crawl_tasks" CASCADE;
  DROP TABLE "media" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_skills_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_platforms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tools_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_collections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_skill_versions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_crawl_tasks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  DROP INDEX "payload_locked_documents_rels_skills_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_platforms_id_idx";
  DROP INDEX "payload_locked_documents_rels_tools_id_idx";
  DROP INDEX "payload_locked_documents_rels_collections_id_idx";
  DROP INDEX "payload_locked_documents_rels_skill_versions_id_idx";
  DROP INDEX "payload_locked_documents_rels_crawl_tasks_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "skills_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "platforms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tools_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "collections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "skill_versions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "crawl_tasks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  DROP TYPE "public"."enum_skills_resource_type";
  DROP TYPE "public"."enum_skills_status";
  DROP TYPE "public"."enum_tags_type";
  DROP TYPE "public"."enum_tags_status";
  DROP TYPE "public"."enum_collections_status";
  DROP TYPE "public"."enum_crawl_tasks_resource_type";
  DROP TYPE "public"."enum_crawl_tasks_task_type";
  DROP TYPE "public"."enum_crawl_tasks_status";`)
}
