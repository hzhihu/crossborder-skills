const prototypeRoot = document.getElementById("app");
const prototypeParams = new URLSearchParams(window.location.search);
const prototypeTheme = prototypeParams.get("theme") === "b" ? "b" : "a";
const prototypePage = ["home", "skills", "detail"].includes(prototypeParams.get("page")) ? prototypeParams.get("page") : "home";
const prototypeData = window.prototypeData;
const prototypeFilters = window.prototypeFilters;
let returnFocusElement = null;

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function buildUrl(page, overrides = {}) {
    const params = new URLSearchParams(prototypeParams);
    params.delete("anchor");
    params.set("theme", prototypeTheme);
    params.set("page", page);
    if (page !== "detail") {
        params.delete("slug");
    }
    if (page === "home" || (page === "skills" && Object.keys(overrides).length === 0)) {
        ["keyword", "category", "platform", "tool", "sort", "resultPage"].forEach((key) => params.delete(key));
    }
    Object.entries(overrides).forEach(([key, value]) => value ? params.set(key, value) : params.delete(key));
    return `?${params.toString()}`;
}

function buildHomeDiscoveryUrl(overrides) {
    const params = new URLSearchParams({ theme: prototypeTheme, page: "skills" });
    Object.entries(overrides).forEach(([key, value]) => params.set(key, value));
    return `?${params.toString()}`;
}

function renderHeader() {
    return `<header class="site-header">
        <div class="container header-inner">
            <a class="brand" href="${buildUrl("home")}" aria-label="CrossBorder Skills Hub 原型首页"><span class="brand-mark" aria-hidden="true">CB</span><span>CrossBorder <strong>Skills Hub</strong></span></a>
            <button class="menu-button" type="button" aria-expanded="false" aria-controls="mainNav">菜单</button>
            <nav id="mainNav" class="main-nav" aria-label="主导航">
                <a href="${buildUrl("skills")}" ${prototypePage === "skills" ? 'aria-current="page"' : ""}>Skills</a>
                <a href="?theme=${prototypeTheme}&page=skills&category=${encodeURIComponent("选品与市场调研")}">分类</a>
                <a href="${buildUrl("home")}#collections">专题</a>
                <a class="theme-link" href="${buildUrl(prototypePage, { theme: prototypeTheme === "a" ? "b" : "a" })}">切换方向 ${prototypeTheme === "a" ? "B" : "A"}</a>
            </nav>
        </div>
    </header>`;
}

function renderFooter() {
    return `<footer class="site-footer"><div class="container footer-inner"><p><strong>CrossBorder Skills Hub</strong> · 静态视觉原型</p><p>所有资源、专题和数量均为 Mock，仅用于设计比较，不代表真实收录或统计。</p></div></footer>`;
}

function renderMockNotice() {
    return `<div class="mock-notice" role="note">方向 ${prototypeTheme.toUpperCase()} · 所有内容均为 Mock · 仅展示 published 状态</div>`;
}

function renderSearchForm(isHome = false) {
    const keyword = isHome ? "" : (prototypeParams.get("keyword") || "");
    return `<form class="search-form" action="" method="get" data-search-form>
        <input type="hidden" name="theme" value="${prototypeTheme}">
        <input type="hidden" name="page" value="skills">
        ${isHome ? "" : ["category", "platform", "tool", "sort"].map((name) => `<input type="hidden" name="${name}" value="${escapeHtml(prototypeParams.get(name) || "")}">`).join("")}
        <label for="${isHome ? "homeSearch" : "listSearch"}">${isHome ? "按业务问题或 Skill 名称搜索" : "搜索当前目录"}</label>
        <div class="search-row"><input id="${isHome ? "homeSearch" : "listSearch"}" name="keyword" type="search" value="${escapeHtml(keyword)}" placeholder="例如：Listing、广告复盘"><button class="button primary" type="submit">搜索 Skills</button></div>
    </form>`;
}

function renderBadges(skill) {
    return `<div class="badge-row"><span class="category-badge">${skill.category}</span>${skill.platforms.map((item) => `<span class="badge">${item}</span>`).join("")}${skill.tools.map((item) => `<span class="badge tool">${item}</span>`).join("")}</div>`;
}

