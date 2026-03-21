import { SIDE_EFFECTS } from "../data/sideEffects"
import { BRAND_TO_GENERIC } from "../data/brandToGeneric"
import { getSideEffects } from "./rxNormService"

const resolveGeneric = (medicine) => {
  if (medicine.genericName &&
      medicine.genericName !== "unknown" &&
      medicine.genericName.length > 2) {
    return medicine.genericName.toLowerCase().trim()
  }
  const brand = medicine.brandName?.toLowerCase().trim()
  if (brand && BRAND_TO_GENERIC[brand]) return BRAND_TO_GENERIC[brand]
  return medicine.brandName?.toLowerCase().trim() || "unknown"
}

const fuzzyMatch = (symptom, sideEffect) => {
  const s = symptom.toLowerCase().trim()
  const e = sideEffect.toLowerCase().trim()
  if (e === s) return true
  if (e.includes(s) || s.includes(e)) return true
  const sWords = s.split(" ")
  const eWords = e.split(" ")
  return sWords.some(w => w.length > 3 && eWords.includes(w))
}

export const checkSymptom = async (symptom, members, useLiveAPI = true) => {
  if (!symptom || symptom.trim().length < 2) return []

  const results = []

  for (const member of members) {
    for (const med of member.medicines) {
      const generic = resolveGeneric(med)

      // Step 1 — check local side effects database first
      let knownEffects = SIDE_EFFECTS[generic] || []
      let source = "local"

      // Step 2 — if not in local and API enabled fetch from FDA FAERS
      if (knownEffects.length === 0 && useLiveAPI) {
        console.log(`Fetching side effects for ${generic} from FDA...`)
        const liveEffects = await getSideEffects(med.brandName || generic)
        if (liveEffects.length > 0) {
          knownEffects = liveEffects
          source = "fda"
        }
      }

      const matchedEffect = knownEffects.find(effect =>
        fuzzyMatch(symptom, effect)
      )

      if (matchedEffect) {
        let daysSinceStart = null
        if (med.startDate) {
          const start = new Date(med.startDate)
          const today = new Date()
          daysSinceStart = Math.floor((today - start) / (1000 * 60 * 60 * 24))
        }

        results.push({
          memberName:    member.name,
          brandName:     med.brandName,
          genericName:   generic,
          matchedEffect,
          daysSinceStart,
          dose:          med.dose,
          frequency:     med.frequency,
          source
        })
      }
    }
  }

  return results
}
