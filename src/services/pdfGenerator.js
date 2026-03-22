import { jsPDF } from "jspdf"

export const generateDoctorBriefPDF = (briefText, family, allAlerts, allDuplicates) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const pageWidth  = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin     = 20
  const contentW   = pageWidth - margin * 2
  let y            = margin

  // ── Helper functions ──────────────────────────────────────────
  const checkNewPage = (neededHeight = 10) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
      drawHeader()
    }
  }

  const drawHeader = () => {
    doc.setFillColor(204, 34, 34)
    doc.rect(0, 0, pageWidth, 14, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text("PHARMAGUARD — FAMILY MEDICINE SAFETY SYSTEM", margin, 9)
    doc.text(new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }), pageWidth - margin, 9, { align: "right" })
    doc.setTextColor(0, 0, 0)
  }

  const sectionHeader = (title, color = [204, 34, 34]) => {
    checkNewPage(16)
    doc.setFillColor(...color)
    doc.rect(margin, y, contentW, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text(title, margin + 3, y + 5.5)
    doc.setTextColor(0, 0, 0)
    y += 12
  }

  const bodyText = (text, indent = 0, color = [40, 40, 40]) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, contentW - indent)
    lines.forEach(line => {
      checkNewPage(6)
      doc.text(line, margin + indent, y)
      y += 5
    })
  }

  const boldText = (text, indent = 0) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(30, 30, 30)
    checkNewPage(7)
    doc.text(text, margin + indent, y)
    y += 5.5
  }

  const divider = () => {
    checkNewPage(5)
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, pageWidth - margin, y)
    y += 4
  }

  // ── PAGE 1 HEADER ─────────────────────────────────────────────
  drawHeader()
  y = 22

  // ── TITLE BLOCK ───────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.setTextColor(204, 34, 34)
  doc.text("DOCTOR BRIEF", margin, y)
  y += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`${family.familyName} — Medicine Safety Report`, margin, y)
  y += 5

  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")} | PharmaGuard Family Safety System`, margin, y)
  y += 10

  // ── SUMMARY BOXES ─────────────────────────────────────────────
  const totalMeds = family.members.reduce((sum, m) => sum + m.medicines.length, 0)
  const boxW = (contentW - 6) / 4
  const boxes = [
    { label: "MEMBERS",      value: family.members.length,  color: [30, 100, 200] },
    { label: "MEDICINES",    value: totalMeds,               color: [30, 150, 80]  },
    { label: "INTERACTIONS", value: allAlerts.length,        color: allAlerts.length > 0 ? [204,34,34] : [30,150,80] },
    { label: "DUPLICATES",   value: allDuplicates.length,    color: allDuplicates.length > 0 ? [180,100,0] : [30,150,80] },
  ]
  boxes.forEach((box, i) => {
    const x = margin + i * (boxW + 2)
    doc.setFillColor(...box.color)
    doc.roundedRect(x, y, boxW, 18, 2, 2, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text(String(box.value), x + boxW / 2, y + 10, { align: "center" })
    doc.setFontSize(7)
    doc.text(box.label, x + boxW / 2, y + 15.5, { align: "center" })
  })
  doc.setTextColor(0, 0, 0)
  y += 24

  divider()

  // ── CRITICAL ALERTS ───────────────────────────────────────────
  if (allAlerts.length > 0) {
    sectionHeader("⚠  CRITICAL ALERTS — REQUIRES IMMEDIATE ATTENTION", [180, 20, 20])
    allAlerts.forEach((alert, i) => {
      checkNewPage(20)
      const bgColor = alert.severity === "HIGH" ? [255, 240, 240] : [255, 252, 235]
      const borderColor = alert.severity === "HIGH" ? [220, 50, 50] : [200, 140, 0]

      doc.setFillColor(...bgColor)
      doc.setDrawColor(...borderColor)
      doc.roundedRect(margin, y, contentW, 22, 2, 2, "FD")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(...borderColor)
      doc.text(`${i + 1}. ${alert.severity} RISK — ${alert.member1}'s ${alert.med1} + ${alert.member2}'s ${alert.med2}`, margin + 3, y + 6)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      const effectLines = doc.splitTextToSize(`Effect: ${alert.effect}`, contentW - 6)
      effectLines.forEach((line, li) => doc.text(line, margin + 3, y + 11 + li * 4.5))

      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(0, 80, 0)
      doc.text(`Action: ${alert.action}`, margin + 3, y + 18)

      doc.setTextColor(0, 0, 0)
      y += 26
    })
    y += 4
  }

  // ── DUPLICATE MEDICINES ───────────────────────────────────────
  if (allDuplicates.length > 0) {
    sectionHeader("⚡  DUPLICATE MEDICINES DETECTED", [180, 100, 0])
    allDuplicates.forEach((dup, i) => {
      checkNewPage(16)
      doc.setFillColor(255, 248, 230)
      doc.setDrawColor(200, 140, 0)
      doc.roundedRect(margin, y, contentW, 14, 2, 2, "FD")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.setTextColor(140, 80, 0)
      doc.text(`${i + 1}. DUPLICATE: ${dup.generic.toUpperCase()}`, margin + 3, y + 6)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      doc.text(`Contains: ${dup.entries.map(e => `${e.member}'s ${e.brand} ${e.dose}`).join("  +  ")}`, margin + 3, y + 11)
      doc.setTextColor(0, 0, 0)
      y += 18
    })
    y += 4
  }

  // ── CURRENT MEDICATIONS ───────────────────────────────────────
  sectionHeader("💊  CURRENT MEDICATIONS BY FAMILY MEMBER", [30, 100, 160])
  family.members.forEach(member => {
    checkNewPage(12)
    doc.setFillColor(240, 245, 255)
    doc.rect(margin, y, contentW, 7, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(30, 80, 160)
    doc.text(`${member.name}`, margin + 3, y + 5)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Age ${member.age}`, margin + 3 + doc.getTextWidth(`${member.name}`) + 4, y + 5)
    doc.setTextColor(0, 0, 0)
    y += 10

    if (member.medicines.length === 0) {
      bodyText("No medicines recorded", 4, [120, 120, 120])
    } else {
      // Table headers
      const cols = [0, 55, 90, 120, 160]
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 80)
      doc.text("Medicine", margin + cols[0], y)
      doc.text("Generic", margin + cols[1], y)
      doc.text("Dose", margin + cols[2], y)
      doc.text("Frequency", margin + cols[3], y)
      doc.text("Doctor", margin + cols[4], y)
      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 4

      member.medicines.forEach((med, idx) => {
        checkNewPage(8)
        const rowBg = idx % 2 === 0 ? [250, 250, 250] : [255, 255, 255]
        doc.setFillColor(...rowBg)
        doc.rect(margin, y - 3, contentW, 6.5, "F")
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(30, 30, 30)
        doc.text(doc.splitTextToSize(med.brandName || "", 52)[0], margin + cols[0], y)
        doc.text(doc.splitTextToSize(med.genericName || "unknown", 32)[0], margin + cols[1], y)
        doc.text(doc.splitTextToSize(med.dose || "", 28)[0], margin + cols[2], y)
        doc.text(doc.splitTextToSize(med.frequency || "", 38)[0], margin + cols[3], y)
        doc.text(doc.splitTextToSize(med.doctorName || "-", 35)[0], margin + cols[4], y)
        y += 6.5
      })
    }
    y += 6
    divider()
  })

  // ── AI GENERATED CONTENT ──────────────────────────────────────
  y += 4

  // ── FOOTER ON ALL PAGES ───────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFillColor(245, 245, 245)
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F")
    doc.setFont("helvetica", "italic")
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text(
      "This report is generated by PharmaGuard. It is NOT a substitute for professional medical advice.",
      margin, pageHeight - 4
    )
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: "right" })
  }

  return doc
}
