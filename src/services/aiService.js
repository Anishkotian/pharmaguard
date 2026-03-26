const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// ── Models ordered by what works on your key ─────────────────────
// gemini-2.5-flash-lite works ✅ — put it first
const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash",
]

const VISION_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash-001",
]

// ── Base caller ───────────────────────────────────────────────────
const callGemini = async (prompt) => {
  let lastError = null

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      })

      const data = await res.json()

      if (data.error) {
        const code = data.error.code
        console.log(`⚠️ ${model} → ${code}`)
        if (code === 429 || code === 404 || code === 400 || code === 503) {
          lastError = new Error(data.error.message)
          continue
        }
        throw new Error(data.error.message)
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        console.log(`✅ AI via: ${model}`)
        return text
      }
    } catch (err) {
      lastError = err
      continue
    }
  }

  console.warn("All AI models exhausted — using fallback")
  return null
}

// ── Vision caller ─────────────────────────────────────────────────
const callGeminiVision = async (imageBase64, prompt) => {
  for (const model of VISION_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type:"image/jpeg", data:imageBase64 } },
              { text: prompt }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      })
      const data = await res.json()
      if (data.error?.code === 429 || data.error?.code === 404) continue
      if (data.error) throw new Error(data.error.message)
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) { console.log(`✅ Vision via: ${model}`); return text }
    } catch { continue }
  }
  return "[]"
}

// ── Fallbacks ─────────────────────────────────────────────────────
const FALLBACKS = {
  chatbot: (q) =>
    `I cannot reach the AI right now. For your question about "${q}", please consult your doctor or pharmacist. You can also check the Issues tab for automated drug interaction checks.`,
  symptom: () =>
    `LIKELY CAUSE: Cannot determine — AI unavailable\nCONFIDENCE: Low\nEXPLANATION: AI service is unavailable right now. Check the Issues tab for automated checks.\nTIMING: Unknown\nACTION: Consult your doctor if the symptom persists.`,
  summary: (name, meds, issues) =>
    `${name} has ${meds} medicine${meds !== 1 ? "s" : ""} tracked across all members. ${issues > 0 ? `${issues} safety issue${issues > 1 ? "s" : ""} detected — please check the Issues tab immediately.` : "No safety issues detected — all medicines appear safe together."} Keep your medicine list updated by scanning new prescriptions regularly.`,
  interaction: (a) =>
    `${a.med1} and ${a.med2} have a ${a.severity} risk interaction. ${a.effect} Please consult your doctor before continuing both medicines.`,
}

// ── 1. AI CHATBOT ─────────────────────────────────────────────────
export const askMedicineChatbot = async (question, family) => {
  const membersInfo = family.members.map(m =>
    `${m.name} (Age ${m.age}): ${
      m.medicines.length === 0 ? "No medicines" :
      m.medicines.map(med =>
        `${med.brandName} ${med.dose} (${med.genericName || "unknown"}) - ${med.frequency}`
      ).join(", ")
    }`
  ).join("\n")

  const prompt = `You are PharmaGuard AI — a family medicine safety assistant.

FAMILY MEDICINES:
${membersInfo}

QUESTION: ${question}

Answer in simple language a non-medical person understands.
3 to 5 sentences max.
If dangerous start with: WARNING:
If safe start with: SAFE:
If unsure recommend a doctor.
No medical jargon.`

  const result = await callGemini(prompt)
  return result || FALLBACKS.chatbot(question)
}

// ── 2. AI SYMPTOM DIAGNOSIS ───────────────────────────────────────
export const aiSymptomDiagnosis = async (symptomDescription, family) => {
  const allMedicines = family.members.flatMap(m =>
    m.medicines.map(med => ({
      member:  m.name,
      brand:   med.brandName,
      generic: med.genericName || "unknown",
      dose:    med.dose,
      started: med.startDate || "unknown"
    }))
  )

  if (allMedicines.length === 0) {
    return `LIKELY CAUSE: No medicines recorded\nCONFIDENCE: Low\nEXPLANATION: No medicines added yet. Scan a prescription first.\nTIMING: N/A\nACTION: Add medicines by scanning a prescription then try again.`
  }

  const prompt = `You are a medicine side effects expert.

SYMPTOM: "${symptomDescription}"

MEDICINES:
${allMedicines.map(m =>
  `${m.member}: ${m.brand} (${m.generic}) ${m.dose} started ${m.started}`
).join("\n")}

Reply in EXACTLY this format:
LIKELY CAUSE: [medicine name or Cannot determine]
CONFIDENCE: [High or Medium or Low]
EXPLANATION: [2-3 sentences why]
TIMING: [Does timing match?]
ACTION: [What should patient do?]`

  const result = await callGemini(prompt)
  return result || FALLBACKS.symptom()
}

// ── 3. AI INTERACTION EXPLAINER ───────────────────────────────────
export const explainInteraction = async (alert) => {
  const prompt = `Explain this drug interaction simply for a patient:

Drug 1: ${alert.med1} taken by ${alert.member1}
Drug 2: ${alert.med2} taken by ${alert.member2}
Severity: ${alert.severity}
Description: ${alert.effect}

Write exactly 3 sentences:
1. What happens to the body simply
2. Why dangerous
3. One clear action to take now`

  const result = await callGemini(prompt)
  return result || FALLBACKS.interaction(alert)
}

// ── 4. AI PRESCRIPTION SCANNER ────────────────────────────────────
export const scanPrescriptionWithAI = async (imageBase64) => {
  try {
    const prompt = `Extract all medicines from this prescription image.
Return ONLY a valid JSON array, no markdown, no other text:
[{"brandName":"name","genericName":"generic or unknown","dose":"dose","frequency":"frequency","duration":"unknown","doctorName":"doctor or unknown","condition":"unknown"}]
If unreadable return: []`

    const text = await callGeminiVision(imageBase64, prompt)
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)
  } catch (err) {
    console.error("AI Scanner error:", err)
    return []
  }
}

// ── 5. AI HEALTH SUMMARY ─────────────────────────────────────────
export const generateHealthSummary = async (family, alerts, duplicates) => {
  const totalMeds = family.members.reduce((s, m) => s + m.medicines.length, 0)

  const prompt = `Generate a health summary for the ${family.familyName}.

Members:
${family.members.map(m =>
  `${m.name} (${m.age}): ${m.medicines.map(med => med.brandName).join(", ") || "No medicines"}`
).join("\n")}

Active alerts: ${alerts.length}
Duplicates: ${duplicates.length}

Write exactly 3 sentences:
1. Overall safety status
2. Most important concern or positive note
3. One actionable recommendation

Warm encouraging tone. Simple language.`

  const result = await callGemini(prompt)
  return result || FALLBACKS.summary(family.familyName, totalMeds, alerts.length + duplicates.length)
}