function renderSkillCard(skill) {
    return `<article class="skill-card">
        <div class="card-heading"><span class="skill-icon" aria-hidden="true">${skill.chineseName.slice(0, 1)}</span><div><p class="eyebrow">${skill.category}</p><h3 class="chinese-name">${skill.chineseName}</h3><p class="english-name">${skill.name}</p></div></div>
        <p class="skill-summary">${skill.summary}</p>
        ${renderBadges(skill)}
        <div class="card-footer"><span>更新于 ${skill.updatedAt}</span><div class="card-actions"><a href="${buildUrl("detail", { slug: skill.slug })}">查看详情<span class="visually-hidden">：${skill.chineseName}</span></a><a href="${skill.source}" target="_blank" rel="noopener noreferrer">GitHub Mock<span class="visually-hidden">：${skill.chineseName}（新窗口）</span></a></div></div>
    </article>`;
}

function renderSkillGrid(skills) {
    return `<div class="skill-grid">${skills.map(renderSkillCard).join("")}</div>`;
}

function renderHome() {
    const publishedSkills = prototypeFilters.getPublishedSkills(prototypeData.skills);
    const recentSkills = prototypeFilters.sortSkills(publishedSkills, "published").slice(0, 3);
    return `<section class="hero"><div class="container hero-layout"><div><p class="eyebrow">CROSS-BORDER BUSINESS SKILLS</p><h1>把跨境业务问题，<br>变成可查找的 Skill。</h1><p class="hero-copy">为运营与开发者整理 AI Skill 的用途、前提和来源。先从任务出发，再判断是否适合。</p></div><div class="hero-search">${renderSearchForm(true)}<div class="quick-searches" aria-label="示例搜索"><span>示例搜索</span><a href="${buildHomeDiscoveryUrl({ keyword: "Listing" })}">Listing</a><a href="${buildHomeDiscoveryUrl({ keyword: "复盘" })}">广告复盘</a></div></div></div></section>
        <section class="stats container" aria-label="Mock 数据概况"><div><strong>${publishedSkills.length}</strong><span>Mock Skills</span></div><div><strong>${prototypeData.categories.length}</strong><span>Mock 业务分类</span></div><div><strong>${prototypeData.collections.length}</strong><span>Mock 专题</span></div><p>仅统计当前 Mock 数据，非平台真实数据。</p></section>
        <section class="section container"><div class="section-heading"><div><p class="chapter">01 · 按业务查找</p><h2>常用业务分类</h2></div><a href="${buildUrl("skills")}">查看全部 Skills</a></div><div class="category-grid">${prototypeData.categories.slice(0, 4).map((category, index) => `<a class="category-card" href="${buildHomeDiscoveryUrl({ category })}"><span>0${index + 1}</span><strong>${category}</strong><small>${publishedSkills.filter((skill) => skill.category === category).length} 个 Mock Skill</small></a>`).join("")}</div></section>
        <section class="section container"><div class="section-heading"><div><p class="chapter">02 · 最近新增</p><h2>从最新整理开始</h2></div><p>按 Mock 发布时间排列</p></div>${renderSkillGrid(recentSkills)}</section>
        <section id="collections" class="section container"><div class="section-heading"><div><p class="chapter">03 · 编辑专题</p><h2>沿着任务继续</h2></div><p>人工组合示例，不是自动推荐</p></div><div class="collection-grid">${prototypeData.collections.map((collection, index) => `<a class="collection-card" href="${buildHomeDiscoveryUrl({ keyword: collection.query })}"><span>专题 0${index + 1}</span><h3>${collection.name}</h3><p>${collection.description}</p><strong>查看相关 Mock Skills →</strong></a>`).join("")}</div></section>`;
}

function getUniqueValues(key) {
    return prototypeFilters.getPublishedValues(prototypeData.skills, key);
}

function renderSelect(name, label, values) {
    const currentValue = prototypeParams.get(name) || "";
    const invalidOption = currentValue && !values.includes(currentValue) ? `<option value="${escapeHtml(currentValue)}" selected disabled>不可用条件：${escapeHtml(currentValue)}</option>` : "";
    return `<label class="filter-field">${label}<select name="${name}"><option value="">全部</option>${invalidOption}${values.map((value) => `<option value="${escapeHtml(value)}" ${value === currentValue ? "selected" : ""}>${value}</option>`).join("")}</select></label>`;
}

function renderFilterFields() {
    return `<input type="hidden" name="theme" value="${prototypeTheme}"><input type="hidden" name="page" value="skills"><input type="hidden" name="keyword" value="${escapeHtml(prototypeParams.get("keyword") || "")}"><input type="hidden" name="sort" value="${escapeHtml(prototypeParams.get("sort") || "published")}">${renderSelect("category", "业务分类", prototypeData.categories)}${renderSelect("platform", "电商平台", getUniqueValues("platforms"))}${renderSelect("tool", "适用工具", getUniqueValues("tools"))}`;
}

