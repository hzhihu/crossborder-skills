# CrossBorder Skills Hub
## 跨境电商 AI Skills 资源发现与推荐平台 — 第一版产品与技术方案

**文档版本：** V1.0  
**项目阶段：** MVP / 第一版  
**产品定位：** 跨境电商 AI Skills 资源目录与推荐平台  
**开发目标：** 跑通资源采集、解析、审核、发布、搜索和展示的完整流程，并确定前台及后台页面设计。

---

# 一、项目概述

## 1.1 项目背景

随着 AI Agent、Agent Skills、MCP、AI Workflow 等技术的发展，越来越多的 AI 工具开始应用于跨境电商业务。

目前相关资源分散在：

- GitHub 各类开源仓库。
- Skills.sh 等 Skill 目录。
- MCP Server 项目。
- Awesome Lists。
- AI Agent 社区。
- 跨境电商开发者和卖家社区。

用户需要自行寻找、判断、安装和理解这些资源，缺少一个专门面向跨境电商业务的资源发现平台。

因此，建设 CrossBorder Skills Hub，集中收集、整理和推荐适合跨境电商业务的 AI Skills 和相关工具。

## 1.2 产品定位

不是普通的 GitHub 导航站，而是：

**面向跨境电商业务场景的 AI Skills 资源发现、整理和推荐平台。**

核心价值：

1. 帮助用户发现有价值的 AI Skills。
2. 将技术资源转换为容易理解的业务场景。
3. 提供清晰的安装方法和使用说明。
4. 按照跨境电商业务流程组织资源。
5. 帮助用户快速找到解决具体业务问题的 AI 工具。

## 1.3 第一版开发目标

第一版主要验证四件事：

| 验证目标 | 具体内容 |
|---|---|
| 页面设计 | 确定首页、列表、详情、分类、专题页面 |
| 数据模型 | 确定 Skill、分类、标签、来源等数据关系 |
| 后台管理 | 能够完成资源管理、分类、审核、发布 |
| 业务流程 | 从 GitHub 资源采集到前台公开展示完整跑通 |

第一版不以用户数量、资源数量、商业化收入为验收标准。

而是以系统是否具备完整、可重复运行的资源运营能力作为验收标准。

---

# 二、第一版功能范围

## 2.1 功能优先级

### P0：必须完成

- 前台首页。
- Skill 资源列表。
- Skill 详情。
- 分类页面。
- 专题合集页面。
- 基础搜索。
- 分类和标签筛选。
- Skill 后台管理。
- 分类管理。
- 标签管理。
- GitHub 资源导入。
- SKILL.md 文件解析。
- 资源审核与发布。
- 基础 SEO。
- Docker 部署。

### P1：第一版尽量完成

- GitHub 仓库信息同步。
- AI 自动生成中文摘要。
- AI 自动推荐分类。
- 首页推荐资源配置。
- 专题合集管理。
- 采集任务管理。
- 基础浏览统计。

### P2：暂不开发

- 用户注册系统。
- 用户收藏、点赞。
- 用户评论。
- 用户投稿。
- 会员和付费功能。
- 复杂 AI 智能推荐。
- 向量数据库。
- 多 Agent 自动协作。
- Skill 在线运行和执行。
- 企业级多租户。

---

# 三、产品分类体系

第一版必须先确定分类体系，否则后续采集的资源容易变得混乱。

建议采用业务分类 + 资源类型 + 技术工具 + 适用平台的多维度结构。

## 3.1 一级业务分类

| 分类 | 英文标识 | 业务内容 |
|---|---|---|
| 选品与市场调研 | product-research | 市场趋势、竞品分析、关键词挖掘 |
| Listing 商品管理 | listing | 标题、描述、关键词、多语言优化 |
| 广告与营销 | advertising | 广告分析、投放优化、营销内容 |
| 数据分析 | data-analysis | 销售分析、利润分析、经营报表 |
| 客服与客户反馈 | customer-service | 差评分析、客服回复、退货原因 |
| 图片与视频 | image-video | 商品图片、主图、视频、视觉内容 |
| ERP 与订单管理 | erp-oms | 订单处理、ERP、OMS |
| 仓储与物流 | wms-logistics | 库存、仓库、物流、履约 |
| 自动化运营 | automation | 自动化流程、数据处理 |
| AI Agent | ai-agent | Agent、Agent 工作流 |
| 开发者工具 | developer-tools | API、代码开发、数据集成 |
| 其他工具 | other | 暂时无法归入其他分类的资源 |

