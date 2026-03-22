export const checkExpiry = (members) => {
  const today    = new Date()
  const expired  = []
  const expiring = []
  const valid    = []

  members.forEach(member => {
    member.medicines.forEach(med => {
      if (!med.expiryDate) return

      const expiry     = new Date(med.expiryDate)
      const daysLeft   = Math.floor((expiry - today) / (1000 * 60 * 60 * 24))

      const entry = {
        memberName:  member.name,
        memberId:    member.id,
        brandName:   med.brandName,
        genericName: med.genericName,
        dose:        med.dose,
        expiryDate:  med.expiryDate,
        daysLeft
      }

      if (daysLeft < 0) {
        expired.push({ ...entry, status: "EXPIRED" })
      } else if (daysLeft <= 30) {
        expiring.push({ ...entry, status: "EXPIRING_SOON" })
      } else {
        valid.push({ ...entry, status: "VALID" })
      }
    })
  })

  // Sort expiring by days left ascending
  expiring.sort((a, b) => a.daysLeft - b.daysLeft)

  return { expired, expiring, valid }
}

export const formatExpiryDate = (dateStr) => {
  if (!dateStr) return "Not set"
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  })
}

export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null
  const today    = new Date()
  const expiry   = new Date(expiryDate)
  const daysLeft = Math.floor((expiry - today) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0)   return { status: "EXPIRED",       color: "red",    text: `Expired ${Math.abs(daysLeft)} days ago` }
  if (daysLeft <= 7)  return { status: "CRITICAL",      color: "red",    text: `Expires in ${daysLeft} days` }
  if (daysLeft <= 30) return { status: "EXPIRING_SOON", color: "yellow", text: `Expires in ${daysLeft} days` }
  return               { status: "VALID",               color: "green",  text: `${daysLeft} days left` }
}