function renderPagination(page, pageCount) {
    if (pageCount <= 1) {
        return "";
    }
    return `<nav class="pagination" aria-label="资源分页"><a class="${page === 1 ? "disabled" : ""}" ${page === 1 ? 'aria-disabled="true" tabindex="-1"' : `href="${buildUrl("skills", { resultPage: String(page - 1) })}"`}>上一页</a><span>第 ${page} / ${pageCount} 页</span><a class="${page === pageCount ? "disabled" : ""}" ${page === pageCount ? 'aria-disabled="true" tabindex="-1"' : `href="${buildUrl("skills", { resultPage: String(page + 1) })}"`}>下一页</a></nav>`;
}

function renderSkills() {
    const query = { keyword: prototypeParams.get("keyword"), category: prototypeParams.get("category"), platform: prototypeParams.get("platform"), tool: prototypeParams.get("tool") };
    const filteredSkills = prototypeFilters.filterSkills(prototypeData.skills, query);
    const sortedSkills = prototypeFilters.sortSkills(filteredSkills, prototypeParams.get("sort") || "published");
    const pagination = prototypeFilters.paginateSkills(sortedSkills, prototypeParams.get("resultPage"), prototypeData.pageSize);
    if (prototypeParams.has("resultPage") && prototypeParams.get("resultPage") !== String(pagination.page)) {
        prototypeParams.set("resultPage", String(pagination.page));
        window.history.replaceState(null, "", buildUrl("skills", { resultPage: String(pagination.page) }));
    }
    return `<div class="container page-heading"><nav aria-label="面包屑"><a href="${buildUrl("home")}">首页</a> / <span aria-current="page">Skills</span></nav><p class="eyebrow">SKILL DIRECTORY</p><h1>找到适合当前任务的 Skill</h1><p>组合关键词、分类、平台和工具筛选，再进入详情核对来源与前提。</p></div>
        <div class="container directory-layout"><aside class="desktop-filters" aria-label="桌面筛选"><form data-filter-form><h2>组合筛选</h2>${renderFilterFields()}<button class="button primary" type="submit">应用筛选</button><a class="clear-link" href="${buildUrl("skills")}">清除全部条件</a></form></aside>
        <section class="results" aria-labelledby="resultsTitle"><div class="list-tools">${renderSearchForm()}<button class="button filter-open" type="button" data-open-filters>打开筛选</button><label class="sort-field">排序<select data-sort><option value="published" ${(prototypeParams.get("sort") || "published") === "published" ? "selected" : ""}>最新发布</option><option value="updated" ${prototypeParams.get("sort") === "updated" ? "selected" : ""}>最近更新</option><option value="name" ${prototypeParams.get("sort") === "name" ? "selected" : ""}>中文名称</option></select></label></div>
        <div class="result-summary"><h2 id="resultsTitle">${filteredSkills.length} 个 Mock 结果</h2><a href="${buildUrl("skills")}">清除筛选</a></div><div aria-live="polite" class="visually-hidden">当前有 ${filteredSkills.length} 个结果，第 ${pagination.page} 页</div>
        ${pagination.items.length ? `${renderSkillGrid(pagination.items)}${renderPagination(pagination.page, pagination.pageCount)}` : `<div class="empty-state"><h3>没有匹配的 Mock Skill</h3><p>当前条件已保留。可以减少关键词或清除筛选后重试。</p><a class="button primary" href="${buildUrl("skills")}">清除全部条件</a></div>`}</section></div>
        <dialog class="filter-drawer" aria-labelledby="drawerTitle" data-filter-drawer><form method="dialog" class="drawer-heading"><h2 id="drawerTitle">筛选 Skills</h2><button class="button" aria-label="关闭筛选抽屉">关闭</button></form><form data-filter-form>${renderFilterFields()}<button class="button primary" type="submit">应用筛选</button><a class="clear-link" href="${buildUrl("skills")}">清除全部条件</a></form></dialog>`;
}

function renderDetailList(title, items) {
    return `<section class="detail-section"><h2>${title}</h2><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></section>`;
}

function buildDetailReturnUrl() {
    return buildUrl("skills", { resultPage: prototypeParams.get("resultPage") || "" });
}

