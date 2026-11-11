# 部署说明

## 1. 当前状态

Phase 1 已提供 `.env.example`、多阶段 `Dockerfile`、`compose.yaml` 和初始数据库迁移，并已在本机验证应用、PostgreSQL、迁移和 Worker 启动。

Phase 1 至 Phase 6 已完成，包括本机隔离生产模式部署、真实 Worker、媒体持久化和完整业务回归验收。产品负责人已于 2026-11-11 确认公网 Linux 主机、域名和公网网络配置移到后续实际发布时执行；当前完成不代表已经公网上线。当前使用本地持久化媒体存储，S3 和备份恢复均移到后续重新评估。

依赖安全覆盖后已无高危或严重审计项；截至 Phase 2 P0 完成时有 10 项低危和 16 项中危间接依赖报告。Phase 6 于 2026-11-11 重新执行生产依赖审计，报告 9 项低危和 5 项中危间接依赖，无高危或严重项；npm 提供的强制修复会安装不兼容的 Payload 旧版本，因此未自动执行，后续继续跟踪上游修复。

Phase 2 已验证本地 Payload Media 上传与 Docker 持久化卷；S3 环境配置已接入，但未使用真实 S3 服务验证。

## 2. Phase 1 已验证的启动方式

复制 `.env.example` 为 `.env` 并替换全部占位凭据后执行：

```bash
docker compose up -d --build
docker compose ps
```

`migrate` 服务先执行 Payload 数据库迁移并以退出码 `0` 结束，随后启动 `app` 和 `worker`。应用地址为 `http://localhost:3000`，后台地址为 `http://localhost:3000/admin`。

Worker 使用 `PAYLOAD_JOBS_CRON` 每分钟检查已创建任务，不执行定时资源同步。`systemHealthCheck` 只用于启用和验证 Jobs 基础设施；`crawlSkill` 负责公开 GitHub 与 Skills.sh 来源的异步采集，采集成功也不会自动发布 Skill。

## 3. 部署范围

第一版使用 Docker Compose 部署 Next.js + Payload CMS 模块化单体，并确保 PostgreSQL 和 Payload Jobs Worker 正常运行。

生产部署拓扑已于 2026-11-10 确认为单台 Linux 主机运行 Docker Compose：`app` 承载 Next.js 与 Payload Admin，`worker` 执行 Payload Jobs，`db` 运行 PostgreSQL 并使用持久化卷，`migrate` 执行一次性数据库迁移。第一版不引入 Kubernetes、微服务或多主机高可用；单台主机故障时，网站和后台会暂时不可用。

镜像版本策略已于 2026-11-10 确认：应用基础镜像继续使用 `node:24.22.1-alpine`，数据库继续使用 `postgres:18-alpine`。Phase 6 已于 2026-11-11 在本机隔离环境固定并验证 Node.js digest `sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53` 和 PostgreSQL digest `sha256:123b17998ccaf47e53b502e8c6a1e79afd8f579c6f3eec83c563da026f957395`，Dockerfile 和 Compose 均保留标签并固定 digest。后续升级必须人工执行，并重新验证构建、迁移和核心流程，不自动升级生产环境。

生产主机策略已于 2026-11-10 确认为不指定云服务商；主机使用 Linux，支持 Docker 和 Docker Compose，能够持久化 PostgreSQL 数据卷，并可配置环境变量和必要网络访问。2026-11-11 已确认实际公网主机部署移到后续发布时执行，届时记录服务商、主机环境和验证结果；主机购买、域名、备案及公网网络配置不属于当前已完成范围。

初始生产资源建议已于 2026-11-10 确认为 2 vCPU、4 GB 内存和 40 GB 持久化磁盘，仅作为第一版单机部署的起点，不构成不同数据量和并发量下的固定容量承诺。当前不在 Docker Compose 中写死容器 CPU 和内存限制；Phase 6 根据构建、迁移、采集任务和公开页面的实际验证结果调整，磁盘不足时优先处理备份、日志和媒体文件保留，不删除业务历史版本。

文件存储通过环境变量选择 `local` 或 `s3`。当前阶段已于 2026-11-11 由产品负责人确认先使用本地持久化卷，生产环境也设置 `STORAGE_DRIVER=local`，真实 S3 验证不阻塞当前 Phase 6；后续生产环境稳定后再重新评估 S3，不提前实施切换。生产使用本地存储时必须提供持久化卷。

