# 部署说明

## 1. 当前状态

Phase 1 已提供 `.env.example`、多阶段 `Dockerfile`、`compose.yaml` 和初始数据库迁移，并已在本机验证应用、PostgreSQL、迁移和 Worker 启动。

当前已验证基础工程、Phase 2 P0 数据模型、Phase 3 P0 公开页面、Phase 4 P0 真实来源采集和 Phase 5 P0 人工审核，不代表 Phase 6 生产部署、S3 或完整业务验收已完成；备份恢复已移到后续版本。

依赖安全覆盖后已无高危或严重审计项；截至 Phase 2 P0 完成时有 10 项低危和 16 项中危间接依赖报告，未使用可能破坏固定版本的强制自动修复，后续需继续跟踪。

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

镜像版本策略已于 2026-11-10 确认：应用基础镜像继续使用 `node:24.22.1-alpine`，数据库继续使用 `postgres:18-alpine`，当前阶段不改变现有标签；Phase 6 实际部署时记录并固定验证通过的镜像 digest。后续升级必须人工执行，并重新验证构建、迁移和核心流程，不自动升级生产环境。

生产主机策略已于 2026-11-10 确认为不指定云服务商；主机使用 Linux，支持 Docker 和 Docker Compose，能够持久化 PostgreSQL 数据卷，并可配置环境变量和必要网络访问。Phase 6 记录实际服务商、主机环境和验证结果，主机购买、域名、备案及公网网络配置不在本次决策范围内。

初始生产资源建议已于 2026-11-10 确认为 2 vCPU、4 GB 内存和 40 GB 持久化磁盘，仅作为第一版单机部署的起点，不构成不同数据量和并发量下的固定容量承诺。当前不在 Docker Compose 中写死容器 CPU 和内存限制；Phase 6 根据构建、迁移、采集任务和公开页面的实际验证结果调整，磁盘不足时优先处理备份、日志和媒体文件保留，不删除业务历史版本。

文件存储通过环境变量选择 `local` 或 `s3`，默认开发使用本地存储、生产使用 S3，生产也允许配置本地存储。生产使用本地存储时必须提供持久化卷。

备份周期、保留策略和恢复验证已于 2026-11-10 由产品负责人确认移到后续版本，不属于当前 MVP 实施和验收范围；当前交付不得声称已具备备份或恢复能力。

## 4. Phase 6 必须补齐的内容

- 实际使用的环境变量、用途和必填性说明，不记录真实 Token 或密钥。
- Docker Compose 启动、停止、日志查看和升级步骤。
- PostgreSQL 连接、数据初始化和迁移步骤。
- 前台、Payload Admin 和 Jobs Worker 的运行检查。
- 本地与 S3 文件存储的环境变量、默认选择和切换步骤，以及生产本地存储的持久化说明；备份说明移到后续版本。
- GitHub REST API 和可选 LLM API 的配置及失败检查。
- 实际验证过的部署命令、验证结果和已知限制。

## 5. 部署验收

在干净环境按最终步骤启动完整项目，确认数据库连接、前台访问、后台登录、异步任务和文件存储正常。

备份与恢复验证不属于当前 MVP 验收，后续版本重新确认方案后单独验收。

验收结果记录于[验收标准](ACCEPTANCE.md#9-部署与交付验收)的 D-01 至 D-06。
