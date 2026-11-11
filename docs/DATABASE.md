# 数据库设计

## 1. 设计原则

第一版使用 PostgreSQL，以业务实体为中心，通过 Payload Relationships 和 Join 字段实现关联，不手工维护重复关联逻辑。

原始内容、平台加工内容和 AI 建议必须可区分，资源来源和历史版本必须保留。

本文档定义逻辑模型；Payload 字段实现方式、数据库索引细节和未给出枚举值的状态集合在实施前按约束确认。

主键类型已于 2026-11-09 确认为 Payload PostgreSQL 默认自增 `integer`，不再使用 UUID；整数 ID 不代替任何权限控制。

## 2. 核心实体

### 2.1 Skills

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| name | text | 英文或原始名称 |
| name_zh | text | 中文名称，可由 AI 生成后人工修改 |
| slug | text | URL 标识，唯一 |
| description | text | 原始简介 |
| description_zh | text | 中文简介，可由 AI 生成后人工修改 |
| content | text | 平台加工后的 Markdown |
| raw_content | text | 原始 SKILL.md，同时保留原始安装说明，与加工内容分开 |
| installation_instructions | text | 平台加工后的安装展示内容，可由管理员补充或使用解析内容，不替代原始内容 |
| icon | upload relationship | 关联 Payload Media；本地或 S3 由环境配置决定 |
| problem_solved | text | 解决的问题 |
| applicable_scenarios | text | 适用业务场景 |
| main_features | text | 主要功能，可由 AI 提取后人工修改 |
| usage_prerequisites | text | 使用前提 |
| recommendation_reason | text | 推荐理由，可由 AI 生成后人工修改 |
| resource_type | enum | Skill、MCP Server、Agent、Workflow、Prompt、Tool |
| source_url | text | 原始导入地址，可为公开 GitHub 或单个 Skills.sh 资源详情地址，必须保留 |
| repository_url | text | 规范化后的 GitHub 仓库地址，对应仓库 `html_url`；Skills.sh 导入时保存其关联公开仓库 |
| repository_path | text | SKILL.md 所在子目录或文件路径，支持人工指定文件 |
| repository_name | text | GitHub 仓库名称 |
| repository_full_name | text | GitHub 仓库完整名称 |
| owner | text | 仓库所有者 |
| author | text | 资源作者 |
| default_branch | text | 仓库默认分支 |
| stars | number | GitHub Stars，有数据才展示 |
| forks | number | GitHub Forks |
| repository_pushed_at | timestamp | 仓库最后推送时间 |
| repository_updated_at | timestamp | 仓库最后更新时间 |
| source_file_updated_at | timestamp | SKILL.md 文件更新时间 |
| status | enum | draft、pending、published、rejected、archived |
| is_featured | boolean | 是否人工推荐 |
| published_at | timestamp | 发布时间 |
| last_verified_at | timestamp | 本站最近验证时间 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

Skill 详情 SEO 标题优先由 `name_zh` 派生，缺失时使用 `name`；SEO 描述优先由 `description_zh` 派生，缺失时使用 `description`，无需增加独立 SEO 字段。

资源类型字段只定义数据模型能力，其他类型允许后台录入；第一版已确认前台只公开 Skill，自动采集只处理 Skill。

P1 AI 建议使用 Skills.`ai_suggestions` JSON 独立保存中文名称、简介、主要功能、分类、标签、平台、推荐理由和必要元数据，经 Zod 验证；不直接写入人工字段或正式关联，AI 任务状态仍由 CrawlTasks 独立记录。

`is_featured` 仅表示基础推荐标识。P1 首页推荐配置已确认使用单个 Homepage Global，以 `featured_skills` 数组保存 Skill 引用和 `sort_order`；不使用自动补位，不改变列表 featured 排序。

