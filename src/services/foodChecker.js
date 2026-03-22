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

// All unique food names for suggestions
export const ALL_FOODS = [...new Set(FOOD_INTERACTIONS.map(f => f.food))]

// Get all food interactions for a member's medicines
export const getFoodInteractionsForMember = (member) => {
  const results = []
  const seen = new Set()

  member.medicines.forEach(med => {
    const generic = resolveGeneric(med)
    FOOD_INTERACTIONS.forEach(interaction => {
      const key = `${interaction.food}_${interaction.drug}`
      if (seen.has(key)) return
      if (
        normalize(generic).includes(normalize(interaction.drug)) ||
        normalize(interaction.drug).includes(normalize(generic))
      ) {
        seen.add(key)
        results.push({
          ...interaction,
          medicineBrand:   med.brandName,
          medicineGeneric: generic
        })
      }
    })
  })

  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  return results.sort((a, b) => (order[a.severity] || 2) - (order[b.severity] || 2))
}

// Get food interactions for entire family
export const getFoodInteractionsForFamily = (members) => {
  const familyResults = {}
  members.forEach(member => {
    const interactions = getFoodInteractionsForMember(member)
    if (interactions.length > 0) {
      familyResults[member.id] = { member, interactions }
    }
  })
  return familyResults
}

// Check one food against all family medicines
export const checkFoodAgainstFamily = (foodName, members) => {
  const results = []
  members.forEach(member => {
    member.medicines.forEach(med => {
      const generic = resolveGeneric(med)
      FOOD_INTERACTIONS.forEach(interaction => {
        if (
          normalize(interaction.food).includes(normalize(foodName)) ||
          normalize(foodName).includes(normalize(interaction.food))
        ) {
          if (
            normalize(generic).includes(normalize(interaction.drug)) ||
            normalize(interaction.drug).includes(normalize(generic))
          ) {
            results.push({
              ...interaction,
              memberName:      member.name,
              medicineBrand:   med.brandName,
              medicineGeneric: generic
            })
          }
        }
      })
    })
  })
  return results
}
