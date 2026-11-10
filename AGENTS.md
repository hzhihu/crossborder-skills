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

当前阶段仅完成文档和目录初始化，不代表 Next.js 工程已经创建。

未收到后续工程实施指令前，不创建应用、安装依赖、生成业务代码或修改原始 MVP 文档。

`src` 和 `tests` 当前仅为后续工程预留目录，不得以占位业务代码填充。

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

README 当前 Phase 2 前置链接、只列第 1 至第 5 项的说明和目录树均不是实施依据；未按 [DESIGN_APPROVAL.md](docs/DESIGN_APPROVAL.md) D-08 获批修正前，以 [PRODUCT.md](docs/PRODUCT.md) §10 及 [DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) Phase 2 的第 1 至第 5 项和第 11 项为准，失效锚点 `#7-待确认事项` 和遗漏 `design/prototypes` 的目录树不得用于导航。

发现文件冲突时先停止受影响范围的实现，记录冲突文件、章节、影响和建议，提交产品负责人确认；不得静默选择、混合规则或以实现默认值定案。

[原始 MVP 文档](docs/crossBorder_skills_hub_mvp_v1.md) 必须保留且不可修改，不得以专项规范、冲突整改或历史文档清理为由改写。

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
