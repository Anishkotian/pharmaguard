import { INTERACTIONS } from "../data/interactions"
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

// Calculate score for one member against all other members
export const calculateMemberScore = (member, allMembers) => {
  let score = 100
  const reasons = []

  // ── Check 1: Cross-family interactions ──────────────────────
  allMembers.forEach(otherMember => {
    if (otherMember.id === member.id) return
    member.medicines.forEach(medA => {
      otherMember.medicines.forEach(medB => {
        const nameA = normalize(resolveGeneric(medA))
        const nameB = normalize(resolveGeneric(medB))
        const hit = INTERACTIONS.find(rule => {
          const r1 = normalize(rule.drug1)
          const r2 = normalize(rule.drug2)
          return (
            (nameA.includes(r1) && nameB.includes(r2)) ||
            (nameA.includes(r2) && nameB.includes(r1))
          )
        })
        if (hit) {
          const deduction = hit.severity === "HIGH" ? 25 : 15
          score -= deduction
          reasons.push({
            type: "interaction",
            severity: hit.severity,
            text: `${hit.severity} RISK interaction with ${otherMember.name}'s ${medB.brandName}`,
            deduction
          })
        }
      })
    })
  })

  // ── Check 2: Same person multi-doctor interactions ───────────
  member.medicines.forEach((medA, i) => {
    member.medicines.forEach((medB, j) => {
      if (i >= j) return
      const nameA = normalize(resolveGeneric(medA))
      const nameB = normalize(resolveGeneric(medB))
      const hit = INTERACTIONS.find(rule => {
        const r1 = normalize(rule.drug1)
        const r2 = normalize(rule.drug2)
        return (
          (nameA.includes(r1) && nameB.includes(r2)) ||
          (nameA.includes(r2) && nameB.includes(r1))
        )
      })
      if (hit) {
        const deduction = hit.severity === "HIGH" ? 20 : 10
        score -= deduction
        reasons.push({
          type: "self_interaction",
          severity: hit.severity,
          text: `${hit.severity} RISK between own medicines: ${medA.brandName} + ${medB.brandName}`,
          deduction
        })
      }
    })
  })

  // ── Check 3: Duplicate molecules ────────────────────────────
  const genericMap = {}
  member.medicines.forEach(med => {
    const generic = resolveGeneric(med)
    if (!genericMap[generic]) genericMap[generic] = []
    genericMap[generic].push(med.brandName)
  })
  Object.entries(genericMap).forEach(([generic, brands]) => {
    if (brands.length > 1) {
      score -= 20
      reasons.push({
        type: "duplicate",
        severity: "HIGH",
        text: `Duplicate molecule: ${generic.toUpperCase()} found in ${brands.join(" and ")}`,
        deduction: 20
      })
    }
  })

  // ── Check 4: Medicines without doctor info ───────────────────
  const withoutDoctor = member.medicines.filter(m => !m.doctorName || m.doctorName === "Unknown Doctor")
  if (withoutDoctor.length > 0) {
    const deduction = withoutDoctor.length * 5
    score -= deduction
    reasons.push({
      type: "missing_info",
      severity: "LOW",
      text: `${withoutDoctor.length} medicine${withoutDoctor.length > 1 ? "s" : ""} without doctor information`,
      deduction
    })
  }

  // ── Check 5: Too many medicines ──────────────────────────────
  if (member.medicines.length > 5) {
    score -= 10
    reasons.push({
      type: "polypharmacy",
      severity: "MEDIUM",
      text: `Taking ${member.medicines.length} medicines — polypharmacy risk increases`,
      deduction: 10
    })
  }

  // ── Clamp score between 0 and 100 ───────────────────────────
  score = Math.max(0, Math.min(100, score))

  // ── Determine status ────────────────────────────────────────
  let status, color, emoji
  if (score >= 80) {
    status = "SAFE";       color = "green";  emoji = "✅"
  } else if (score >= 60) {
    status = "MODERATE";   color = "yellow"; emoji = "⚠️"
  } else if (score >= 40) {
    status = "AT RISK";    color = "orange"; emoji = "🔶"
  } else {
    status = "DANGER";     color = "red";    emoji = "🚨"
  }

  return { score, status, color, emoji, reasons }
}

// Calculate scores for all family members
export const calculateFamilyScores = (members) => {
  return members.map(member => ({
    member,
    ...calculateMemberScore(member, members)
  }))
}

// Calculate overall family score
export const calculateFamilyOverallScore = (memberScores) => {
  if (memberScores.length === 0) return 100
  const avg = memberScores.reduce((sum, ms) => sum + ms.score, 0) / memberScores.length
  return Math.round(avg)
}
