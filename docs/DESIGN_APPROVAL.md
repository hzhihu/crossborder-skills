# 设计审批与证据管理

## 1. 当前状态

Phase 3 首页移动、平板和桌面候选截图已于 2026-11-10 由产品负责人在当前对话明确批准，批准版本为 `phase-3`，审批记录和证据见 §4。

其他截图与视觉成果仍为「未批准」；该状态只描述截图和视觉成果证据，不否定 [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) 与 [DESIGN_TOKENS.md](DESIGN_TOKENS.md) 已记录的规范冻结确认，规范效力仍按各文件及 [AGENTS.md](../AGENTS.md) 权威表执行。

`design/screenshots` 中的文件均为候选或历史参考，不因文件存在、命名包含方向或曾被评审而自动成为已批准成果。

只有完成真实审批并登记证据的文件可以放入 `design/approved`；不得预先创建批准文件、虚构审批记录或把其他候选截图标记为 `approved`。

本文件只记录审批机制与视觉证据状态，不记录工程进度；共享组件和页面的实际完成范围以 [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) §1 为准，截图未获批准不影响已确认规范的效力。

## 2. 候选证据组织

候选截图放入 `design/screenshots`，按页面和版本建立子目录，例如 `design/screenshots/<页面>/<版本>/`；实际目录名应使用本次提交的真实页面和设计版本，不得填写虚构版本。

候选提交至少说明对应页面、视口或状态、对应规范文件和变更原因，并提供可访问的候选文件链接。

候选截图可以供评审和修改，但在完成真实审批前不得复制到 `design/approved`，不得作为已批准实现依据。

Phase 3 首页候选截图已生成于 `design/screenshots/phase-3/home-390.png`、`home-768.png`、`home-1200.png`，对应移动、平板和桌面视口。候选实现依据 DESIGN_TOKENS、HOMEPAGE_SPEC、SKILL_CARD_SPEC 和 PAGE_STRUCTURE；这些截图只用于评审，未获批准，不得复制到 `design/approved`。

## 3. 真实审批流程

1. 提交候选截图及变更说明，核对 [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md)、[DESIGN_TOKENS.md](DESIGN_TOKENS.md)、[HOMEPAGE_SPEC.md](HOMEPAGE_SPEC.md)、[SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) 和其他适用权威文件。
2. 由实际有权审批的人员完成评审，明确记录批准或退回；口头推测、文件移动、任务分派或 AI 自检均不等于批准。
3. 获批后在本文件追加真实审批记录，填写审批人、审批日期、设计版本、变更原因、对应规范文件及候选证据链接。
4. 获批后将对应候选证据复制到 `design/approved` 的相同页面和版本路径，并在审批记录中补充批准证据链接。
5. 后续变更建立新版本和新记录，不覆盖历史批准证据；退回或作废时保留真实记录和原因。

只有完成第 2 至第 4 步并有可核对记录与文件证据的成果才能标记为已批准。

## 4. 审批记录

### A-01：Phase 3 首页三个视口