分类支持父子级结构。

例如：

```text
Listing 商品管理
├── 商品标题生成
├── 商品描述生成
├── 关键词优化
├── Listing 质量检查
└── 多语言本地化

仓储与物流
├── 库存管理
├── 订单履约
├── 仓库作业
├── 物流追踪
└── 库存分析
```

第一版由管理员维护分类，不需要 AI 自动创建分类。

## 3.2 资源类型

资源类型与业务分类相互独立。

| 类型 | 说明 |
|---|---|
| Skill | Agent Skill，通常包含 SKILL.md |
| MCP Server | 模型上下文协议服务 |
| Agent | 可独立执行任务的 AI Agent |
| Workflow | 自动化工作流 |
| Prompt | 提示词模板 |
| Tool | 独立工具或应用 |

注意：不同资源类型不能全部当作 Skill 处理。

第一版优先完成 Skill 的采集和展示，其他类型允许后台录入，但可以暂时不做自动解析。

## 3.3 适用平台

第一版预置：

- Amazon
- Temu
- SHEIN
- TikTok Shop
- eBay
- Walmart
- AliExpress
- Shopify
- 通用跨境电商

## 3.4 适用工具

第一版预置：

- Claude Code
- Codex
- Cursor
- OpenAI Agents
- Gemini
- 通用 Agent
- MCP Compatible

工具列表应支持后台扩展，不要写死在前端。

---

# 四、前台页面设计

前台设计参考：

https://skills.qiaomu.ai/

设计方向：

- 简洁、现代的 AI 工具目录风格。
- 以搜索和资源发现为中心。
- 首页采用模块化卡片布局。
- 资源卡片信息密度适中。
- 使用清晰的分类导航。
- 保持良好的桌面端和移动端体验。

## 4.1 页面路由规划

| 页面 | 路由 | 第一版 |
|---|---|---|
| 首页 | `/` | 必须 |
| Skill 列表 | `/skills` | 必须 |
| Skill 详情 | `/skills/[slug]` | 必须 |
| 分类列表 | `/categories` | 必须 |
| 分类详情 | `/categories/[slug]` | 必须 |
| 平台列表 | `/platforms` | 建议 |
| 平台详情 | `/platforms/[slug]` | 建议 |
| 专题列表 | `/collections` | 必须 |
| 专题详情 | `/collections/[slug]` | 必须 |
| 搜索结果 | `/search` | 必须 |
| 关于页面 | `/about` | 可选 |

后台独立使用 Payload Admin 路由。

## 4.2 首页设计

首页是第一版最重要的设计页面。

建议页面结构：

```text
┌────────────────────────────────────────────┐
│ Logo        Skills  分类  专题  关于       │
├────────────────────────────────────────────┤
│                                            │
│        发现最值得使用的跨境电商            │
│               AI Skills                   │
│                                            │
│       搜索 Skill / Agent / MCP             │
│                                            │
│       热门：Listing 选品 WMS 广告          │
│                                            │
├────────────────────────────────────────────┤
│                                            │
│              资源统计                      │
│      Skills  分类  专题  最新更新          │
│                                            │
├────────────────────────────────────────────┤
│              热门推荐                      │
│                                            │
│   Skill 卡片   Skill 卡片   Skill 卡片     │
│                                            │
├────────────────────────────────────────────┤
│              热门分类                      │
│                                            │
│   选品        Listing      广告            │
│   数据分析    ERP/OMS      WMS             │
│                                            │
├────────────────────────────────────────────┤
│              最近新增                      │
│                                            │
│   Skill 卡片   Skill 卡片   Skill 卡片     │
│                                            │
├────────────────────────────────────────────┤
│              精选专题                      │
│                                            │
│   Listing 优化工具集                       │
│   Amazon 运营 AI 工具集                    │
│   仓储与物流自动化                         │
│                                            │
├────────────────────────────────────────────┤
│ Footer                                     │
└────────────────────────────────────────────┘
```

### 首页模块说明

**模块 1：顶部导航**

- Logo。
- Skills。
- 分类。
- 专题。
- 关于。
- 提交资源（第一版可暂不开放）。

**模块 2：Hero 搜索区**

主要展示：

- 产品定位标题。
- 简短说明。
- 搜索框。
- 热门搜索标签。