### 2.2 Categories

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| name | text | 分类名称 |
| slug | text | URL 标识，唯一 |
| parent | relationship | 父级分类；第一版仅使用一级和二级 |
| description | text | 分类说明 |
| icon | upload relationship | 关联 Payload Media；本地或 S3 由环境配置决定 |
| sort_order | number | 排序 |
| is_active | boolean | 是否启用 |
| seo_title | text | 独立 SEO 标题 |
| seo_description | text | 独立 SEO 描述 |

二级分类不得再作为父级创建第三级，禁用分类不得作为新资源的有效分类选择。

### 2.3 Tags

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| name | text | 标签名称 |
| slug | text | 标识，唯一 |
| type | enum | business、technology；平台与工具只使用独立实体关系 |
| description | text | 标签描述 |
| status | enum | active、archived；仅 active 可新增关联并公开展示 |

### 2.4 Platforms

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| name | text | 平台名称 |
| slug | text | 标识，唯一 |
| description | text | 平台说明 |

### 2.5 Tools

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| name | text | 工具名称 |
| slug | text | 标识，唯一 |
| description | text | 工具说明 |

### 2.6 Collections

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| name | text | 专题名称 |
| slug | text | URL 标识，唯一 |
| description | text | 专题简介 |
| detailed_content | text | 专题详细介绍 |
| cover_image | upload relationship | 关联 Payload Media；P1 上传，本地或 S3 由环境配置决定 |
| status | enum | draft、published、archived |
| sort_order | number | 专题排序 |
| published_at | timestamp | 发布时间 |
| seo_title | text | 独立 SEO 标题 |
| seo_description | text | 独立 SEO 描述 |

专题内 Skill 及其顺序通过关系字段维护，同一 Skill 可属于多个专题。

### 2.7 CrawlTasks

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键，同时作为任务编号 |
| source_url | text | 采集地址 |
| repository_path | text | 可选的指定 Skill 子目录或 SKILL.md 文件路径 |
| resource_type | enum | 可选的指定资源类型 |
| category | relationship | 可选的指定业务分类 |
| skill | relationship | 可选的主关联 Skill；单任务多 Skill 结果同时记录在 result.skills |
| task_type | enum | 采集、解析、AI、同步等任务类型 |
| status | enum | queued、running、succeeded、needs_review、failed |
| retry_of | relationship | 可选且唯一，指向被重试的 CrawlTask；每个任务最多有一个直接重试，每次重试新增任务并保留原记录 |
| result | JSON | skills 数组记录 created、updated、unchanged；errors 数组记录 code、message、repository_path、retryable |
| error_message | text | 失败原因 |
| started_at | timestamp | 开始时间 |
| completed_at | timestamp | 完成时间 |
| created_at | timestamp | 创建时间 |

任务需支持失败重试和幂等处理；每次重试新增 CrawlTask 并通过 `retry_of` 关联原任务，原状态、失败信息和结果不被覆盖，重试不得重复创建 Skill 或无变化版本。

### 2.8 SkillVersions

| 字段 | 类型 | 约束与说明 |
|---|---|---|
| id | integer | Payload 自增主键 |
| skill_id | relationship | 所属 Skill，必填 |
| version | integer | 每个 Skill 内从 1 开始递增，仅内容 Hash 变化时增加 |
| content_hash | text | 原始内容 Hash，用于变化检测 |
| raw_content | text | 该版本原始内容 |
| changelog | text | 变更说明 |
| created_at | timestamp | 创建时间 |

同一 Skill 的重复采集只有在内容变化时创建新版本，下架或归档不得删除历史版本；`skill_id + version` 组合唯一，不伪造原始项目未提供的 SemVer。

### 2.9 Media

Media 使用 Payload Upload Collection 统一承载 Skill 图标、分类图标和 P1 专题封面。开发默认本地存储，生产默认 S3；两种环境均可通过环境配置切换 `local` 或 `s3`，数据库不保存 Base64 图片。

生产使用本地存储时必须配置持久化目录；备份与恢复已确认移到后续版本。凭据只通过环境配置提供。仅允许 PNG、JPEG、WebP，单文件最大 2 MB，上传时同时校验真实 MIME 类型和扩展名；不允许 SVG、GIF。图标建议正方形，专题封面建议 1200 × 630，缺失时使用统一降级，不抓取外部图片补位。

