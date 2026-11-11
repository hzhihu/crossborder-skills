# AI 任务总规则

## 1. 适用范围

本文件约束本仓库内所有 AI 辅助任务，包括文档、设计、开发、测试、审查和部署工作。

所有任务还应遵守对应模块内更具体的规则；具体规则不得扩大产品范围或降低安全要求。

## 2. 事实与范围

- [原始 MVP 文档](docs/crossBorder_skills_hub_mvp_v1.md)是产品需求的事实来源，必须保留，不得修改或删除。
- 产品范围以 [PRODUCT.md](docs/PRODUCT.md) 为准，P2 和后续版本能力不得在 MVP 中提前实现。
- 原文未确定的数值、产品选择和技术版本必须标记「待确认」，不得擅自定案。
- 需求冲突或信息不足时先提出问题和影响，不以猜测代替确认。
- 每次只完成当前任务要求的最小必要修改，不顺手重构或新增无关能力。

## 3. 当前阶段边界

Next.js 工程已经创建，Phase 1、Phase 2 P0、Phase 3 P0、Phase 4 P0 和 Phase 5 P0 已完成；当前工程进度以 [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) §1 为准。

工程实施必须按照 [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) 的阶段和依赖推进；未收到当前阶段实施指令前，不提前实现后续阶段或 P1、P2 能力，不修改原始 MVP 文档。

`src` 和 `tests` 已包含实际工程与测试代码，不得写入与当前任务无关的占位业务代码。

## 4. 文档与设计

- 中文技术文档保持准确、简洁、可扫读，一段一行。
- 同一概念使用统一术语：资源统称「Skill 资源」时不得把 MCP Server、Agent、Workflow、Prompt、Tool 误认为 Skill 类型。
- 修改跨模块规则时同步检查产品、架构、数据库、界面、计划和验收文档，避免相互矛盾。
- 设计参考放入 `design/references`，过程截图放入 `design/screenshots`，确认后的设计成果放入 `design/approved`，共享组件设计放入 `design/components`。
- 设计成果按下列权威文件执行，候选与批准证据按 [DESIGN_APPROVAL.md](docs/DESIGN_APPROVAL.md) 管理。

### 4.1 文档权威与冲突处理

| 权威文件 | 唯一负责范围 |
|---|---|
| [PRODUCT.md](docs/PRODUCT.md) | 产品范围、业务规则、功能优先级和产品待确认事项 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Next.js、Payload、模块边界和工程实现方式 |
| [DATABASE.md](docs/DATABASE.md) | 数据字段、关系、状态和数据约束 |
| [DESIGN_DIRECTION.md](docs/DESIGN_DIRECTION.md) | 整体视觉方向与视觉原则 |
| [DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) | 设计变量、具体视觉值、断点和量化可访问性标准 |
| [HOMEPAGE_SPEC.md](docs/HOMEPAGE_SPEC.md) | 首页专属布局、内容、交互和状态 |
| [SKILL_CARD_SPEC.md](docs/SKILL_CARD_SPEC.md) | SkillCard、SkillGrid 及其骨架规则 |
| [PAGE_STRUCTURE.md](docs/PAGE_STRUCTURE.md) | 页面清单、页面模块结构、跨页状态和组件复用 |
| [ACCEPTANCE.md](docs/ACCEPTANCE.md) | 验收条件与通过证据 |
| [DESIGN_APPROVAL.md](docs/DESIGN_APPROVAL.md) | 审批流程、审批记录和证据 |

各权威文件不得互相覆盖；专项文件只在其负责范围内优先，不得据此改变其他文件负责的产品或设计规则。

[DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) 仅提供共享组件清单和通用设计原则索引；[UI_SPEC.md](docs/UI_SPEC.md) 已弃用，正文仅作历史参考，不得作为新开发任务依据。

其他冻结文档、历史原型和 README 若仍将 [UI_SPEC.md](docs/UI_SPEC.md) 引用为现行依据或变更同步对象，该引用自本规则起失效，统一以本节权威表为准；历史研究文件中关于 [UI_SPEC.md](docs/UI_SPEC.md) 的「唯一基准」「现行对照」等权威表述同样失效，不得作为现行实现依据。未获批准前不得静默修改这些冻结文件或历史资料，须在 [DESIGN_APPROVAL.md](docs/DESIGN_APPROVAL.md) 登记清理范围和审批要求后统一处理。