备份周期、保留策略和恢复验证已于 2026-11-10 由产品负责人确认移到后续版本，不属于当前 MVP 实施和验收范围；当前交付不得声称已具备备份或恢复能力。

## 4. 配置与操作说明

复制 `.env.example` 为 `.env`，替换 `POSTGRES_PASSWORD`、`PAYLOAD_SECRET` 和 `PAYLOAD_ADMIN_PASSWORD` 等占位值；真实凭据不得写入文档或版本库。PostgreSQL 数据库名、用户和密码通过 `POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD` 配置，Compose 自动组装容器内的 `DATABASE_URL`。

`NEXT_PUBLIC_SERVER_URL` 和 `SITE_URL` 使用实际站点地址；`HOME_RECENT_DAYS`、`CRAWL_MAX_RETRIES`、`CRAWL_TIMEOUT_MS` 和 `CRAWL_MAX_MARKDOWN_BYTES` 控制首页统计与采集限制。GitHub Token 为可选配置，只用于读取公开仓库，未认证请求受到限流时可配置 `GITHUB_TOKEN`。P1 LLM 尚未实施，当前不需要 LLM 环境变量。

```bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 app worker
docker compose down
```

`migrate` 在 `app` 和 `worker` 启动前自动执行 PostgreSQL 迁移；常规停止和重启不要添加 `--volumes`，避免删除数据库。升级镜像或代码前使用独立环境验证，再执行 `docker compose up -d --build`，检查迁移、前台、后台和 Worker；不得自动升级生产镜像。

`STORAGE_DRIVER` 可设为 `local` 或 `s3`，当前部署必须显式设置 `STORAGE_DRIVER=local`；未设置时程序默认开发使用 `local`、生产使用 `s3`，不得依赖该生产默认值。本地存储使用 `LOCAL_STORAGE_DIR` 和持久化卷；后续重新评估并启用 S3 时必须配置 `S3_BUCKET`、`S3_REGION`、`S3_ACCESS_KEY_ID`、`S3_SECRET_ACCESS_KEY`，并按服务要求配置 `S3_ENDPOINT` 和 `S3_FORCE_PATH_STYLE`。当前只完成本地媒体真实验证，真实 S3 尚未执行。

前台健康检查访问 `/`，后台检查 `/admin` 登录及 `noindex`，Worker 通过真实异步任务状态确认执行结果，不能只以容器进程存在判定业务正常。

## 5. 部署验收

在干净环境按最终步骤启动完整项目，确认数据库连接、前台访问、后台登录、异步任务和文件存储正常。

备份与恢复验证不属于当前 MVP 验收，后续版本重新确认方案后单独验收。

验收结果记录于[验收标准](ACCEPTANCE.md#9-部署与交付验收)的 D-01 至 D-06。

## 6. Phase 6 本机隔离部署记录（2026-11-11）

使用独立 Compose 项目 `crossborder-skills-phase6`、全新 PostgreSQL 与媒体卷及临时端口完成部署，未停止或复用原环境数据。`node:24.22.1-alpine` 和 `postgres:18-alpine` 使用本节固定的 digest，应用生产镜像构建成功，全部既有迁移在空数据库执行成功。

首页、`/admin`、`/robots.txt` 和 `/sitemap.xml` 均返回 HTTP 200，后台包含 `noindex, nofollow`。首位管理员创建和登录成功；PNG 媒体上传返回 201，下载内容与原文件一致，重启 `app` 和 `worker` 后仍可读取，证明本地持久化卷生效。

通过管理员 API 创建公开 GitHub `anthropics/skills` 的指定文件采集任务，Worker 异步执行后任务 1 状态为 `succeeded`，创建 Skill 1、首个版本和原始内容，未自动发布。该结果证明隔离环境的应用、数据库、迁移、Worker 和本地媒体链路可用。

本次为本机隔离验收，不是公网 Linux 主机生产部署；真实 S3、域名和公网网络未执行。产品负责人已确认这些公网事项移到后续实际发布时处理，并据此完成当前 Phase 6。验收容器与数据卷在记录完成后清理，临时凭据不写入仓库。
