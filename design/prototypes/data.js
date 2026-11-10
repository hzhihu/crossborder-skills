(function exposePrototypeData(root) {
    const skills = [
        {
            slug: "market-research-brief", name: "market-research-brief", chineseName: "市场调研简报",
            summary: "整理公开市场资料，形成结构清晰的调研提纲。适合新品前期探索；需要自行核验来源。",
            category: "选品与市场调研", platforms: ["Amazon", "通用跨境电商"], tools: ["Claude Code", "通用 Agent"],
            tags: ["竞品调研", "市场分析"], publishedAt: "2026-10-18", updatedAt: "2026-11-02", status: "published",
            problem: "面对分散的市场信息，难以快速形成可讨论的调研框架。", scenarios: ["新品方向初筛", "竞品信息归纳"],
            features: ["调研问题拆解", "信息摘要结构", "待核验事项清单"], prerequisites: "准备明确的站点、类目与调研问题；公开资料需要人工复核。",
            reason: "用统一提纲帮助运营人员开始调研，不代替商业判断。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/market-research-brief", author: "Mock Author"
        },
        {
            slug: "listing-draft-editor", name: "listing-draft-editor", chineseName: "Listing 初稿编辑器",
            summary: "根据商品资料生成 Listing 初稿。适合上架前内容准备；需要人工检查事实和平台规范。",
            category: "Listing 商品管理", platforms: ["Amazon", "Shopify"], tools: ["Claude Code", "Cursor"],
            tags: ["文案起草", "商品上架"], publishedAt: "2026-10-16", updatedAt: "2026-11-01", status: "published",
            problem: "商品信息已经齐全，但标题、卖点和描述的整理耗时。", scenarios: ["新品文案初稿", "现有文案结构检查"],
            features: ["卖点整理", "标题草稿", "描述结构建议"], prerequisites: "准备真实商品参数和目标平台规则，不生成未经确认的功能。",
            reason: "把重复的内容组织工作变成可检查的初稿。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/listing-draft-editor", author: "Mock Author"
        },
        {
            slug: "ad-report-review", name: "ad-report-review", chineseName: "广告报表复盘助手",
            summary: "将广告报表整理成复盘问题清单。适合周期性检查；需要真实导出报表。",
            category: "数据分析", platforms: ["Amazon", "TikTok Shop"], tools: ["Codex", "通用 Agent"],
            tags: ["广告复盘", "报表整理"], publishedAt: "2026-10-12", updatedAt: "2026-10-30", status: "published",
            problem: "报表指标很多，运营人员难以快速定位下一轮要检查的问题。", scenarios: ["每周广告复盘", "异常指标整理"],
            features: ["指标分组", "变化摘要", "复盘问题列表"], prerequisites: "准备脱敏后的真实报表，并理解指标口径。",
            reason: "强调问题定位而非自动决策，便于人工继续分析。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/ad-report-review", author: "Mock Author"
        },
        {
            slug: "review-insight-notes", name: "review-insight-notes", chineseName: "客户评价洞察笔记",
            summary: "归纳客户评价中的重复问题。适合产品与服务改进；需要合法获得的评价文本。",
            category: "客服与客户反馈", platforms: ["Amazon", "eBay"], tools: ["Claude Code", "Gemini"],
            tags: ["评价分析", "客户反馈"], publishedAt: "2026-10-09", updatedAt: "2026-10-26", status: "published",
            problem: "大量评价分散，重复出现的问题不容易统一记录。", scenarios: ["差评原因归类", "产品改进记录"],
            features: ["主题归类", "典型反馈摘要", "待跟进问题"], prerequisites: "移除个人信息，并结合原始评价核对摘要。",
            reason: "让反馈整理有固定结构，同时保留人工核验环节。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/review-insight-notes", author: "Mock Author"
        },
        {
            slug: "order-exception-checklist", name: "order-exception-checklist", chineseName: "订单异常检查清单",
            summary: "把订单异常整理成处理清单。适合人工排查；不会自动操作订单系统。",
            category: "ERP 与订单管理", platforms: ["Shopify", "Walmart"], tools: ["Codex", "MCP Compatible"],
            tags: ["订单管理", "异常处理"], publishedAt: "2026-10-05", updatedAt: "2026-10-22", status: "published",
            problem: "订单异常涉及多个检查项，口头交接容易遗漏。", scenarios: ["发货异常排查", "客服交接准备"],
            features: ["异常分类", "检查步骤", "交接摘要"], prerequisites: "准备脱敏订单信息，所有处理仍由负责人员执行。",
            reason: "只辅助整理流程，不执行订单或仓库程序。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/order-exception-checklist", author: "Mock Author"
        },
        {
            slug: "product-image-brief", name: "product-image-brief", chineseName: "商品图片需求简报",
            summary: "把商品卖点转成图片制作需求。适合设计沟通；不直接生成或修改图片。",
            category: "图片与视频", platforms: ["Temu", "SHEIN", "Shopify"], tools: ["Cursor", "通用 Agent"],
            tags: ["图片需求", "设计协作"], publishedAt: "2026-09-28", updatedAt: "2026-10-19", status: "published",
            problem: "运营与设计之间对图片目标、顺序和文案的理解不一致。", scenarios: ["主图需求沟通", "详情页素材规划"],
            features: ["图片清单", "卖点对应", "验收要点"], prerequisites: "准备已确认的商品信息、品牌规范与平台图片要求。",
            reason: "聚焦需求表达，减少跨角色沟通中的遗漏。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/product-image-brief", author: "Mock Author"
        },
        {
            slug: "shipping-status-digest", name: "shipping-status-digest", chineseName: "物流状态摘要",
            summary: "将物流节点整理为易读摘要。适合客服查询前准备；需要人工确认承运商信息。",
            category: "仓储与物流", platforms: ["AliExpress", "通用跨境电商"], tools: ["OpenAI Agents", "通用 Agent"],
            tags: ["物流跟踪", "客服准备"], publishedAt: "2026-09-21", updatedAt: "2026-10-14", status: "published",
            problem: "物流节点使用不同表述，客服整理回复需要反复核对。", scenarios: ["物流进度说明", "异常节点记录"],
            features: ["节点整理", "时间线摘要", "异常提醒文案"], prerequisites: "使用真实且脱敏的物流记录，不向客户自动发送内容。",
            reason: "减少状态转述工作，但保留承运商信息核验。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/shipping-status-digest", author: "Mock Author"
        },
        {
            slug: "sales-weekly-outline", name: "sales-weekly-outline", chineseName: "销售周报提纲",
            summary: "把已确认的数据整理成周报结构。适合团队同步；不替代数据分析结论。",
            category: "数据分析", platforms: ["Amazon", "TikTok Shop", "通用跨境电商"], tools: ["Claude Code", "Codex"],
            tags: ["销售周报", "团队同步"], publishedAt: "2026-09-15", updatedAt: "2026-11-03", status: "published",
            problem: "每周同步重复整理相同栏目，关键结论和后续动作容易分散。", scenarios: ["销售周报", "经营会议准备"],
            features: ["指标摘要", "问题记录", "行动项结构"], prerequisites: "提供口径一致且已核验的数据，结论由业务负责人确认。",
            reason: "提供稳定的信息结构，不制造自动分析或预测能力。", install: "原始安装说明（Mock）：请按照来源仓库的 SKILL.md 手动安装。",
            source: "https://github.com/example/sales-weekly-outline", author: "Mock Author"
        }
    ];

    const categories = ["选品与市场调研", "Listing 商品管理", "广告与营销", "数据分析", "客服与客户反馈", "图片与视频", "ERP 与订单管理", "仓储与物流"];
    const collections = [
        { name: "从调研到 Listing 初稿", description: "人工组合的 Mock 专题，用于展示连续任务入口。", query: "调研" },
        { name: "广告与经营复盘", description: "人工组合的 Mock 专题，不表示自动推荐或工作流。", query: "复盘" }
    ];
    const rootData = { skills, categories, collections, pageSize: 3 };

    if (typeof module === "object" && module.exports) {
        module.exports = rootData;
    } else {
        root.prototypeData = rootData;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
