import { FOOD_INTERACTIONS } from "../data/foodInteractions"
import { BRAND_TO_GENERIC } from "../data/brandToGeneric"

const normalize = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/[^a-z]/g, "")
}

const resolveGeneric = (med) => {
  if (med.genericName && med.genericName !== "unknown" && med.genericName.length > 2) {
    return med.genericName.toLowerCase().trim()
  }
  const brand = med.brandName?.toLowerCase().trim()
  return BRAND_TO_GENERIC[brand] || brand || "unknown"
}

// Get all food interactions for all family members
export const getFoodInteractions = (members) => {
  const results = []

  members.forEach(member => {
    member.medicines.forEach(med => {
      const generic = resolveGeneric(med)
      const normalizedGeneric = normalize(generic)

      FOOD_INTERACTIONS.forEach(rule => {
        const normalizedDrug = normalize(rule.drug)
        if (normalizedGeneric.includes(normalizedDrug) || normalizedDrug.includes(normalizedGeneric)) {
          results.push({
            memberName:  member.name,
            brandName:   med.brandName,
            genericName: generic,
            food:        rule.food,
            emoji:       rule.emoji,
            severity:    rule.severity,
            effect:      rule.effect,
            action:      rule.action
          })
        }
      })
    })
  })

  // Sort by severity
  results.sort((a, b) => {
    if (a.severity === "HIGH" && b.severity !== "HIGH") return -1
    if (b.severity === "HIGH" && a.severity !== "HIGH") return 1
    return 0
  })

  return results
}

// Get food interactions for a specific food
export const checkFoodForFamily = (food, members) => {
  const allInteractions = getFoodInteractions(members)
  const foodLower = food.toLowerCase()
  return allInteractions.filter(i => i.food.toLowerCase().includes(foodLower))
}