搜索支持：
- Skill 名称。
- 中文名称。
- 英文名称。
- 简介。
- 标签。

**模块 3：资源统计**

展示：

- Skill 总数量。
- 业务分类数量。
- 专题数量。
- 最近新增数量。

全部由数据库动态计算，不允许写死。

**模块 4：热门推荐**

由管理员在后台手动配置。

第一版不需要复杂的推荐算法。

**模块 5：热门分类**

显示业务分类及资源数量。

点击分类进入分类详情页面。

**模块 6：最近新增**

根据发布时间倒序展示资源。

**模块 7：精选专题**

管理员可以配置专题及其中的 Skill。

## 4.3 Skill 列表页面

路由：

`/skills`

布局：

```text
┌────────────────────────────────────────────┐
│ 首页 / Skills                              │
├────────────────────────────────────────────┤
│ 全部 Skills                                │
│                                            │
│ 搜索 Skill...                              │
│                                            │
│ 分类     类型      平台       工具         │
│                                            │
│ 排序：最新发布 / 最近更新 / 热门           │
├────────────────────────────────────────────┤
│                                            │
│ Skill 卡片                                 │
│ ┌────────────────────────────────────────┐ │
│ │ 图标  Skill 名称                       │ │
│ │       中文简介                         │ │
│ │       Listing / Amazon / Claude Code   │ │
│ │       GitHub Stars   更新时间          │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Skill 卡片                                 │
│ Skill 卡片                                 │
│                                            │
│                  分页                      │
└────────────────────────────────────────────┘
```

筛选条件：

- 一级分类。
- 二级分类。
- 资源类型。
- 电商平台。
- 适用工具。
- 标签。

排序条件：

- 最新发布。
- 最近更新。
- GitHub Stars。
- 浏览量。
- 管理员推荐。

第一版采用普通分页，不需要无限滚动。

## 4.4 Skill 详情页面

这是资源平台的核心页面。

页面内容：

### 基础信息

- Skill 名称。
- 中文名称。
- 图标。
- 中文简介。
- 英文简介。
- 业务分类。
- 资源类型。
- 适用平台。
- 适用工具。

### 资源信息

- GitHub 仓库地址。
- 作者。
- GitHub Stars。
- Forks。
- 仓库最后更新时间。
- 本站收录时间。
- 本站最近验证时间。

### 业务说明

- 解决什么问题。
- 适用什么业务场景。
- 主要功能。
- 使用前提。
- 推荐理由。

### 安装说明

展示 Skill 原始安装说明。

如果没有标准安装命令，由管理员补充或使用解析后的内容。

### Skill 内容

展示 SKILL.md 的 Markdown 渲染结果。

需要支持：

- 标题。
- 段落。
- 列表。
- 代码块。
- 表格。
- 链接。

原始内容和平台加工内容需要分开存储。

### 相关推荐

展示：

- 同分类 Skill。
- 同平台 Skill。
- 同专题 Skill。

第一版通过分类和标签匹配即可。

## 4.5 分类页面

路由：

`/categories/[slug]`

页面包含：

- 分类名称。
- 分类说明。
- 子分类导航。
- 当前分类资源数量。
- 资源列表。
- 搜索和筛选。

分类页面必须支持 SEO 独立标题和描述。

## 4.6 专题页面

路由：

`/collections/[slug]`

专题不是普通分类。

例如：

- Amazon Listing 优化工具集。
- 跨境电商选品 AI 工具集。
- 差评洞察与产品改进工具集。
- AI 自动化运营工具集。
- OMS/WMS 智能化工具集。

每个专题可以人工组合多个 Skill。

专题字段：

- 名称。
- 封面图。
- 简介。
- 详细介绍。
- 包含的 Skills。
- 排序。
- 发布时间。
- SEO 信息。

---

# 五、Skill 卡片设计规范

所有前台资源列表统一使用 SkillCard 组件。

建议展示：

| 字段 | 展示要求 |
|---|---|
| 图标 | 有图标使用图标，无图标显示默认图标 |
| 名称 | 中英文名称 |
| 简介 | 最多展示两行 |
| 业务分类 | 分类标签 |
| 平台 | 平台标签 |
| 适用工具 | 工具标签 |
| GitHub Stars | 有数据才展示 |
| 更新时间 | 显示日期 |
| 推荐标识 | 仅人工推荐资源展示 |

卡片不能堆积太多信息。