任何要求向 [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) 回写 Token 语义的旧指令均不得作为实现依据；设计变量只由 [DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) 决定，旧回写指令须在 [DESIGN_APPROVAL.md](docs/DESIGN_APPROVAL.md) 登记并经审批后清理，不得先行实施。

发现文件冲突时先停止受影响范围的实现，记录冲突文件、章节、影响和建议，提交产品负责人确认；不得静默选择、混合规则或以实现默认值定案。

[原始 MVP 文档](docs/crossBorder_skills_hub_mvp_v1.md) 必须保留且不可修改，不得以专项规范、冲突整改或历史文档清理为由改写。

### 4.2 状态归属与文档同步门槛

| 状态或决策 | 权威记录 | 同步要求 |
|---|---|---|
| 工程阶段、实际完成范围和未交付能力 | [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) §1 | 阶段状态变化时更新；[README.md](README.md) 只保留入口摘要和下一阶段 |
| 产品范围、业务规则和产品决策 | [PRODUCT.md](docs/PRODUCT.md) | 决策确认时更新对应正文和 §10，相关专项文件同步检查 |
| 页面、交互和公开边界 | [PAGE_STRUCTURE.md](docs/PAGE_STRUCTURE.md) 及对应专项文件 | 决策确认时更新现行规则，不只追加确认记录 |
| 截图与视觉成果审批 | [DESIGN_APPROVAL.md](docs/DESIGN_APPROVAL.md) | 候选、批准和退回状态以真实审批记录为准 |
| 验收条件与实际结果 | [ACCEPTANCE.md](docs/ACCEPTANCE.md) 及对应阶段交付记录 | 验收条件与执行结果分开记录，不把计划写成通过 |

代码实现、阶段完成或事项确认后，必须在同一任务内更新受影响的权威文档和当前状态；不是所有代码修改都要更新全部文档，但不得留下与实现或决策冲突的现行描述。

确认事项时，应同时修正同一文件前文的「待确认」「未确认前」和条件降级规则；需要保留历史过程时，必须标明记录日期和当时状态，不得以历史记录代替当前结论。

其他文档不重复维护工程阶段状态，改为链接 [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) §1；确需摘要时只描述本文件所需范围，并链接权威记录。

交付前必须检索受影响文档中的「待确认」「尚未实现」「当前仅」「后续工程实施」等状态词，逐项判断是现行规则还是历史记录，并核对实际目录和代码；不得只更新文件末尾的进度或确认记录。

交付说明必须列出同步修改的文档和仍然开放的确认事项；发现状态冲突但未获处理授权时，停止受影响工作并提交产品负责人确认。

## 5. 后续工程实施

- 技术架构固定为 Next.js + Payload CMS 模块化单体，不拆微服务。
- 遵循 [ARCHITECTURE.md](docs/ARCHITECTURE.md) 的模块边界和 [DATABASE.md](docs/DATABASE.md) 的数据约束。
- 遵循 [CODING_RULES.md](docs/CODING_RULES.md)，先阅读相关文件再修改。
- 前台优先使用 Server Components 和 Payload Local API，不重复实现 CRUD API。
- 采集和 AI 处理通过 Payload Jobs Queue 异步执行，不在 HTTP 请求中同步执行。
- 原始内容与平台加工内容分开存储，采集更新不得覆盖管理员编辑的中文内容，不得删除历史版本。
- AI 只生成建议，不得代替管理员决定资源是否发布。

## 6. 安全底线

- 第一版只采集公开 GitHub 仓库和 Skills.sh 公开资源页面，不增加其他来源，不执行 Skill 中的脚本、命令或仓库程序。
- 外部 Markdown 必须按不可信内容处理，渲染前过滤不安全 HTML 和链接。
- 凭据只能通过环境配置提供，不写入文档、代码、日志或版本库。
- 后台和采集入口必须验证管理员权限，后台页面不得被搜索引擎索引。
- 失败和重试不得造成重复导入、历史内容丢失或未经审核的公开发布。

## 7. 验证与交付

- 按 [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) 的顺序实施，不在前置依赖未完成时进入后续阶段。
- 按 [ACCEPTANCE.md](docs/ACCEPTANCE.md) 编写和执行可验证检查，真实采集流程必须使用公开 GitHub 资源。
- 修改后检查受影响功能、数据完整性、权限、安全、SEO 和响应式表现。
- 交付说明必须列出实际修改、实际执行的检查、未执行事项和已确认风险，不把计划描述为已完成。
