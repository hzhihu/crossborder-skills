# 技术架构

## 1. 架构决策

第一版采用 Next.js + Payload CMS 的统一 TypeScript 模块化单体架构。

前台、后台、按需 API 和采集业务逻辑位于同一工程，不拆微服务，但代码必须按业务模块划分边界。

Phase 1 基础工程已于 2026-11-09 初始化并完成实际构建、数据库、后台登录、Docker 和 Worker 验证；业务模块的实际完成范围以 [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) §1 为准，后续模块按开发计划实施。

## 2. 技术组成

| 层级 | 技术 | 职责 |
|---|---|---|
| 语言 | TypeScript | 统一前后端开发语言 |
| 前台 | Next.js、React | 页面渲染、路由和服务端数据读取 |
| 样式 | Tailwind CSS、shadcn/ui | 设计样式和基础 UI 组件 |
| 后台 | Payload CMS | 数据管理、权限、Hooks 和定制管理视图 |
| 数据库 | PostgreSQL | 持久化业务数据 |
| 数据访问 | Payload Local API | 工程内业务数据访问 |
| 异步任务 | Payload Jobs Queue | 采集、解析、AI 和同步任务 |
| 输入验证 | Zod | 外部输入和结构化结果验证 |
| 内容渲染 | Markdown 渲染组件 | 安全展示 SKILL.md |
| AI | LLM API | 中文摘要和分类等建议 |
| 外部来源 | GitHub REST API | 公开仓库与文件采集 |
| 文件存储 | Payload Media + 环境可配置的本地存储 / S3 | 图片和文件存储；默认本地开发、本地存储，生产默认 S3，也允许生产配置本地持久化存储 |
| 部署 | Docker Compose | 完整项目部署 |

Next.js、React 和 Payload 按 §2.1 的已核查版本组合执行，后续不得因存在新版本而自行升级；安装、类型检查、构建、Payload Admin 启动和数据库连接验证已完成，后续业务模块仍须完成对应验证。

### 2.1 已核查的依赖版本

以下版本于 2026-11-09 查询 npm 官方 registry 的 `latest` 标签并固定，不使用版本范围或自行跟随 `latest` 升级。

| 依赖 | 固定版本 | 兼容性核查 |
|---|---|---|
| `next` | `16.4.5` | `peerDependencies` 支持 React `^19.0.0`，并处于 `@payloadcms/next@3.93.0` 的 `>=16.3.3 <17.0.0` 范围内 |
| `react` | `19.3.1` | 与 Next.js 的 React 范围一致，并与 `react-dom@19.3.1` 对齐 |
| `react-dom` | `19.3.1` | `peerDependencies.react` 为 `^19.3.1` |
| `payload` | `3.93.0` | 与 `@payloadcms/next@3.93.0` 的 `payload: 3.93.0` 要求一致 |
| `@payloadcms/next` | `3.93.0` | 支持 `next@16.4.5`，其 Next.js 范围包括 `>=16.3.3 <17.0.0` |
| `tailwindcss` | `4.3.5` | 官方 registry 未声明会阻止本组合的 peer dependency 限制 |
| `shadcn` | `4.23.0` | 要求 Node.js `>=20.18.1`，由本节 Node.js 要求覆盖 |
| `@payloadcms/db-postgres` | `3.93.0` | 与 Payload 对齐 |
| `@payloadcms/richtext-lexical` | `3.93.0` | 与 Payload 对齐 |
| `@payloadcms/storage-s3` | `3.93.0` | 与 Payload 对齐，提供环境可选 S3 存储 |
| `graphql` | `16.15.0` | 满足 `@payloadcms/next@3.93.0` 的 `^16.8.1` 要求 |
| `typescript` | `5.9.3` | 使用 TypeScript 5 稳定版本 |
| `@types/node` | `24.19.2` | 对齐 Node.js 24 |
| `@types/react` / `@types/react-dom` | `19.3.0` | 对齐 React 19 |
| `@tailwindcss/postcss` | `4.3.5` | 与 Tailwind CSS 对齐 |
| `eslint` | `9.39.5` | 对齐 Next.js 当前 Lint 插件声明支持的 ESLint 9，避免 ESLint 10 peer dependency 警告 |
| `eslint-config-next` | `16.4.5` | 与 Next.js 对齐 |
| `vitest` / `@vitest/coverage-v8` | `5.1.0` | 单元测试与覆盖率工具 |
| `@playwright/test` | `1.65.0` | 后续端到端、响应式与视觉检查 |
| `react-markdown` | `10.1.0` | 安全 Markdown 渲染，不启用原始 HTML |
| `remark-gfm` | `4.0.1` | GitHub 风格 Markdown 语法 |
| PostgreSQL | `18-alpine` | Docker 镜像已核查可用 |
| Node.js | `>=24.22.1` | 满足 `payload@3.93.0` 和 `@payloadcms/next@3.93.0` 的 `^22.23.4 || >=24.22.1`，同时覆盖 Next.js 的 `>=20.9.0`；本机版本不足时使用 `node:24.22.1-alpine`，不修改本机 Node.js |