第一版优先确定统一的卡片样式，避免首页、分类页和搜索页各自开发一套。

---

# 六、后台管理系统设计

后台采用 Payload Admin。

第一版后台不需要重新开发完整的管理系统，但需要定制必要的管理流程。

## 6.1 后台菜单

```text
Dashboard
│
├── Skill Management
│   ├── All Skills
│   ├── Pending Review
│   ├── Published
│   └── Rejected
│
├── Resource Collection
│   ├── Import GitHub Repository
│   ├── Crawl Tasks
│   └── Crawl Logs
│
├── Category Management
│
├── Tag Management
│
├── Platform Management
│
├── Tool Management
│
├── Collection Management
│
├── Recommendation Management
│
└── System Settings
```

## 6.2 Dashboard

展示：

- Skill 总数。
- 已发布数量。
- 待审核数量。
- 采集失败数量。
- 最近 7 天新增资源。
- 最近采集任务。
- 最近发布资源。

第一版不需要复杂的数据分析图表。

## 6.3 Skill 管理

支持：

- 新增 Skill。
- 编辑 Skill。
- 删除 Skill。
- 上下架。
- 批量操作。
- 修改分类。
- 修改标签。
- 修改平台。
- 查看原始内容。
- 查看采集来源。
- 查看历史版本。

状态：

| 状态 | 说明 |
|---|---|
| draft | 草稿 |
| pending | 待审核 |
| published | 已发布 |
| rejected | 已驳回 |
| archived | 已归档 |

状态流转：

```text
draft
  ↓
pending
  ↓
published

pending
  ↓
rejected

published
  ↓
archived
```

## 6.4 资源采集管理

后台需要一个 GitHub 地址导入入口。

输入：

- GitHub 仓库地址。

可选：

- 指定 Skill 子目录。
- 指定资源类型。
- 指定业务分类。

提交后创建采集任务。

后台展示：

- 任务编号。
- 仓库地址。
- 任务状态。
- 创建时间。
- 完成时间。
- 失败原因。
- 解析结果。

支持失败重试。

## 6.5 分类与标签管理

分类：

- 支持一级分类。
- 支持二级分类。
- 支持启用和禁用。
- 支持排序。
- 支持 SEO 配置。

标签：

- 标签名称。
- 标签类型。
- 标签描述。
- 标签状态。

标签类型：

- business：业务场景。
- platform：电商平台。
- tool：AI 工具。
- technology：技术类型。

## 6.6 专题管理

支持：

- 创建专题。
- 编辑专题。
- 上传封面。
- 添加 Skill。
- 删除 Skill。
- 拖动调整顺序。
- 发布和下架。

## 6.7 推荐管理

第一版采用人工推荐。

支持：

- 首页热门推荐。
- 首页最新推荐。
- 专题推荐。
- 分类推荐。

推荐内容由管理员选择，不使用复杂算法。

---

# 七、技术架构设计

## 7.1 最终技术选型

采用 Next.js + Payload CMS 的统一 TypeScript 架构。

| 层级 | 技术 | 用途 |
|---|---|---|
| 编程语言 | TypeScript | 统一前后端语言 |
| 前端框架 | Next.js | 前台网站 |
| React | React | UI |
| CSS | Tailwind CSS | 样式 |
| UI 组件 | shadcn/ui | 基础组件 |
| 后台 | Payload CMS | 管理系统 |
| 数据库 | PostgreSQL | 数据存储 |
| 数据访问 | Payload Local API | 业务数据访问 |
| 任务队列 | Payload Jobs Queue | 异步任务 |
| 数据验证 | Zod | 输入验证 |
| Markdown | Markdown 渲染组件 | SKILL.md 展示 |
| AI | LLM API | 摘要、分类 |
| GitHub | GitHub REST API | 仓库采集 |
| 文件存储 | 本地开发 / S3 生产 | 图片和文件 |
| 部署 | Docker Compose | 应用部署 |

## 7.2 架构原则

第一版使用模块化单体架构。

不拆微服务。

前台、后台、API、采集业务逻辑在同一个 Next.js + Payload 工程中。

但是代码层面必须模块化。

```text
Frontend
   │
   ▼
Payload Application
   │
   ├── Skill Module
   ├── Category Module
   ├── Tag Module
   ├── Collection Module
   ├── Crawler Module
   ├── Parser Module
   ├── AI Module
   └── Recommendation Module
   │
   ▼
PostgreSQL
   │
   ▼
Payload Jobs Worker
```

