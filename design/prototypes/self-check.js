const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const data = require("./data.js");
const { getPublishedSkills, getPublishedValues, filterSkills, sortSkills, paginateSkills } = require("./filters.js");

assert.equal(data.skills.length, 8, "两套方向共用八条 Mock Skill");
assert.ok(data.skills.every((skill) => skill.status === "published"), "Mock 数据只包含 published Skill");
assert.equal(new Set(data.skills.map((skill) => skill.slug)).size, data.skills.length, "slug 必须唯一");
assert.equal(getPublishedSkills(data.skills).length, 8, "公开数据过滤保留 published Skill");
const draftSkill = { ...data.skills[0], status: "draft", platforms: ["Draft Only Platform"], tools: ["Draft Only Tool"] };
assert.equal(getPublishedSkills([...data.skills, draftSkill]).length, 8, "草稿不得进入公开结果");
assert.equal(getPublishedValues([...data.skills, draftSkill], "platforms").includes("Draft Only Platform"), false, "草稿独有平台不得成为公开筛选项");
assert.equal(getPublishedValues([...data.skills, draftSkill], "tools").includes("Draft Only Tool"), false, "草稿独有工具不得成为公开筛选项");

const pages = ["home", "skills", "detail"];
const themes = ["a", "b"];
const pageConfigs = themes.flatMap((theme) => pages.map((page) => ({ theme, page, data })));
const pageUrls = pageConfigs.map((config) => `?theme=${config.theme}&page=${config.page}`);
assert.equal(new Set(pageUrls).size, 6, "六页 URL 配置必须唯一");
assert.deepEqual(pageUrls, ["?theme=a&page=home", "?theme=a&page=skills", "?theme=a&page=detail", "?theme=b&page=home", "?theme=b&page=skills", "?theme=b&page=detail"], "六页配置必须覆盖 A/B 与三类页面");

assert.deepEqual(filterSkills(data.skills, { keyword: "listing" }).map((skill) => skill.slug), ["listing-draft-editor"], "搜索英文名称");
assert.deepEqual(filterSkills(data.skills, { keyword: "复盘" }).map((skill) => skill.slug), ["ad-report-review"], "搜索简介和标签");
assert.equal(filterSkills(data.skills, { category: "数据分析" }).length, 2, "分类筛选与同分类推荐数据");
assert.equal(filterSkills(data.skills, { platform: "Shopify" }).length, 3, "平台筛选");
assert.equal(filterSkills(data.skills, { tool: "Codex" }).length, 3, "工具筛选");
assert.deepEqual(filterSkills(data.skills, { keyword: "Listing", category: "广告与营销" }), [], "组合条件无结果");
assert.equal(filterSkills(data.skills, {}).length, 8, "清除条件恢复全部结果");
assert.deepEqual(sortSkills(data.skills, "published").map((skill) => skill.slug), ["market-research-brief", "listing-draft-editor", "ad-report-review", "review-insight-notes", "order-exception-checklist", "product-image-brief", "shipping-status-digest", "sales-weekly-outline"], "最新发布完整顺序");
assert.deepEqual(sortSkills(data.skills, "updated").map((skill) => skill.slug), ["sales-weekly-outline", "market-research-brief", "listing-draft-editor", "ad-report-review", "review-insight-notes", "order-exception-checklist", "product-image-brief", "shipping-status-digest"], "最近更新完整顺序且与发布顺序不同");
assert.ok(sortSkills(data.skills, "name").every((skill, index, skills) => index === 0 || skills[index - 1].chineseName.localeCompare(skill.chineseName, "zh-CN") <= 0), "名称排序");
assert.deepEqual(paginateSkills(data.skills, 1, 3).items.map((skill) => skill.slug), data.skills.slice(0, 3).map((skill) => skill.slug), "第一页数据");
assert.equal(paginateSkills(data.skills, 3, 3).items.length, 2, "末页数据");
assert.equal(paginateSkills(data.skills, 99, 3).page, 3, "页码限制在末页");
assert.equal(paginateSkills([], 1, 3).items.length, 0, "无结果分页");
assert.equal(paginateSkills([], 1, 3).pageCount, 1, "无结果不生成多余页码");

const app = readFileSync(new URL("./app.js", `file://${__filename}`), "utf8");
assert.match(app, /buildUrl\("detail", \{ slug: skill\.slug \}\)/, "详情链接必须基于当前列表查询状态");
assert.match(app, /href="\$\{buildDetailReturnUrl\(\)\}"/, "详情返回入口必须使用保留状态的 URL");
assert.match(app, /不可用条件：/, "非法筛选值必须可见");
assert.match(app, /matchMedia\("\(min-width: 901px\)"\)/, "离开移动断点必须关闭抽屉");
assert.match(app, /function buildHomeDiscoveryUrl\(overrides\)/, "首页发现入口必须独立构造干净 URL");
assert.match(app, /buildHomeDiscoveryUrl\(\{ category \}\)/, "首页分类不得继承旧列表条件");
assert.match(app, /document\.body\.style\.overflow = "hidden"/, "抽屉打开必须锁定背景滚动");
assert.match(app, /document\.body\.style\.overflow = ""/, "抽屉关闭必须恢复背景滚动");

const styles = readFileSync(new URL("./styles.css", `file://${__filename}`), "utf8");
assert.match(styles, /\na:active \{ color: var\(--accent\);/, "通用行内链接必须有独立 active 状态");
assert.match(styles, /\.main-nav a\[aria-current\]:hover/, "当前导航必须有可见 hover 状态");
assert.match(styles, /\.main-nav a:hover/, "主导航必须有 hover 状态");
assert.match(styles, /\.brand:active \.brand-mark/, "品牌链接必须有 active 状态");
assert.match(styles, /\.pagination a:not\(\.disabled\):hover/, "可用分页链接必须有 hover 状态");
assert.doesNotMatch(styles, /\.skill-card:hover/, "不可点击 Skill 卡片不得提供虚假 hover 状态");
const responsiveStyles = styles.slice(styles.indexOf("@media (max-width: 900px)"), styles.indexOf("@media (max-width: 600px)"));
assert.match(responsiveStyles, /\.hero-layout, body\[data-theme="b"\] \.hero-layout \{ grid-template-columns: 1fr;/, "900px 内 B Hero 必须与 A 一样单列");
const smallScreenStyles = styles.slice(styles.indexOf("@media (max-width: 600px)"));
assert.match(smallScreenStyles, /\.detail-hero \.button \{ max-width: 100%; white-space: normal;/, "小屏详情来源按钮必须限制宽度并允许换行");

console.log("Self-check passed: unique page URLs, public filters, full sorting, list-state links, invalid options, breakpoint and interaction static rules. Browser checks remain required.");
