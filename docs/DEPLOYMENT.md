# 部署说明

## 1. 当前状态

Phase 1 已提供 `.env.example`、多阶段 `Dockerfile`、`compose.yaml` 和初始数据库迁移，并已在本机验证应用、PostgreSQL、迁移和 Worker 启动。

当前验证仅覆盖基础工程，不代表 Phase 6 生产部署、S3、备份恢复或完整业务验收已完成。

依赖安全覆盖后已无高危或严重审计项；截至 Phase 2 P0 完成时有 10 项低危和 16 项中危间接依赖报告，未使用可能破坏固定版本的强制自动修复，后续需继续跟踪。

Phase 2 已验证本地 Payload Media 上传与 Docker 持久化卷；S3 环境配置已接入，但未使用真实 S3 服务验证。

## 2. Phase 1 已验证的启动方式

复制 `.env.example` 为 `.env` 并替换全部占位凭据后执行：

```bash
docker compose up -d --build
docker compose ps
```

`migrate` 服务先执行 Payload 数据库迁移并以退出码 `0` 结束，随后启动 `app` 和 `worker`。应用地址为 `http://localhost:3000`，后台地址为 `http://localhost:3000/admin`。

Worker 使用 `PAYLOAD_JOBS_CRON` 每分钟检查已创建任务，不执行定时资源同步。当前 `systemHealthCheck` 只用于启用和验证 Jobs 基础设施，不是业务采集任务。

## 3. 部署范围

第一版使用 Docker Compose 部署 Next.js + Payload CMS 模块化单体，并确保 PostgreSQL 和 Payload Jobs Worker 正常运行。

文件存储通过环境变量选择 `local` 或 `s3`，默认开发使用本地存储、生产使用 S3，生产也允许配置本地存储。生产使用本地存储时必须提供持久化卷和备份；具体服务拓扑、镜像版本、资源配额和部署主机待确认。

## 4. Phase 6 必须补齐的内容

- 实际使用的环境变量、用途和必填性说明，不记录真实 Token 或密钥。
- Docker Compose 启动、停止、日志查看和升级步骤。
- PostgreSQL 连接、数据初始化和迁移步骤。
- 前台、Payload Admin 和 Jobs Worker 的运行检查。
- 本地与 S3 文件存储的环境变量、默认选择和切换步骤，以及生产本地存储的持久化与备份说明。
- GitHub REST API 和可选 LLM API 的配置及失败检查。
- 基础备份与恢复方案，备份周期和保留周期待确认。
- 实际验证过的部署命令、验证结果和已知限制。

## 5. 部署验收

在干净环境按最终步骤启动完整项目，确认数据库连接、前台访问、后台登录、异步任务和文件存储正常。

按最终备份方案执行约定的备份与恢复验证，确认资源、历史版本和来源记录完整。

验收结果记录于[验收标准](ACCEPTANCE.md#9-部署与交付验收)的 D-01 至 D-05。