响应式断点的构建映射已批准：保持 `768px` 和 `1024px` 不变，Tailwind CSS 4 工程已通过 `@theme` 将 `tablet` 映射为 `48rem`、`desktop` 映射为 `64rem`，采用移动优先的 `1/2/3` 列网格，不在媒体查询中直接使用 CSS Variable；具体业务网格实现时验证各断点列数和无横向溢出。

核心依赖已安装并锁定，Next.js 构建、Payload Admin 登录、数据库连接、Docker Compose 和 Worker 已通过 Phase 1 实际验证；Phase 2 P0 数据模型和 Phase 3 P0 公开页面已完成，当前进度与未交付范围以 [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) §1 为准。

Phase 1 核心运行依赖版本已于 2026-11-09 确认并固定；测试工具及后续业务依赖仍在对应实施前确认。

## 3. 模块边界

| 模块 | 负责 | 不负责 |
|---|---|---|
| Frontend | 公开页面、共享组件、搜索筛选展示、Metadata | 直接绕过权限修改数据 |
| Skill | 资源实体、编辑内容、审核发布、版本关联 | GitHub 请求和 AI 生成细节 |
| Category | 父子分类、启停、排序和分类 SEO | 自动创建 AI 分类 |
| Tag | 标签及标签类型 | 资源采集和发布决策 |
| Collection | 专题、资源组合和专题排序 | 替代业务分类 |
| Crawler | GitHub 与 Skills.sh 公开来源解析、GitHub 仓库信息、文件发现、任务与重试 | 自动发布资源或其他来源扩展 |
| Parser | Frontmatter、Markdown、内容 Hash 和异常结果 | 执行外部脚本或命令 |
| AI | 中文内容、标签、平台和分类建议 | 覆盖人工内容或决定发布 |
| Recommendation | 人工推荐配置 | 复杂算法推荐 |

平台、工具和系统用户由 Payload 数据模型及后台管理承载，不为第一版额外拆分服务。

模块之间通过明确的数据实体和业务调用协作，不在页面组件中重复实现采集、解析或审核规则。

## 4. 运行结构

```text
Browser
   ├── Public Frontend → Next.js Server Components → Payload Local API
   └── Payload Admin → Collections / Hooks / Custom Views
                                      │
                                      ▼
                                PostgreSQL
                                      │
                                      ▼
                            Payload Jobs Worker
                              ├── GitHub REST API
                              ├── Parser
                              └── LLM API
```

前台使用 Server Components，优先在服务端读取公开资源，支持 SSR / ISR 和 Metadata API，避免不必要的客户端请求。

后台使用 Payload Collections 管理数据，通过 Hooks 实现业务处理，通过 Custom Views 定制采集和审核工作台。

第一版优先使用 Payload Local API，公开 API 按需开放，不另写重复 CRUD API。

## 5. 核心流程边界

### 5.1 导入流程

管理员工具校验公开 GitHub 地址或单个 Skills.sh 资源详情地址并创建任务。Skills.sh 只用于定位关联的公开 GitHub 仓库和 Skill，不抓取目录或榜单。Worker 异步获取仓库与 SKILL.md，Parser 保存原始内容和 Hash，Crawler 保存来源信息并记录任务结果与异常。

同一仓库和子目录不得重复导入，重复判断与版本保存遵循[数据库设计](DATABASE.md)。

### 5.2 AI 与发布流程

AI 任务读取原始数据并生成结构化建议，Zod 验证结果后保存为可单独编辑的内容。

