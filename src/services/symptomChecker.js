import { SIDE_EFFECTS } from "../data/sideEffects"
import { BRAND_TO_GENERIC } from "../data/brandToGeneric"

const resolveGeneric = (medicine) => {
  if (medicine.genericName &&
      medicine.genericName !== "unknown" &&
      medicine.genericName.length > 2) {
    return medicine.genericName.toLowerCase().trim()
  }
  const brand = medicine.brandName?.toLowerCase().trim()
  if (brand && BRAND_TO_GENERIC[brand]) {
    return BRAND_TO_GENERIC[brand]
  }
  return medicine.brandName?.toLowerCase().trim() || "unknown"
}

const fuzzyMatch = (symptom, sideEffect) => {
  const s = symptom.toLowerCase().trim()
  const e = sideEffect.toLowerCase().trim()

  // Exact match
  if (e === s) return true

  // One contains the other
  if (e.includes(s) || s.includes(e)) return true

  // Word level match
  const sWords = s.split(" ")
  const eWords = e.split(" ")
  const commonWords = sWords.filter(w => w.length > 3 && eWords.includes(w))
  if (commonWords.length > 0) return true

  return false
}

export const checkSymptom = (symptom, members) => {
  if (!symptom || symptom.trim().length < 2) return []

  const results = []

  members.forEach(member => {
    member.medicines.forEach(med => {
      const generic = resolveGeneric(med)
      const knownEffects = SIDE_EFFECTS[generic] || []

      const matchedEffect = knownEffects.find(effect =>
        fuzzyMatch(symptom, effect)
      )

      if (matchedEffect) {
        // Calculate days since medicine started
        let daysSinceStart = null
        if (med.startDate) {
          const start = new Date(med.startDate)
          const today = new Date()
          daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        }

        results.push({
          memberName: member.name,
          brandName: med.brandName,
          genericName: generic,
          matchedEffect,
          daysSinceStart,
          dose: med.dose,
          frequency: med.frequency
        })
      }
    })
  })

  return results
}
