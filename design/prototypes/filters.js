(function exposeFilters(root) {
    function getPublishedSkills(skills) {
        return skills.filter((skill) => skill.status === "published");
    }

    function filterSkills(skills, query) {
        const keyword = (query.keyword || "").trim().toLocaleLowerCase();
        return getPublishedSkills(skills).filter((skill) => {
            const searchText = [skill.name, skill.chineseName, skill.summary, ...skill.tags].join(" ").toLocaleLowerCase();
            return (!keyword || searchText.includes(keyword))
                && (!query.category || skill.category === query.category)
                && (!query.platform || skill.platforms.includes(query.platform))
                && (!query.tool || skill.tools.includes(query.tool));
        });
    }

    function sortSkills(skills, sort) {
        const sortedSkills = [...skills];
        if (sort === "name") {
            return sortedSkills.sort((firstSkill, secondSkill) => firstSkill.chineseName.localeCompare(secondSkill.chineseName, "zh-CN"));
        }
        const dateKey = sort === "updated" ? "updatedAt" : "publishedAt";
        return sortedSkills.sort((firstSkill, secondSkill) => secondSkill[dateKey].localeCompare(firstSkill[dateKey]));
    }

    function paginateSkills(skills, requestedPage, pageSize) {
        const pageCount = Math.max(1, Math.ceil(skills.length / pageSize));
        const parsedPage = Number.parseInt(requestedPage, 10);
        const page = Number.isFinite(parsedPage) ? Math.min(pageCount, Math.max(1, parsedPage)) : 1;
        return { items: skills.slice((page - 1) * pageSize, page * pageSize), page, pageCount };
    }

    function getPublishedValues(skills, key) {
        return [...new Set(getPublishedSkills(skills).flatMap((skill) => skill[key]))].sort((firstValue, secondValue) => firstValue.localeCompare(secondValue, "zh-CN"));
    }

    const filters = { getPublishedSkills, getPublishedValues, filterSkills, sortSkills, paginateSkills };
    if (typeof module === "object" && module.exports) {
        module.exports = filters;
    } else {
        root.prototypeFilters = filters;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);