## 7.3 前后台交互

前台：

- 使用 Next.js Server Components。
- 优先服务端获取公开资源。
- 页面支持 SSR / ISR。
- 使用 Metadata API。
- 避免不必要的客户端请求。

后台：

- 使用 Payload Admin。
- 通过 Collections 管理数据。
- 通过 Hooks 实现业务处理。
- 通过 Custom Views 定制采集和审核工作台。

API：

- 第一版优先使用 Payload Local API。
- 公开 API 按需开放。
- 不需要为了前台调用自己写一套重复 CRUD API。

## 7.4 任务队列

第一版使用 Payload Jobs Queue。

任务：

- GitHub 仓库采集。
- SKILL.md 文件解析。
- AI 摘要生成。
- AI 分类建议。
- GitHub 信息同步。
- 定时检查资源更新。

任务必须具备：

- 运行状态。
- 执行时间。
- 失败信息。
- 重试机制。
- 幂等处理。

采集任务不能直接在 HTTP 请求中同步执行。

---

# 八、数据库设计

第一版数据库设计以业务实体为中心。

## 8.1 核心数据模型

### Skills

核心字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID | 主键 |
| name | text | 英文或原始名称 |
| name_zh | text | 中文名称 |
| slug | text | URL 标识 |
| description | text | 原始简介 |
| description_zh | text | 中文简介 |
| content | text | 平台加工后的 Markdown |
| raw_content | text | 原始 SKILL.md |
| resource_type | enum | 资源类型 |
| source_url | text | 原始资源地址 |
| repository_url | text | GitHub 仓库 |
| status | enum | 状态 |
| is_featured | boolean | 是否推荐 |
| published_at | timestamp | 发布时间 |
| last_verified_at | timestamp | 最近验证时间 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### Categories

| 字段 | 说明 |
|---|---|
| id | 主键 |
| name | 分类名称 |
| slug | URL 标识 |
| parent | 父级分类 |
| description | 分类说明 |
| icon | 图标 |
| sort_order | 排序 |
| is_active | 是否启用 |

### Tags

| 字段 | 说明 |
|---|---|
| id | 主键 |
| name | 标签名称 |
| slug | 标识 |
| type | 标签类型 |

### Platforms

| 字段 | 说明 |
|---|---|
| id | 主键 |
| name | 平台名称 |
| slug | 标识 |
| description | 说明 |

### Tools

| 字段 | 说明 |
|---|---|
| id | 主键 |
| name | 工具名称 |
| slug | 标识 |
| description | 说明 |

### Collections

| 字段 | 说明 |
|---|---|
| id | 主键 |
| name | 专题名称 |
| slug | 标识 |
| description | 专题介绍 |
| cover_image | 封面 |
| status | 发布状态 |
| sort_order | 排序 |

### CrawlTasks

| 字段 | 说明 |
|---|---|
| id | 主键 |
| source_url | 采集地址 |
| task_type | 任务类型 |
| status | 状态 |
| result | 执行结果 |
| error_message | 错误信息 |
| started_at | 开始时间 |
| completed_at | 完成时间 |

### SkillVersions

记录 Skill 内容历史：

- skill_id。
- version。
- content_hash。
- raw_content。
- changelog。
- created_at。

避免采集更新时直接覆盖历史内容。

## 8.2 数据关系

```text
Skills
  ├── Categories (Many to Many)
  ├── Tags (Many to Many)
  ├── Platforms (Many to Many)
  ├── Tools (Many to Many)
  ├── Collections (Many to Many)
  ├── SkillVersions (One to Many)
  └── CrawlTasks (One to Many)

Users
  └── 负责管理和审核资源
```

实际实现时使用 Payload Relationships 和 Join 字段，不需要手工维护重复的关联逻辑。

## 8.3 数据设计注意事项

1. `slug` 必须唯一。
2. GitHub 仓库 URL 需要规范化。
3. 同一仓库和子目录不能重复导入。
4. 原始内容与人工编辑内容分开。
5. AI 生成的字段必须能够单独修改。
6. 分类和标签支持多对多。
7. Skill 下架后不应直接删除历史版本。
8. 资源来源必须保留。

第一版不需要提前建立独立的复杂统计数据库。

---

# 九、GitHub 资源采集流程

这是第一版必须真正跑通的核心业务。

## 9.1 采集流程

