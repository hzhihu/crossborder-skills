# CrossBorder Skills Hub

CrossBorder Skills Hub 是面向跨境电商业务场景的 AI Skills 资源发现、整理和推荐平台。

第一版目标是跑通资源采集、解析、审核、发布、搜索和展示的完整流程，形成可重复运行的资源运营能力。

## 当前状态

Phase 1 工程初始化、Phase 2 P0 核心数据模型和 Phase 3 P0 前台页面已完成并通过实际验证。

当前包含核心 Collections、状态与发布约束、历史版本、重试关系、Payload Media、本地/S3 可选存储、公开首页、Skill 列表与详情、分类、专题、搜索、关于、SEO、响应式页面、Docker Compose、Jobs Worker 和 CI。GitHub 或 Skills.sh 采集、审核工作台、AI 和 P1 增强能力尚未交付。

原始需求保留在 [第一版产品与技术方案](docs/crossBorder_skills_hub_mvp_v1.md)，本文档及后续规范均不替代原始需求。

## 本地启动

要求使用 Node.js `>=24.22.1`；本机版本不足时不要升级系统环境，可使用已验证的 `node:24.22.1-alpine` 镜像。

```bash
cp .env.example .env
# 编辑 .env，替换数据库密码、Payload 密钥和本地管理员密码。
docker compose up -d --build
```

Docker Compose 会先启动 PostgreSQL 并执行迁移，再启动应用和 Worker。前台地址为 `http://localhost:3000`，后台地址为 `http://localhost:3000/admin`。

首次部署且没有管理员时，通过后台的创建首位管理员页面设置账号；不要将真实凭据提交到版本库。

```bash
docker compose ps
docker compose logs --tail=100 app worker
docker compose down
```

`docker compose down` 不删除数据库卷；不要为常规重启添加 `--volumes`。

## 基础检查

本机 Node.js 版本不足时，在仓库根目录通过 Docker 执行：

```bash
docker run --rm -v "$PWD":/app -w /app node:24.22.1-alpine npm ci
docker run --rm -v "$PWD":/app -w /app node:24.22.1-alpine npm run lint
docker run --rm -v "$PWD":/app -w /app node:24.22.1-alpine npm run typecheck
docker run --rm -v "$PWD":/app -w /app node:24.22.1-alpine npm test
docker run --rm -e PAYLOAD_SECRET=development-only -e DATABASE_URL=postgresql://payload:payload@localhost:5432/payload -v "$PWD":/app -w /app node:24.22.1-alpine npm run build
```

Vitest 覆盖配置、SEO、公开查询参数、安装命令和 Markdown 安全；Playwright 覆盖公开导航、搜索、移动菜单、筛选抽屉、焦点返回和三档视口。候选截图保存在 `design/screenshots/phase-3`，不代表设计审批已通过。

在本机通过 Playwright 官方镜像执行浏览器检查：

```bash
docker run --rm -e PLAYWRIGHT_BASE_URL=http://host.docker.internal:3000 -e PLAYWRIGHT_BROWSERS_PATH=/app/.cache/ms-playwright -v "$PWD":/app -w /app mcr.microsoft.com/playwright:v1.65.0-noble npm run test:e2e
```

## 文档导航

| 文档 | 用途 | 主要读者 |
|---|---|---|
| [AI 任务总规则](AGENTS.md) | 约束所有 AI 辅助任务的范围、安全和交付方式 | 所有参与者 |
| [产品规范](docs/PRODUCT.md) | 固定产品定位、P0/P1/P2 范围和待确认事项 | 产品、设计、开发 |
| [技术架构](docs/ARCHITECTURE.md) | 固定 Next.js + Payload CMS 模块化单体架构和模块边界 | 开发、测试 |
| [数据库设计](docs/DATABASE.md) | 定义数据实体、字段、关系、状态和约束 | 开发、测试 |
| [设计方向](docs/DESIGN_DIRECTION.md) | 定义整体视觉方向与视觉原则 | 产品、设计、前端 |
| [设计 Token](docs/DESIGN_TOKENS.md) | 定义颜色、字体、尺寸、间距、断点和量化可访问性标准 | 设计、前端 |
| [首页规范](docs/HOMEPAGE_SPEC.md) | 定义首页布局、内容、交互和状态 | 产品、设计、前端 |
| [Skill 卡片规范](docs/SKILL_CARD_SPEC.md) | 定义 SkillCard、SkillGrid 及其骨架规则 | 设计、前端 |
| [页面结构](docs/PAGE_STRUCTURE.md) | 定义页面清单、非首页模块结构、跨页状态和组件复用 | 产品、设计、开发、测试 |
| [设计系统](docs/DESIGN_SYSTEM.md) | 提供共享组件清单、通用设计原则和权威文件索引 | 设计、前端 |
| [设计审批](docs/DESIGN_APPROVAL.md) | 管理设计审批流程、审批记录和证据 | 产品、设计 |
| [界面规范](docs/UI_SPEC.md) | 已弃用，仅作历史参考，不作为新任务依据 | 产品、设计、开发、测试 |
| [开发计划](docs/DEVELOPMENT_PLAN.md) | 按六个阶段安排任务、依赖和阶段验收 | 所有参与者 |
| [编码规范](docs/CODING_RULES.md) | 定义 TypeScript、Next.js、Payload、测试和 Git 规范 | 开发、审查者 |
| [验收标准](docs/ACCEPTANCE.md) | 提供功能、安全、SEO、响应式和交付验收条件 | 产品、开发、测试 |
| [部署说明](docs/DEPLOYMENT.md) | 约定后续 Docker Compose 部署与备份交付内容 | 开发、运维 |

## 目录说明

```text
.
├── AGENTS.md
├── README.md
├── docs/                    # 原始需求与项目规范
├── design/
│   ├── references/          # 设计参考
│   ├── screenshots/         # 过程截图
│   ├── approved/            # 已确认设计成果
│   ├── components/          # 共享组件设计
│   └── prototypes/          # 历史视觉原型，仅作研究参考
├── src/                     # Next.js、Payload 配置与后续业务源码
└── tests/
    ├── e2e/                 # 后续业务端到端测试，当前为空
    └── visual/              # 后续视觉测试，当前为空
```

## 后续实施入口

后续工程实施应先从 [开发计划](docs/DEVELOPMENT_PLAN.md) 的 Phase 1 开始，并在 Phase 1 后、Phase 2 数据模型定稿前处理影响数据模型的[待确认事项](docs/PRODUCT.md#10-待确认事项)第 1 至第 5 项及第 11 项。

实施完成前，不应把本文档中的目标、规范或验收条件视为已经实现的功能。
