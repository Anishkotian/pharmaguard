import { INTERACTIONS } from "../data/interactions"

const normalize = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/[^a-z]/g, "")
}

export const checkCrossFamily = (members) => {
  const alerts = []

  // Step 1 — collect all member + medicine pairs into one flat list
  const allMeds = []
  members.forEach(member => {
    member.medicines.forEach(med => {
      allMeds.push({ member, med })
    })
  })

  // Step 2 — check every medicine against every other medicine
  for (let i = 0; i < allMeds.length; i++) {
    for (let j = i + 1; j < allMeds.length; j++) {
      const a = allMeds[i]
      const b = allMeds[j]

      // Skip if same member — we only want CROSS family alerts
      if (a.member.id === b.member.id) continue

      const nameA = normalize(a.med.genericName || a.med.brandName)
      const nameB = normalize(b.med.genericName || b.med.brandName)

      // Check against interactions database
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
          type: "CROSS_FAMILY",
          member1: a.member.name,
          med1: a.med.brandName,
          member2: b.member.name,
          med2: b.med.brandName,
          severity: hit.severity,
          effect: hit.effect,
          action: hit.action
        })
      }
    }
  }

  return alerts
}

export const checkSingleMember = (member, allMembers) => {
  const alerts = []

  member.medicines.forEach(newMed => {
    allMembers.forEach(otherMember => {
      if (otherMember.id === member.id) return

      otherMember.medicines.forEach(otherMed => {
        const nameA = normalize(newMed.genericName || newMed.brandName)
        const nameB = normalize(otherMed.genericName || otherMed.brandName)

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
            type: "CROSS_FAMILY",
            member1: member.name,
            med1: newMed.brandName,
            member2: otherMember.name,
            med2: otherMed.brandName,
            severity: hit.severity,
            effect: hit.effect,
            action: hit.action
          })
        }
      })
    })
  })

  return alerts
}