| 字段 | 审批内容 |
|---|---|
| 审批人 | 产品负责人，2026-11-10 当前对话明确批准 |
| 审批日期 | 2026-11-10 |
| 设计版本 | `phase-3` |
| 审批结果 | 批准 |
| 变更原因 | 确认 Phase 3 首页在移动、平板和桌面视口的候选视觉成果 |
| 对应规范文件 | [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md)、[DESIGN_TOKENS.md](DESIGN_TOKENS.md)、[HOMEPAGE_SPEC.md](HOMEPAGE_SPEC.md)、[SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| 候选证据 | [home-390.png](../design/screenshots/phase-3/home-390.png)、[home-768.png](../design/screenshots/phase-3/home-768.png)、[home-1200.png](../design/screenshots/phase-3/home-1200.png) |
| 批准证据 | [home-390.png](../design/approved/phase-3/home-390.png)、[home-768.png](../design/approved/phase-3/home-768.png)、[home-1200.png](../design/approved/phase-3/home-1200.png) |
| 影响范围 | 仅首页 `/` 的 390px、768px、1200px 视口正常状态 |
| 后续限制 | 不代表其他页面、交互状态、后台、工程功能或完整可访问性验收已获批准；后续视觉变更须建立新版本和审批记录 |

后续获批时追加一条包含以下全部字段的记录，不得用空白记录、占位人名、占位日期或占位版本冒充批准：

| 字段 | 获批时填写内容 |
|---|---|
| 审批人 | 实际完成审批的人员及可核对身份 |
| 审批日期 | 实际批准日期，使用 `YYYY-MM-DD` |
| 设计版本 | 本次提交的真实版本标识 |
| 审批结果 | 仅在有真实批准时填写「批准」；退回须记录原因 |
| 变更原因 | 本次设计新增或调整的实际原因 |
| 对应规范文件 | 适用权威文件及具体章节链接 |
| 候选证据 | `design/screenshots` 中实际候选文件的相对链接 |
| 批准证据 | 获批复制后 `design/approved` 中实际文件的相对链接 |
| 影响范围 | 涉及页面、视口、状态和组件 |
| 后续限制 | 仍未确认事项及不得据此实施的范围 |

## 5. 批准效力边界

截图批准只表示对应设计版本在记录范围内获批，不等于 Next.js 工程、Payload 配置、组件、样式、交互、响应式、可访问性或测试已经完成。

截图批准不能改变产品范围，不能确认搜索组合、默认排序、语言策略、技术版本或其他待确认事项，也不能替代代码评审与实现验收。

规范与截图冲突时停止受影响范围的实现，记录冲突并提交产品负责人确认，不以截图覆盖权威文件。

## 6. P2 待处理登记

以下是文档和设计整改的待处理事项，不表示这些事项都属于产品 P2 功能，也不得借此扩大 MVP 范围。

| 编号 | 待处理事项 | 当前状态与处理边界 |
|---|---|---|
上述事项均需对应负责人明确确认后处理，不得通过截图批准、原型或实现默认值提前定案。

## 7. 已完成处理记录

以下记录保留对应日期的处理结果和当时状态，不作为当前工程进度来源；后续状态以各权威文件和 [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) §1 为准。

| 编号 | 审批人与日期 | 变更原因 | 处理结果与对应规范文件 |
|---|---|---|---|
| D-10 | 产品负责人（当前对话明确批准），2026-11-10 | Phase 1 至 Phase 3 P0 完成及多项产品决策确认后，部分现行文档仍保留初始化状态和旧待确认描述 | 已同步 `AGENTS.md`、README、产品、架构、编码、设计方向、设计系统、首页、页面结构和 Skill 卡片规范；保留原始 MVP、历史研究和审批历史，不将候选截图标记为批准。新增状态归属与文档同步门槛，要求代码、阶段或决策变化时在同一任务内更新权威文档并检索旧状态词。本次只修正文档，不新增功能或改变已确认产品规则。 |
| D-09 | 产品负责人（当前对话明确批准），2026-11-09 | `DESIGN_DIRECTION.md` §8 错引 `DESIGN_SYSTEM.md` §5 为共享组件清单 | 已将共享组件引用从 §5 修正为 §3；实际共享组件清单位于 §3。修改文件：[DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) §8。本次仅修正文档引用，不涉及产品范围、设计 Token、UI 实现或截图批准。 |
| D-06 | 产品负责人（当前对话明确批准），2026-11-09 | 冻结规范中的 `UI_SPEC` 现行引用、Token 回写旧指令及历史资料旧权威表述 | 已将 `HOMEPAGE_SPEC.md`、`DESIGN_DIRECTION.md`、`DESIGN_TOKENS.md`、`SKILL_CARD_SPEC.md` 中的现行引用替换为 `AGENTS.md` 指定的权威文件；已停止向 `DESIGN_SYSTEM.md` 回写 Token，Token 仅以 `DESIGN_TOKENS.md` 为准；历史研究和原型仅增加失效说明，未删除原文，旧参数与旧权威描述不得用于生产实现。本次未修改产品业务规则。 |
| D-08 | 产品负责人（当前对话明确批准），2026-11-09 | README 设计导航、PRODUCT 锚点、Phase 2 前置范围和目录树过期 | 已更新设计文档导航并标记 `UI_SPEC.md` 仅作历史参考；PRODUCT 锚点已改为 `#10-待确认事项`，Phase 2 前置范围已改为第 1 至第 5 项及第 11 项，目录树已补充 `design/prototypes`。修改文件：[README.md](../README.md)。本次仅修正文档导航和说明，不涉及产品规则、技术实现或截图批准。 |
| D-07 | 产品负责人（当前对话明确批准），2026-11-09 | 历史原型查询参数需要明确为 Mock，避免被误用为生产 URL 规则 | 已确认 `keyword`、`category`、`platform`、`tool`、`sort`、`resultPage` 仅为 Mock 与历史研究，不作为生产实现依据；当时仅确认搜索关键词参数 `q`；2026-11-09 后续已批准 `category`、`platform`、`tool`、`tag`、`sort`、`page` 及重复 slug 参数格式，页码异常处理和其他排序并列规则继续待确认。历史资料保留，不新增搜索能力。 |
| D-01 | 产品负责人（当前对话明确批准），2026-11-09 | 历史方向 B 和 A/B 原型切换需要与当前纯 A 方向明确区分 | 已确认方向 B 和 A/B 原型切换仅为历史研究，不作为当前设计或实现依据；已在 [design/prototypes/README.md](../design/prototypes/README.md) 顶部补充失效说明。历史代码、研究和截图保留，不视为批准设计或生产功能。 |
| D-02 | 产品负责人（当前对话明确批准），2026-11-09 | 防止 `ResourceTypeBadge` 在多类型公开获批前被提前启用 | 已确认仅公开 Skill 时不显示 ResourceTypeBadge；只有产品负责人批准公开多种资源类型，并同步 `PRODUCT.md`、`PAGE_STRUCTURE.md`、`SKILL_CARD_SPEC.md`、`DESIGN_SYSTEM.md` 及原 MVP 需求口径后，才允许按真实 `resource_type` 实施徽标。当前不启用、不开发。 |
| D-03 | 产品负责人（当前对话明确要求使用最新版），2026-11-09 | 固定 Next.js、Payload 和 Tailwind CSS 的当前最新版本并核查兼容性 | 已在 [ARCHITECTURE.md](ARCHITECTURE.md) §2.1 固定 `next@16.4.5`、`react@19.3.1`、`react-dom@19.3.1`、`payload@3.93.0`、`@payloadcms/next@3.93.0`、`tailwindcss@4.3.5`、`shadcn@4.23.0` 和 Node.js `>=24.22.1`。版本来自当日 npm 官方 registry；已核对 Next.js 与 Payload 的 Next.js 范围、React 对齐和 Node.js 引擎要求。当前仅完成静态兼容性核查，未安装依赖，未执行构建或启动验证。 |
| D-04 | 产品负责人（当前对话明确批准），2026-11-09 | 将冻结的 768px 和 1024px 断点转换为 Tailwind CSS 4 构建规则 | 已批准后续使用 `@theme` 将 `tablet` 映射为 `48rem`、`desktop` 映射为 `64rem`，采用移动优先的 1/2/3 列网格，不在媒体查询中直接使用 CSS Variable；映射已记录于 [ARCHITECTURE.md](ARCHITECTURE.md) §2.1。当前未创建配置文件，实施时验证断点列数和无横向溢出。 |
| D-05 | 产品负责人（当前对话明确批准），2026-11-09 | 确认第一版首页语言策略，避免中英文两套内容并行 | 已确认第一版采用中文界面与中文业务说明，保留必要英文原名和技术内容；真实中文字段优先，缺失时使用真实英文原文，不伪造翻译，不提供完整双语并排展示或语言切换。已同步 [PRODUCT.md](PRODUCT.md)、[DESIGN_DIRECTION.md](DESIGN_DIRECTION.md)、[HOMEPAGE_SPEC.md](HOMEPAGE_SPEC.md)、[SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md) 和 [PAGE_STRUCTURE.md](PAGE_STRUCTURE.md)。后续完整双语方案另行审批。 |
