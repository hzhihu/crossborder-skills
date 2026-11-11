# 设计系统

## 1. 文档定位

本文仅保留共享组件清单、通用设计原则和权威文件索引，不再定义独立的设计 Token、首页、Skill 卡片或页面结构规则。

产品业务规则以 [PRODUCT.md](PRODUCT.md) 为准，整体视觉方向以 [DESIGN_DIRECTION.md](DESIGN_DIRECTION.md) 为准，设计变量、具体视觉值、断点和量化可访问性标准以 [DESIGN_TOKENS.md](DESIGN_TOKENS.md) 为唯一权威。

首页专属布局与交互以 [HOMEPAGE_SPEC.md](HOMEPAGE_SPEC.md) 为准，SkillCard、SkillGrid 及其骨架以 [SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md) 为准，页面模块结构与组件复用以 [PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) 为准。

本文不得覆盖上述专项文件；发现冲突时停止受影响范围的实现，记录冲突并提交产品负责人确认。

## 2. 通用设计原则

- 以搜索、筛选、比较和资源发现为中心，不让装饰妨碍主要任务。
- 相同组件跨页面复用，不按页面复制语义相同但结构不同的实现。
- 加载、正常数据、无公开数据、筛选无结果、请求失败和无权限状态应可区分。
- 内容缺失时按对应组件专项规则降级，不使用伪造数据、图片、链接或占位能力补齐界面。
- 外部 Markdown 和图片按不可信内容处理，不执行其中的脚本、命令或程序。
- 后台继续使用 Payload Admin，不建立独立后台设计系统。

具体颜色、字体、排版、间距、圆角、边框、阴影、尺寸、容器、网格、断点和动效均引用 [DESIGN_TOKENS.md](DESIGN_TOKENS.md)，本文不重复定义或保留旧数值。

## 3. 共享组件清单

下表只登记共享职责，具体字段、模块组合、排序、URL、响应式和状态文案由对应权威文件定义。

| 组件 | 共享职责 | 现行规则来源 |
|---|---|---|
| Header / Footer | 全站导航与已确认页脚信息 | [HOMEPAGE_SPEC.md](HOMEPAGE_SPEC.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| SearchBox | 关键词输入、可访问标签、校验和提交 | [HOMEPAGE_SPEC.md](HOMEPAGE_SPEC.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| SkillCard / SkillGrid / SkillCardSkeleton | 统一 Skill 资源卡片、网格和加载骨架 | [SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md) |
| CategoryCard | 分类导航与公开信息展示 | [PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| CollectionCard | 专题入口与公开信息展示 | [PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| Tag / PlatformBadge / ToolBadge | 已确认关联信息的统一展示 | [SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| ResourceTypeBadge | 未来获批多类型公开后的资源类型标识 | 第一版已确认只公开 Skill，不启用该组件；当前 SkillCard 不包含该字段，见 [SKILL_CARD_SPEC.md](SKILL_CARD_SPEC.md) 与 [DESIGN_APPROVAL.md](DESIGN_APPROVAL.md) |
| FilterPanel | 展示和变更已确认筛选条件 | [PRODUCT.md](PRODUCT.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| SortSelector | 选择已确认排序 | [PRODUCT.md](PRODUCT.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| Pagination | 普通分页，不使用无限滚动 | [PRODUCT.md](PRODUCT.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |
| EmptyState / LoadingState / ErrorState | 区分空数据、筛选无结果、加载和请求失败 | [PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) 及对应页面专项 |
| MarkdownRenderer | 安全渲染已确认公开的 Markdown 内容 | [PRODUCT.md](PRODUCT.md)、[PAGE_STRUCTURE.md](PAGE_STRUCTURE.md) |

本清单只定义共享职责，不代替实现进度记录；实际组件和工程完成范围以 [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) §1 及 `src/components` 为准。

## 4. 通用交互与可访问性约束

所有可操作元素应提供明确的悬停、焦点和激活状态，不得移除键盘焦点，也不得只用颜色表达状态。

表单控件和图标操作应具有可理解的名称或标签，内容图片提供替代文本，装饰图片使用空替代文本。

加载失败应提供明确反馈和恢复入口，筛选无结果应保留条件并提供清除入口，空数据不得误报为失败。

移动筛选使用全站共享且可明确关闭的右侧抽屉；关闭后保留已选条件，焦点返回筛选触发按钮，并按专项规则防止背景误操作。

键盘顺序、焦点样式、触控目标、颜色对比度、非文本对比度和 reduced motion 按 [DESIGN_TOKENS.md](DESIGN_TOKENS.md) 与对应专项规范验收，本文不另设量化标准。

## 5. 设计成果管理

设计参考放入 `design/references`，候选截图放入 `design/screenshots` 并按页面和版本组织，真实批准后的证据复制到 `design/approved`，共享组件说明放入 `design/components`。

审批流程、记录字段、当前状态和待处理事项见 [DESIGN_APPROVAL.md](DESIGN_APPROVAL.md)。

没有真实审批记录不得将候选成果标记为已批准；截图批准不等于代码完成，也不表示目录中已有组件或 `tokens.css`。