function renderDetail() {
    const slug = prototypeParams.get("slug");
    const skill = slug ? prototypeData.skills.find((item) => item.slug === slug && item.status === "published") : null;
    if (!skill) {
        return `<section class="container empty-state"><h1>Skill 不可用</h1><p>该 Mock 资源不存在或未发布。</p><a class="button primary" href="${buildDetailReturnUrl()}">返回 Skills</a></section>`;
    }
    const relatedSkills = prototypeData.skills.filter((item) => item.status === "published" && item.slug !== skill.slug && item.category === skill.category).slice(0, 2);
    return `<div class="container detail-page"><nav aria-label="面包屑"><a href="${buildUrl("home")}">首页</a> / <a href="${buildDetailReturnUrl()}">Skills</a> / <span aria-current="page">${skill.chineseName}</span></nav>
        <header class="detail-hero"><div class="card-heading"><span class="skill-icon" aria-hidden="true">${skill.chineseName.slice(0, 1)}</span><div><p class="eyebrow">${skill.category} · Mock Skill</p><h1>${skill.chineseName}</h1><p class="english-name">${skill.name}</p></div></div><p class="hero-copy">${skill.summary}</p>${renderBadges(skill)}<a class="button primary" href="${skill.source}" target="_blank" rel="noopener noreferrer">查看 GitHub Mock 来源（新窗口）</a></header>
        <div class="detail-layout"><div><section class="detail-section"><h2>解决什么问题</h2><p>${skill.problem}</p></section>${renderDetailList("适用场景", skill.scenarios)}${renderDetailList("主要功能", skill.features)}<section class="detail-section"><h2>使用前提</h2><p>${skill.prerequisites}</p></section><section class="detail-section"><h2>平台整理说明</h2><p>${skill.reason}</p><p class="note">这是 Mock 编辑说明，不代表质量、安全或自动推荐保证。</p></section></div>
        <aside class="detail-aside"><section><h2>安装说明</h2><pre><code>${skill.install}</code></pre><p class="note">一键复制是否提供：待确认。本原型未实现复制。</p></section><section><h2>来源信息</h2><dl><dt>作者</dt><dd>${skill.author}</dd><dt>本站收录（Mock）</dt><dd>${skill.publishedAt}</dd><dt>最近更新（Mock）</dt><dd>${skill.updatedAt}</dd></dl></section></aside></div>
        ${relatedSkills.length ? `<section class="section related"><div class="section-heading"><h2>同分类 Mock Skill</h2><p>固定分类匹配，不是算法推荐</p></div>${renderSkillGrid(relatedSkills)}</section>` : ""}</div>`;
}

function closeMobileNavigation(restoreFocus = false) {
    const navigation = document.getElementById("mainNav");
    const button = document.querySelector(".menu-button");
    const wasOpen = button.getAttribute("aria-expanded") === "true";
    navigation.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    if (restoreFocus && wasOpen) {
        button.focus();
    }
}

function bindInteractions() {
    const menuButton = document.querySelector(".menu-button");
    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        document.getElementById("mainNav").classList.toggle("open", !isOpen);
    });
    document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => closeMobileNavigation()));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileNavigation(true);
        }
    });
    document.addEventListener("click", (event) => {
        if (!event.target.closest(".header-inner")) {
            closeMobileNavigation(true);
        }
    });
    const drawer = document.querySelector("[data-filter-drawer]");
    const openButton = document.querySelector("[data-open-filters]");
    if (drawer && openButton) {
        openButton.addEventListener("click", () => {
            returnFocusElement = openButton;
            document.body.style.overflow = "hidden";
            drawer.showModal();
        });
        drawer.addEventListener("click", (event) => {
            const bounds = drawer.getBoundingClientRect();
            const isOutside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
            if (event.target === drawer && isOutside) {
                drawer.close();
            }
        });
        drawer.addEventListener("close", () => {
            document.body.style.overflow = "";
            const focusTarget = openButton.getClientRects().length ? returnFocusElement : document.querySelector(".desktop-filters select");
            focusTarget?.focus();
        });
        window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
            if (event.matches && drawer.open) {
                drawer.close();
            }
        });
    }
    document.querySelector(".skip-link").addEventListener("click", () => {
        document.getElementById("mainContent").focus();
    });
    const sortSelect = document.querySelector("[data-sort]");
    sortSelect?.addEventListener("change", () => {
        window.location.href = buildUrl("skills", { sort: sortSelect.value, resultPage: "" });
    });
}

function renderApp() {
    document.body.dataset.theme = prototypeTheme;
    document.body.dataset.page = prototypePage;
    document.title = `${prototypePage === "home" ? "首页" : prototypePage === "skills" ? "Skill 列表" : "Skill 详情"} · 方向 ${prototypeTheme.toUpperCase()} · CrossBorder Skills Hub`;
    const content = prototypePage === "home" ? renderHome() : prototypePage === "skills" ? renderSkills() : renderDetail();
    prototypeRoot.innerHTML = `${renderMockNotice()}${renderHeader()}<main id="mainContent" tabindex="-1">${content}</main>${renderFooter()}`;
    bindInteractions();
}

renderApp();