```text
管理员输入 GitHub 仓库地址
          │
          ▼
      URL 校验
          │
          ▼
      创建采集任务
          │
          ▼
      GitHub API
          │
          ▼
      获取仓库信息
          │
          ▼
      获取 SKILL.md
          │
          ▼
      解析 Frontmatter
          │
          ▼
      解析 Markdown
          │
          ▼
      计算内容 Hash
          │
          ▼
      检测重复资源
          │
          ▼
      保存原始数据
          │
          ▼
      AI 中文摘要和分类建议
          │
          ▼
      管理员审核
          │
          ▼
      发布前台
```

## 9.2 GitHub 采集字段

仓库信息：

- repository_name。
- repository_full_name。
- owner。
- description。
- html_url。
- default_branch。
- stars。
- forks。
- pushed_at。
- updated_at。

Skill 文件信息：

- 文件路径。
- Skill 名称。
- Skill 描述。
- SKILL.md 原始内容。
- 内容 Hash。
- 文件更新时间。

注意：GitHub 仓库不一定只有一个 Skill。

第一版应该支持：

- 一个仓库只有一个 Skill。
- 一个仓库包含多个 Skill 子目录。
- 管理员指定某个 Skill 子目录导入。

## 9.3 SKILL.md 解析

标准 Frontmatter 示例：

```yaml
---
name: amazon-listing-optimizer
description: Optimize Amazon product listings.
---

# Amazon Listing Optimizer

...
```

解析：

- name。
- description。
- Markdown 正文。

需要保留原始文件内容。

如果 Frontmatter 缺失或格式异常，应进入异常审核状态，不应该直接丢弃资源。

## 9.4 AI 处理

第一版 AI 只负责：

1. 生成中文名称。
2. 生成中文简介。
3. 提取主要功能。
4. 推荐业务分类。
5. 推荐业务标签。
6. 提取适用平台。
7. 生成推荐理由。

AI 结果进入待审核状态。

管理员可以修改后发布。

AI 不负责自动决定资源是否合格。

## 9.5 采集安全

需要考虑：

- GitHub API 请求频率。
- API Token 配置。
- 仓库访问失败。
- 不可信 Markdown 内容。
- 恶意链接。
- 外部资源下载限制。
- 私有仓库访问权限。
- 内容长度限制。

第一版只采集公开仓库。

不执行 Skill 中的脚本和命令。

不自动下载和运行仓库内的任意程序。

---

# 十、完整业务流程验收

第一版必须使用真实 GitHub 资源进行测试。

验收流程：

### 场景 1：手动导入资源

1. 管理员登录后台。
2. 进入资源采集。
3. 输入 GitHub 仓库地址。
4. 创建采集任务。
5. 后台显示任务状态。

### 场景 2：解析资源

1. 系统获取仓库信息。
2. 找到 SKILL.md。
3. 解析 Frontmatter。
4. 获取 Markdown 正文。
5. 保存原始数据。
6. 检查是否重复。

### 场景 3：AI 处理

1. 调用 LLM。
2. 生成中文名称。
3. 生成中文简介。
4. 推荐分类。
5. 提取标签。
6. 保存 AI 处理结果。

如果 AI 服务不可用，原始采集任务仍然应该成功，AI 任务单独标记失败并支持重试。

### 场景 4：管理员审核

1. 进入待审核列表。
2. 查看原始资源。
3. 查看 AI 摘要。
4. 修改中文名称。
5. 选择分类。
6. 选择标签。
7. 发布资源。

### 场景 5：前台展示

1. 打开首页。
2. 查看最新资源。
3. 进入 Skill 列表。
4. 搜索 Skill。
5. 按分类筛选。
6. 进入详情页面。
7. 查看安装说明和原始内容。
8. 点击 GitHub 来源。

### 场景 6：资源更新

1. 重新采集原仓库。
2. 获取最新内容。
3. 计算 Hash。
4. 判断是否发生变化。
5. 保存新版本。
6. 不直接覆盖管理员编辑的中文内容。
7. 提示管理员审核更新。

---

# 十一、SEO 设计

资源目录站非常依赖搜索引擎。

第一版必须实现：

- 首页 Title、Description。
- Skill 独立 Title、Description。
- 分类独立 SEO。
- 专题独立 SEO。
- Canonical URL。
- Sitemap.xml。
- Robots.txt。
- Open Graph。
- 结构化数据。
- 404 页面。
- 合理的 URL 结构。

