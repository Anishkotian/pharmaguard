const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST"
const OPENFDA_BASE = "https://api.fda.gov/drug"

// ── Get generic name from any brand name ─────────────────────────
export const getGenericName = async (brandName) => {
  try {
    // Step 1 — Get RxCUI (unique drug ID) from brand name
    const response = await fetch(
      `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(brandName)}&search=1`
    )
    const data = await response.json()
    const rxcui = data.idGroup?.rxnormId?.[0]
    if (!rxcui) return null

    // Step 2 — Get generic name using RxCUI
    const response2 = await fetch(
      `${RXNORM_BASE}/rxcui/${rxcui}/properties.json`
    )
    const data2 = await response2.json()
    const name = data2.properties?.name
    if (name) return name.toLowerCase()

    return null
  } catch (err) {
    console.error("RxNorm error:", err)
    return null
  }
}

// ── Get all brand names for a generic ────────────────────────────
export const getBrandNames = async (genericName) => {
  try {
    const response = await fetch(
      `${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(genericName)}&search=1`
    )
    const data = await response.json()
    const rxcui = data.idGroup?.rxnormId?.[0]
    if (!rxcui) return []

    const response2 = await fetch(
      `${RXNORM_BASE}/rxcui/${rxcui}/related.json?tty=BN`
    )
    const data2 = await response2.json()
    const brands = data2.relatedGroup?.conceptGroup
      ?.find(g => g.tty === "BN")
      ?.conceptProperties
      ?.map(p => p.name) || []

    return brands
  } catch (err) {
    console.error("RxNorm brands error:", err)
    return []
  }
}

// ── Get drug interactions from RxNorm ────────────────────────────
export const getDrugInteractions = async (drug1, drug2) => {
  try {
    // Get RxCUI for both drugs
    const [cui1Res, cui2Res] = await Promise.all([
      fetch(`${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(drug1)}&search=1`),
      fetch(`${RXNORM_BASE}/rxcui.json?name=${encodeURIComponent(drug2)}&search=1`)
    ])

    const [cui1Data, cui2Data] = await Promise.all([
      cui1Res.json(),
      cui2Res.json()
    ])

    const rxcui1 = cui1Data.idGroup?.rxnormId?.[0]
    const rxcui2 = cui2Data.idGroup?.rxnormId?.[0]

    if (!rxcui1 || !rxcui2) return null

    // Check interactions between the two drugs
    const response = await fetch(
      `${RXNORM_BASE}/interaction/list.json?rxcuis=${rxcui1}+${rxcui2}`
    )
    const data = await response.json()

    const interactions = data.fullInteractionTypeGroup
      ?.flatMap(g => g.fullInteractionType || [])
      ?.flatMap(t => t.interactionPair || [])
      ?.map(pair => ({
        severity:    pair.severity || "unknown",
        description: pair.description || "Interaction detected",
        source:      "RxNorm"
      })) || []

    return interactions.length > 0 ? interactions : null
  } catch (err) {
    console.error("RxNorm interaction error:", err)
    return null
  }
}

// ── Get side effects from OpenFDA FAERS ──────────────────────────
export const getSideEffects = async (medicineName) => {
  try {
    const response = await fetch(
      `${OPENFDA_BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(medicineName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=10`
    )
    const data = await response.json()

    if (data.results) {
      return data.results.map(r => r.term.toLowerCase())
    }
    return []
  } catch (err) {
    console.error("FAERS side effects error:", err)
    return []
  }
}

// ── Get complete drug info from OpenFDA ──────────────────────────
export const getCompleteDrugInfo = async (medicineName) => {
  try {
    const query = encodeURIComponent(medicineName)
    const response = await fetch(
      `${OPENFDA_BASE}/label.json?search=(openfda.brand_name:"${query}"+openfda.generic_name:"${query}")&limit=1`
    )
    const data = await response.json()
    if (!data.results || data.results.length === 0) return null

    const result = data.results[0]
    return {
      brandName:    result.openfda?.brand_name?.[0]          || medicineName,
      genericName:  result.openfda?.generic_name?.[0]        || null,
      manufacturer: result.openfda?.manufacturer_name?.[0]   || "Unknown",
      substance:    result.openfda?.substance_name?.[0]      || null,
      purpose:      result.purpose?.[0]                      || null,
      warnings:     result.warnings?.[0]                     || null,
      interactions: result.drug_interactions?.[0]            || null,
      dosage:       result.dosage_and_administration?.[0]    || null,
      sideEffects:  result.adverse_reactions?.[0]            || null,
    }
  } catch (err) {
    console.error("OpenFDA complete info error:", err)
    return null
  }
}
