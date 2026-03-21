import { INTERACTIONS } from "../data/interactions"
import { getDrugInteractions } from "./rxNormService"

const normalize = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/[^a-z]/g, "")
}

// Check local database first then fall back to RxNorm API
const checkInteractionPair = async (nameA, nameB, useAPI = false) => {
  // Always check local database first (instant)
  const hit = INTERACTIONS.find(rule => {
    const r1 = normalize(rule.drug1)
    const r2 = normalize(rule.drug2)
    return (
      (nameA.includes(r1) && nameB.includes(r2)) ||
      (nameA.includes(r2) && nameB.includes(r1))
    )
  })
  if (hit) return { ...hit, source: "local" }

  // If not found locally and API is enabled check RxNorm
  if (useAPI) {
    const apiResult = await getDrugInteractions(nameA, nameB)
    if (apiResult && apiResult.length > 0) {
      return {
        severity: apiResult[0].severity?.toUpperCase() || "MEDIUM",
        effect:   apiResult[0].description,
        action:   "Consult your doctor before taking both medicines.",
        source:   "rxnorm"
      }
    }
  }

  return null
}

// Check interactions ACROSS family members
export const checkCrossFamily = (members) => {
  const alerts = []
  const allMeds = []

  members.forEach(member => {
    member.medicines.forEach(med => {
      allMeds.push({ member, med })
    })
  })

  for (let i = 0; i < allMeds.length; i++) {
    for (let j = i + 1; j < allMeds.length; j++) {
      const a = allMeds[i]
      const b = allMeds[j]
      if (a.member.id === b.member.id) continue

      const nameA = normalize(a.med.genericName || a.med.brandName)
      const nameB = normalize(b.med.genericName || b.med.brandName)

      const hit = INTERACTIONS.find(rule => {
        const r1 = normalize(rule.drug1)
        const r2 = normalize(rule.drug2)
        return (
          (nameA.includes(r1) && nameB.includes(r2)) ||
          (nameA.includes(r2) && nameB.includes(r1))
        )
      })

      if (hit) {
        alerts.push({
          type:     "CROSS_FAMILY",
          member1:  a.member.name,
          med1:     a.med.brandName,
          doctor1:  a.med.doctorName || "Unknown Doctor",
          member2:  b.member.name,
          med2:     b.med.brandName,
          doctor2:  b.med.doctorName || "Unknown Doctor",
          severity: hit.severity,
          effect:   hit.effect,
          action:   hit.action,
          source:   "local"
        })
      }
    }
  }

  return alerts
}

// Check interactions WITHIN same person across different doctors
export const checkSamePersonMultiDoctor = (members) => {
  const alerts = []

  members.forEach(member => {
    const meds = member.medicines
    if (meds.length < 2) return

    for (let i = 0; i < meds.length; i++) {
      for (let j = i + 1; j < meds.length; j++) {
        const medA = meds[i]
        const medB = meds[j]

        const nameA = normalize(medA.genericName || medA.brandName)
        const nameB = normalize(medB.genericName || medB.brandName)

        const hit = INTERACTIONS.find(rule => {
          const r1 = normalize(rule.drug1)
          const r2 = normalize(rule.drug2)
          return (
            (nameA.includes(r1) && nameB.includes(r2)) ||
            (nameA.includes(r2) && nameB.includes(r1))
          )
        })

        if (hit) {
          alerts.push({
            type:       "SAME_PERSON_MULTI_DOCTOR",
            memberName: member.name,
            med1:       medA.brandName,
            doctor1:    medA.doctorName || "Unknown Doctor",
            condition1: medA.condition  || "Unknown condition",
            med2:       medB.brandName,
            doctor2:    medB.doctorName || "Unknown Doctor",
            condition2: medB.condition  || "Unknown condition",
            severity:   hit.severity,
            effect:     hit.effect,
            action:     hit.action
          })
        }
      }
    }
  })

  return alerts
}

// Live API interaction check for two specific medicines
export const checkInteractionLive = async (drug1, drug2) => {
  const nameA = normalize(drug1)
  const nameB = normalize(drug2)
  return await checkInteractionPair(nameA, nameB, true)
}