示例：

```text
/skills/amazon-listing-optimizer

/categories/listing

/platforms/amazon

/collections/amazon-ai-tools
```

前台公开内容采用 SSR 或 ISR。

后台管理页面不参与搜索引擎索引。

---

# 十二、UI 设计规范

第一版需要先建立统一设计系统。

## 12.1 整体风格

建议：

- 简洁现代。
- 类似开发者资源目录。
- 白色或浅色背景。
- 中性色文字。
- 蓝色作为主要强调色。
- 轻量边框。
- 统一圆角。
- 适当留白。
- 避免过多渐变和装饰。

## 12.2 组件规划

统一开发以下组件：

- Header。
- Footer。
- SearchBox。
- SkillCard。
- SkillGrid。
- CategoryCard。
- CollectionCard。
- Tag。
- PlatformBadge。
- ResourceTypeBadge。
- FilterPanel。
- SortSelector。
- Pagination。
- EmptyState。
- LoadingState。
- MarkdownRenderer。

所有页面尽量复用组件。

## 12.3 响应式要求

桌面端：

- 主内容最大宽度约 1200px。
- 资源卡片采用网格。
- 筛选条件合理排列。

平板端：

- 调整网格列数。
- 筛选器可以折叠。

移动端：

- 导航适配移动端。
- 搜索框占满宽度。
- 资源卡片单列。
- 筛选条件采用抽屉或弹层。

## 12.4 页面设计验收

第一版需要形成以下设计成果：

1. 首页完整 UI。
2. Skill 列表 UI。
3. Skill 详情 UI。
4. 分类详情 UI。
5. 专题详情 UI。
6. 后台 Dashboard。
7. Skill 管理列表。
8. Skill 编辑表单。
9. 资源采集页面。
10. 待审核页面。

不能只把页面做成简单的表格和文字列表。

---

# 十三、开发实施计划

建议拆成六个开发阶段。

## Phase 1：工程初始化

任务：

- 初始化 Next.js。
- 集成 Payload CMS。
- 配置 PostgreSQL。
- 配置 Docker Compose。
- 配置 Tailwind CSS。
- 配置 shadcn/ui。
- 初始化 Git。
- 配置环境变量。
- 配置基础 CI。

验收：

- 前台可以访问。
- 后台可以登录。
- 数据库正常连接。
- Docker 可以启动完整项目。

## Phase 2：后台与数据模型

任务：

- Skills Collection。
- Categories Collection。
- Tags Collection。
- Platforms Collection。
- Tools Collection。
- Collections Collection。
- SkillVersions Collection。
- CrawlTasks Collection。
- Users Collection。

验收：

- 可以后台新增 Skill。
- 可以管理分类。
- 可以管理标签。
- 可以维护专题。
- 可以关联多个分类和标签。
- 可以正常发布和下架。

## Phase 3：前台页面

任务：

- 首页。
- Skill 列表。
- Skill 详情。
- 分类页面。
- 专题页面。
- 搜索页面。
- 统一卡片组件。
- SEO。
- 响应式布局。

验收：

- 所有页面能够读取真实数据库数据。
- 搜索和筛选正常。
- 详情页面内容完整。
- 页面设计统一。

## Phase 4：GitHub 采集

任务：

- GitHub URL 解析。
- GitHub API 封装。
- 仓库信息获取。
- SKILL.md 文件发现。
- Frontmatter 解析。
- Markdown 保存。
- 内容 Hash。
- 重复资源检测。
- 采集任务记录。
- 失败重试。

验收：

- 能够真实采集公开 GitHub Skill。
- 能处理一个仓库包含多个 Skill。
- 能识别重复资源。
- 能够记录异常。

## Phase 5：AI 处理与审核

任务：

- LLM 接口封装。
- 中文名称生成。
- 中文简介生成。
- 分类建议。
- 标签建议。
- 推荐理由生成。
- 审核页面。
- 发布流程。

验收：

- AI 能够根据原始内容生成结构化结果。
- 管理员能够修改结果。
- AI 失败不会影响原始采集数据。
- 只有管理员发布后才进入公开列表。

## Phase 6：整体测试与部署

任务：

- 端到端流程测试。
- 搜索测试。
- SEO 测试。
- 页面响应式测试。
- 权限测试。
- 数据完整性测试。
- Docker 生产部署。
- 基础备份方案。

验收：

