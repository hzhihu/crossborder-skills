type SkillSeoSource = {
    name?: null | string
    name_zh?: null | string
    description?: null | string
    description_zh?: null | string
}

export function getSkillSeo(skill: SkillSeoSource) {
    return {
        title: skill.name_zh?.trim() || skill.name?.trim() || '',
        description: skill.description_zh?.trim() || skill.description?.trim() || '',
    }
}