AI 失败只影响 AI 任务，不回滚原始采集结果，也不得阻塞人工审核和发布。

只有管理员执行发布后资源才进入公开查询，采集、解析和 AI 模块均无权自动发布。

### 5.3 更新流程

重新采集获取最新内容并比较 Hash，有变化时保存 SkillVersions 记录并提示审核。

更新原始内容不得直接覆盖管理员编辑的中文内容，下架不得删除历史版本。

已发布资源的旧版本在更新审核期间保持公开，新版本未经管理员审核不得公开。

## 6. 异步任务要求

P0 任务包括 GitHub 仓库采集和 SKILL.md 解析，P1 任务包括 AI 摘要生成、AI 分类建议和 GitHub 信息同步。

定时同步资源属于 V2，不纳入第一版 P1。

P1 同步未交付时，不影响 P0 手动重新采集、版本保存和人工审核更新。

任务必须记录运行状态、执行时间和失败信息，支持重试和幂等处理。

采集任务不得直接在 HTTP 请求中同步执行。

Payload Jobs Worker 的队列检查频率已于 2026-11-09 确认为每分钟一次，Cron 表达式为 `* * * * *`，通过 `PAYLOAD_JOBS_CRON` 配置；该设置只检查已创建任务，不启用 V2 定时资源同步。采集配置已于 2026-11-09 确认：`CRAWL_MAX_RETRIES` 默认 3 次、`CRAWL_TIMEOUT_MS` 默认 30000 毫秒、`CRAWL_MAX_MARKDOWN_BYTES` 默认 1000000 字节，均通过环境变量调整；第一版不下载 Markdown 内嵌外部资源。

## 7. 安全与外部依赖

GitHub 接入需要处理 API 频率、Token 配置、访问失败和私有仓库权限；第一版只访问公开仓库。

外部 Markdown 按不可信内容安全渲染，过滤不安全 HTML 和链接，并限制外部资源下载和内容长度。

AI 输出使用结构化 JSON 和 Schema 验证，失败可重试，输出不直接作为发布事实。

敏感配置通过环境变量提供。文件存储通过环境变量选择 `local` 或 `s3`，程序默认开发使用本地存储、生产使用 S3；当前阶段已于 2026-11-11 确认开发和生产均显式使用本地持久化存储，后续生产稳定后再重新评估 S3。生产使用本地存储时必须配置持久化目录，不依赖容器临时层；备份与恢复已确认移到后续版本。

上传图片仅允许 PNG、JPEG、WebP，单文件最大 2 MB，同时校验真实 MIME 类型和扩展名；第一版不允许 SVG、GIF，不自动抓取外部图片补位。

## 8. 渲染与部署边界

公开页面采用 SSR 或 ISR，提供 Canonical URL、Sitemap、Robots、Open Graph 和结构化数据，后台不参与索引。

Docker Compose 应承载完整项目运行，PostgreSQL 连接、文件存储和任务 Worker 必须纳入部署验证。

生产环境已于 2026-11-10 确认采用单台 Linux 主机的 Docker Compose 拓扑，`app`、`worker`、`db` 和一次性 `migrate` 服务运行在同一主机，不引入 Kubernetes、微服务或多主机高可用；具体部署约束以 [DEPLOYMENT.md](DEPLOYMENT.md) 为准。

镜像版本策略已于 2026-11-10 确认：保留 `node:24.22.1-alpine` 和 `postgres:18-alpine`。Phase 6 已于 2026-11-11 在本机隔离环境固定并验证 Node.js digest `sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53` 和 PostgreSQL digest `sha256:123b17998ccaf47e53b502e8c6a1e79afd8f579c6f3eec83c563da026f957395`；升级必须人工执行并重新验证。

生产主机已于 2026-11-10 确认为服务商中立的 Linux Docker Compose 主机；2026-11-11 已确认实际公网部署移到后续发布时执行，届时记录服务商和部署环境。

初始生产资源建议已于 2026-11-10 确认为 2 vCPU、4 GB 内存和 40 GB 持久化磁盘，仅作为可调整的部署起点，不在当前 Docker Compose 中写死容器资源限制，具体验证和调整规则以 [DEPLOYMENT.md](DEPLOYMENT.md) 为准。

备份周期、保留策略和恢复验证已于 2026-11-10 确认移到后续版本，不属于当前 MVP 实施和验收范围。
