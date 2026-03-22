import { INTERACTIONS } from "../data/interactions"
import { BRAND_TO_GENERIC } from "../data/brandToGeneric"

const normalize = (name) => {
  if (!name) return ""
  return name.toLowerCase().replace(/[^a-z]/g, "")
}

const resolveGeneric = (med) => {
  if (med.genericName && med.genericName !== "unknown") return med.genericName.toLowerCase()
  const brand = med.brandName?.toLowerCase().trim()
  return BRAND_TO_GENERIC[brand] || brand || "unknown"
}

// Find all interactions for a single member
const getMemberInteractions = (member, allMembers) => {
  const alerts = []
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
          alerts.push({
            med1: medA.brandName,
            med2: medB.brandName,
            member2: otherMember.name,
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

// Build the full brief data for AI
export const buildBriefData = (family) => {
  const members = family.members
  const allAlerts = []
  const allDuplicates = []

  // Find all cross-family interactions
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      members[i].medicines.forEach(medA => {
        members[j].medicines.forEach(medB => {
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
            allAlerts.push({
              member1: members[i].name,
              med1: medA.brandName,
              member2: members[j].name,
              med2: medB.brandName,
              severity: hit.severity,
              effect: hit.effect,
              action: hit.action
            })
          }
        })
      })
    }
  }

  // Find duplicates
  const genericMap = {}
  members.forEach(member => {
    member.medicines.forEach(med => {
      const generic = resolveGeneric(med)
      if (!genericMap[generic]) genericMap[generic] = []
      genericMap[generic].push({ member: member.name, brand: med.brandName, dose: med.dose })
    })
  })
  Object.entries(genericMap).forEach(([generic, entries]) => {
    if (entries.length > 1) {
      allDuplicates.push({ generic, entries })
    }
  })

  return { family, members, allAlerts, allDuplicates }
}

// Generate brief text using Gemini AI
export const generateBriefWithAI = async (briefData) => {
  const { family, members, allAlerts, allDuplicates } = briefData
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  const prompt = `You are a medical documentation assistant. Generate a professional doctor brief for the ${family.familyName}.

FAMILY MEDICINE PROFILE:
${members.map(m => `
${m.name} (Age ${m.age}):
Medicines: ${m.medicines.length === 0 ? "None" : m.medicines.map(med =>
  `${med.brandName} (${med.genericName || "generic unknown"}) ${med.dose} - ${med.frequency}${med.doctorName ? ` - Prescribed by ${med.doctorName} for ${med.condition}` : ""}`
).join(", ")}
`).join("")}

DETECTED INTERACTIONS (${allAlerts.length}):
${allAlerts.length === 0 ? "None detected" : allAlerts.map(a =>
  `- ${a.member1}'s ${a.med1} + ${a.member2}'s ${a.med2}: ${a.severity} RISK - ${a.effect}`
).join("\n")}

DUPLICATE MEDICINES (${allDuplicates.length}):
${allDuplicates.length === 0 ? "None detected" : allDuplicates.map(d =>
  `- ${d.generic.toUpperCase()}: Found in ${d.entries.map(e => `${e.member}'s ${e.brand} ${e.dose}`).join(" AND ")}`
).join("\n")}

Generate a professional doctor brief with these exact sections:
1. PATIENT SUMMARY - Brief overview of the family and total medicines
2. CURRENT MEDICATIONS - List all medicines per member clearly
3. CRITICAL ALERTS - List all dangerous interactions that need immediate attention
4. DUPLICATE MEDICINES - List all duplicate molecules found
5. RECOMMENDED ACTIONS - Clear numbered action items for the doctor
6. QUESTIONS FOR DOCTOR - 3-5 specific questions the patient should ask

Keep it professional, concise and actionable. Format it clearly with section headers.
This will be printed and handed to a doctor so make it look professional.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )
    const data = await response.json()
    if (data.error) throw new Error(data.error.message)
    return data.candidates[0].content.parts[0].text
  } catch (err) {
    console.error("AI brief error:", err)
    return generateFallbackBrief(briefData)
  }
}

// Fallback if AI fails
const generateFallbackBrief = ({ family, members, allAlerts, allDuplicates }) => {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  })
  const totalMeds = members.reduce((sum, m) => sum + m.medicines.length, 0)

  return `PATIENT SUMMARY
Family: ${family.familyName} | Date: ${today}
Members: ${members.length} | Total Medicines: ${totalMeds}
Interactions Detected: ${allAlerts.length} | Duplicates Found: ${allDuplicates.length}

CURRENT MEDICATIONS
${members.map(m => `
${m.name} (Age ${m.age}):
${m.medicines.length === 0 ? "  No medicines recorded" : m.medicines.map(med =>
  `  • ${med.brandName} (${med.genericName || "unknown"}) — ${med.dose} — ${med.frequency}${med.doctorName ? `\n    Prescribed by: ${med.doctorName} for ${med.condition}` : ""}`
).join("\n")}`).join("\n")}

CRITICAL ALERTS
${allAlerts.length === 0 ? "No dangerous interactions detected." : allAlerts.map((a, i) =>
  `${i + 1}. ${a.severity} RISK: ${a.member1}'s ${a.med1} + ${a.member2}'s ${a.med2}\n   Effect: ${a.effect}\n   Action: ${a.action}`
).join("\n\n")}

DUPLICATE MEDICINES
${allDuplicates.length === 0 ? "No duplicate molecules detected." : allDuplicates.map((d, i) =>
  `${i + 1}. ${d.generic.toUpperCase()}: ${d.entries.map(e => `${e.member}'s ${e.brand} ${e.dose}`).join(" AND ")}`
).join("\n")}

RECOMMENDED ACTIONS
${allAlerts.map((a, i) => `${i + 1}. ${a.action}`).join("\n")}
${allAlerts.length === 0 ? "1. Continue current medicines as prescribed.\n2. Schedule regular medicine review." : ""}

Generated by PharmaGuard Family Medicine Safety System`
}