- 完整业务流程跑通。
- 后台可以独立运营资源。
- 前台可以正常访问。
- 资源可以持续采集和更新。

---

# 十四、第一版不做的事情

以下能力明确放到后续版本。

| 功能 | 后续规划 |
|---|---|
| 用户注册 | V2 |
| 用户收藏 | V2 |
| 用户投稿 | V2 |
| 评论评价 | V2 |
| 热门榜单算法 | V2 |
| 多来源自动发现 | V2 |
| MCP 自动采集 | V2 |
| Agent 组合推荐 | V2 |
| 向量搜索 | V2 |
| 在线 Skill 执行 | 暂不规划 |
| 会员体系 | 商业化阶段 |

避免在 MVP 阶段出现需求膨胀。

---

# 十五、风险与待确认事项

## 15.1 技术风险

**Payload 与 Next.js 版本兼容性**

初始化时需要锁定兼容版本，不能随意升级 Next.js、React 和 Payload。

**GitHub API 限流**

需要合理控制请求频率，支持 Token 配置和失败重试。

**Markdown 安全**

不能直接信任外部 Markdown，必须进行安全渲染，过滤不安全 HTML 和链接。

**AI 输出不稳定**

需要结构化 JSON 输出、Schema 验证和失败重试。

**采集数据质量**

仓库中可能没有标准 SKILL.md，需要允许人工指定文件路径或进入异常状态。

## 15.2 产品待确认

1. 第一版是否只收录 Agent Skills，还是允许 MCP、Agent、Workflow 一起录入？
2. 是否需要把 Skills.sh 等目录作为自动采集来源，还是第一版仅通过 GitHub 导入？
3. Skill 原始内容是否需要完整展示？
4. 第一版是否需要中英文双语？
5. 首页是否采用浅色主题为主，还是需要深色主题切换？

这些问题不影响工程初始化，但应在数据模型定稿前确认。

---

# 十六、第一版最终交付清单

| 交付内容 | 完成标准 |
|---|---|
| 项目工程 | Next.js + Payload 正常运行 |
| 数据库 | PostgreSQL 数据模型完成 |
| 后台管理 | 能管理资源、分类、标签、专题 |
| 前台首页 | 完成正式页面 |
| Skill 列表 | 搜索、筛选、分页 |
| Skill 详情 | 完整展示资源内容 |
| 分类页面 | 分类资源展示 |
| 专题页面 | 专题及关联资源展示 |
| GitHub 采集 | 真实仓库采集成功 |
| Skill 解析 | 能读取并解析 SKILL.md |
| AI 处理 | 能生成中文摘要及分类建议 |
| 审核流程 | 待审核、发布、驳回 |
| 版本管理 | 能记录资源内容变化 |
| SEO | 基础 SEO 配置完成 |
| Docker | 可以部署运行 |
| 文档 | README、架构说明、部署说明 |

## 最终验收标准

第一版最终必须能够演示以下完整操作：

```text
管理员登录
    ↓
输入 GitHub 仓库地址
    ↓
系统采集仓库
    ↓
自动寻找 SKILL.md
    ↓
解析 Skill 内容
    ↓
AI 生成中文介绍和分类建议
    ↓
管理员审核和修改
    ↓
管理员发布
    ↓
首页出现新 Skill
    ↓
用户搜索到 Skill
    ↓
用户打开详情页面
    ↓
用户查看安装说明
    ↓
用户跳转 GitHub 原始仓库
```

**只要这个流程完整跑通，第一版就达到了核心目标。**

---

# 十七、后续版本方向

第一版完成后，再考虑以下方向：

### V2：资源运营能力

- 自动发现 GitHub 新资源。
- 定时同步资源。
- 多来源数据采集。
- 用户投稿。
- 用户收藏。
- 热门榜单。
- 资源质量评分。

### V3：AI 智能推荐

- 自然语言搜索。
- 根据业务问题推荐 Skill。
- 多个 Skill 组合推荐。
- 推荐 Agent 和 MCP。
- 自动生成业务使用方案。

### V4：商业化

- 企业 Skill 集合。
- 企业专属资源库。
- 付费专题。
- 企业定制 AI Workflow。
- 跨境电商 AI 技术服务。

---

**项目最终定位：先做一个真正好用、内容可靠、可以持续运营的跨境电商 AI Skills 资源目录，再逐步发展为跨境电商 AI 工具发现与推荐平台。**