## 2.10 Users

Users 负责后台登录、资源管理和审核，不对应 P2 的前台用户注册系统。

第一版已于 2026-11-09 确认只保留一种管理员角色，不增加角色细分字段，不开放前台注册；所有后台、采集、编辑、审核和发布操作均要求管理员登录并由服务端验证权限。

## 3. 数据关系

| 主体 | 关联实体 | 关系 |
|---|---|---|
| Skills | Categories | 多对多 |
| Skills | Tags | 多对多 |
| Skills | Platforms | 多对多 |
| Skills | Tools | 多对多 |
| Skills | Collections | 多对多，并保存专题内顺序 |
| Skills | SkillVersions | 一对多 |
| Skills | CrawlTasks | 一对多 |
| Categories | Categories | 父子关系，最多两级 |

## 4. 状态与流转

```text
draft → pending → published ⇄ archived
          │
          └──────→ rejected
```

| 状态 | 公开可见性 | 说明 |
|---|---|---|
| draft | 不可见 | 草稿 |
| pending | 不可见 | 待审核，包括等待管理员处理 AI 建议或异常 |
| published | 可见 | 已由管理员发布 |
| rejected | 不可见 | 已驳回 |
| archived | 不可见 | 已归档或下架，历史版本保留 |

`archived → published` 仅用于管理员重新上架，恢复公开展示时保留原历史版本和来源记录。

驳回后重提已于 2026-11-09 确认为 `rejected → draft → pending → published`；管理员重新编辑和提交后必须重新执行完整发布校验，不允许 `rejected → published` 直接发布。

专题状态流转为 `draft → published` 和 `published ⇄ archived`；`draft`、`archived` 不公开，`published` 可公开，专题内 Skill 仍逐项执行公开过滤。

采集任务按 `queued → running → succeeded / needs_review / failed` 流转；`needs_review` 表示存在需要人工处理的采集或解析异常，`failed` 表示未形成有效审核结果的执行失败，两者重试后重新进入 `queued`。`succeeded` 不代表 Skill 已发布。

专题发布状态和采集任务状态不得复用 Skill 状态名称而不定义语义。

## 5. 时间与数据约束

所有时间戳按 UTC 保存，前台、后台和统计统一使用 `Asia/Shanghai`；Dashboard「最近 7 天新增」按该时区自然日计算，不随访问者浏览器改变统计时区。



- 各公开路由实体的 `slug` 在所属实体内唯一。
- Skills 的 `repository_url + repository_path` 组合唯一；SkillVersions 的 `skill_id + version` 组合唯一。
- GitHub 仓库 URL 保存前规范化，同一仓库和子目录不能重复导入。
- `source_url`、`repository_url` 和 `repository_path` 共同支持来源追踪，不以资源名称判断重复。
- 原始 `raw_content` 与平台 `content`、中文加工字段分开保存。
- 已发布资源产生待审核更新时，旧版本保持公开，新版本未经管理员审核不得公开。
- AI 结果必须可单独修改，采集更新不得覆盖管理员编辑的中文内容。
- 分类、标签、平台和工具与 Skills 使用多对多关系。
- 上下架包括 `published → archived` 和管理员重新上架 `archived → published`，均保留历史版本和来源记录。
- 第一版禁止硬删除 Skill，后台删除入口只执行归档，不得删除历史版本和来源记录。
- 未发现标准 SKILL.md 时任务记录异常并进入异常审核，允许通过 `repository_path` 人工指定文件路径后重试。
- 公开查询仅返回 `published` 资源及可公开的分类、专题等关联数据。
- P1 浏览统计使用 SkillStats 聚合记录，每个 Skill 唯一一条，保存 `view_count` 和 `last_viewed_at`，真实公开详情浏览时原子递增，不记录个人数据或访问事件；排序为 `view_count DESC → published_at DESC → id DESC`。
