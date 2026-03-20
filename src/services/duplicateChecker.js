import { BRAND_TO_GENERIC } from "../data/brandToGeneric"

const resolveGeneric = (medicine) => {
  if (!medicine) return "unknown"

  // Use genericName if already set and not unknown
  if (medicine.genericName &&
      medicine.genericName !== "unknown" &&
      medicine.genericName.length > 2) {
    return medicine.genericName.toLowerCase().trim()
  }

  // Try to resolve from brand name using lookup table
  const brand = medicine.brandName?.toLowerCase().trim()
  if (brand && BRAND_TO_GENERIC[brand]) {
    return BRAND_TO_GENERIC[brand]
  }

  // Try partial match
  if (brand) {
    const match = Object.keys(BRAND_TO_GENERIC).find(key =>
      brand.includes(key) || key.includes(brand)
    )
    if (match) return BRAND_TO_GENERIC[match]
  }

  return medicine.brandName?.toLowerCase().trim() || "unknown"
}

export const findDuplicates = (members) => {
  // Map: genericName → list of { member, medicine }
  const genericMap = {}

  members.forEach(member => {
    member.medicines.forEach(med => {
      const generic = resolveGeneric(med)
      if (generic === "unknown") return

      if (!genericMap[generic]) {
        genericMap[generic] = []
      }
      genericMap[generic].push({ member, medicine: med })
    })
  })

  // Find generics that appear more than once
  const duplicates = Object.entries(genericMap)
    .filter(([_, entries]) => entries.length > 1)
    .map(([generic, entries]) => {
      // Calculate total dose
      const totalDose = entries.reduce((sum, e) => {
        const dose = parseFloat(e.medicine.dose) || 0
        return sum + dose
      }, 0)

      // Safe limits for common medicines
      const safeLimits = {
        "paracetamol": 4000,
        "ibuprofen": 1200,
        "aspirin": 3000,
        "metformin": 2000,
        "vitamin c": 2000
      }

      const safeLimit = safeLimits[generic] || null

      return {
        generic,
        entries,
        totalDose,
        safeLimit,
        isOverLimit: safeLimit ? totalDose > safeLimit : false
      }
    })

  return duplicates
}
