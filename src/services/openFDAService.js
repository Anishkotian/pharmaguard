// OpenFDA API — free, no API key needed
const BASE_URL = "https://api.fda.gov/drug"

// Get generic name from brand name using OpenFDA
export const getGenericFromBrand = async (brandName) => {
  try {
    const query = encodeURIComponent(brandName)

    // Search by brand name first
    const response = await fetch(
      `${BASE_URL}/label.json?search=openfda.brand_name:"${query}"&limit=1`
    )
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const result = data.results[0]

      // Try to get generic name from multiple fields
      const generic =
        result.openfda?.generic_name?.[0] ||
        result.openfda?.substance_name?.[0] ||
        result.active_ingredient?.[0] ||
        null

      if (generic) return generic.toLowerCase().trim()
    }

    // Try searching by generic name directly
    const response2 = await fetch(
      `${BASE_URL}/label.json?search=openfda.generic_name:"${query}"&limit=1`
    )
    const data2 = await response2.json()

    if (data2.results && data2.results.length > 0) {
      const generic = data2.results[0].openfda?.generic_name?.[0]
      if (generic) return generic.toLowerCase().trim()
    }

    return null
  } catch (err) {
    console.error("OpenFDA error:", err)
    return null
  }
}

// Get full drug info from OpenFDA
export const getDrugInfo = async (medicineName) => {
  try {
    const query = encodeURIComponent(medicineName)

    const response = await fetch(
      `${BASE_URL}/label.json?search=(openfda.brand_name:"${query}"+openfda.generic_name:"${query}")&limit=1`
    )
    const data = await response.json()

    if (!data.results || data.results.length === 0) return null

    const result = data.results[0]

    return {
      brandName:    result.openfda?.brand_name?.[0]     || medicineName,
      genericName:  result.openfda?.generic_name?.[0]   || null,
      manufacturer: result.openfda?.manufacturer_name?.[0] || "Unknown",
      substance:    result.openfda?.substance_name?.[0] || null,
      purpose:      result.purpose?.[0]                 || null,
      warnings:     result.warnings?.[0]                || null,
      dosage:       result.dosage_and_administration?.[0] || null,
    }
  } catch (err) {
    console.error("OpenFDA drug info error:", err)
    return null
  }
}
