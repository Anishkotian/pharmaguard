export const parseDrugsFromText = async (rawText) => {

  const commonMedicines = [
    // Pain & Fever
    "paracetamol", "ibuprofen", "aspirin", "diclofenac", "nimesulide",
    "naproxen", "ketorolac", "tramadol", "codeine", "morphine",
    "dolo", "crocin", "calpal", "metacin", "combiflam", "brufen",
    "voveran", "moov", "volini", "nise", "flexon",

    // Antibiotics
    "amoxicillin", "ciprofloxacin", "azithromycin", "doxycycline",
    "metronidazole", "clindamycin", "cephalexin", "ampicillin",
    "erythromycin", "tetracycline", "clarithromycin", "levofloxacin",
    "norfloxacin", "ofloxacin", "tinidazole", "fluconazole",
    "augmentin", "zithromax", "flagyl", "taxim", "cefixime",
    "antibiotic", "anti-biotic", "amoxyclav", "mox", "ciplox",

    // Diabetes
    "metformin", "glimepiride", "glibenclamide", "insulin", "sitagliptin",
    "vildagliptin", "empagliflozin", "dapagliflozin", "pioglitazone",
    "glycomet", "glucophage", "amaryl", "januvia", "jardiance",
    "forxiga", "glimy", "gluconorm",

    // Blood Pressure
    "amlodipine", "telmisartan", "ramipril", "enalapril", "losartan",
    "valsartan", "olmesartan", "lisinopril", "atenolol", "metoprolol",
    "carvedilol", "bisoprolol", "nifedipine", "felodipine", "hydrochlorothiazide",
    "stamlo", "amlokind", "telma", "cardace", "repace", "valsar",
    "betaloc", "aten", "concor",

    // Cholesterol
    "atorvastatin", "rosuvastatin", "simvastatin", "lovastatin",
    "pravastatin", "fenofibrate", "gemfibrozil", "ezetimibe",
    "lipitor", "crestor", "rozavel", "storvas", "atorva",

    // Heart
    "warfarin", "clopidogrel", "aspirin", "digoxin", "amiodarone",
    "nitroglycerin", "isosorbide", "furosemide", "spironolactone",
    "ecosprin", "deplatt", "sorbitrate", "lasix", "aldactone",

    // Stomach & Acidity
    "omeprazole", "pantoprazole", "rabeprazole", "esomeprazole",
    "ranitidine", "famotidine", "domperidone", "metoclopramide",
    "ondansetron", "sucralfate", "antacid", "lactulose", "bisacodyl",
    "omez", "pan", "razo", "nexpro", "rantac", "aciloc",
    "domstal", "perinorm", "emeset", "gelusil", "digene",

    // Vitamins & Supplements
    "vitamin", "calcium", "iron", "zinc", "magnesium", "folic acid",
    "vitamin c", "vitamin d", "vitamin b12", "vitamin b6", "vitamin e",
    "vitamin a", "vitamin k", "multivitamin", "omega", "fish oil",
    "shelcal", "calcirol", "revital", "becosules", "neurobion",
    "zincovit", "limcee", "folvite",

    // Thyroid
    "levothyroxine", "thyroxine", "carbimazole", "propylthiouracil",
    "thyronorm", "eltroxin",

    // Allergy & Cold
    "cetirizine", "loratadine", "fexofenadine", "chlorpheniramine",
    "montelukast", "salbutamol", "expectorant", "guaifenesin",
    "bromhexine", "ambroxol", "dextromethorphan",
    "cetzine", "alerid", "zyrtec", "telekast", "asthalin",
    "benadryl", "corex", "phensedyl",

    // Skin
    "betamethasone", "hydrocortisone", "clobetasol", "clotrimazole",
    "ketoconazole", "terbinafine", "mupirocin", "fusidic acid",
    "candid", "lobate", "betnovate", "soframycin",

    // Eye & Ear
    "timolol", "latanoprost", "ciprofloxacin eye", "tobramycin",
    "moxifloxacin", "prednisolone eye",

    // Mental Health
    "sertraline", "fluoxetine", "escitalopram", "paroxetine",
    "alprazolam", "clonazepam", "diazepam", "lorazepam",
    "risperidone", "olanzapine", "quetiapine", "lithium",
    "amitriptyline", "nortriptyline",
    "serta", "feliz", "nexito", "restyl", "alprax", "zapiz",

    // Pain Killers / Nerve
    "pregabalin", "gabapentin", "duloxetine", "methylcobalamin",
    "lyrica", "gabapin", "duvanta", "mecobalamin",

    // Hormones
    "prednisolone", "dexamethasone", "methylprednisolone",
    "progesterone", "estrogen", "testosterone",
    "wysolone", "decadron",

    // Antiviral
    "acyclovir", "oseltamivir", "remdesivir", "favipiravir",
    "tamiflu", "favir",

    // Kidney / Urology
    "tamsulosin", "alfuzosin", "sildenafil", "tadalafil",
    "urimax", "veltam",

    // Injections / Common
    "ranitidine injection", "ondansetron injection",
    "dexamethasone injection", "diclofenac injection"
  ]

  const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 2)
  const drugs = []
  const foundNames = new Set()

  lines.forEach(line => {
    const lower = line.toLowerCase()

    const matchedMed = commonMedicines.find(med => lower.includes(med))

    if (matchedMed && !foundNames.has(matchedMed)) {
      foundNames.add(matchedMed)

      // Extract dose
      const doseMatch = line.match(/\d+\s*mg|\d+\s*ml|\d+\s*mcg|\d+\s*iu|\d+\s*tablet|\d+\s*tab|\d+\s*cap/i)
      const dose = doseMatch ? doseMatch[0].trim() : "1 tablet"

      // Extract frequency
      const freqMatch = line.match(
        /once a day|twice a day|three times a day|four times a day|every \d+ hours|at night|at bedtime|morning|BD|OD|TDS|QID|SOS|once|twice/i
      )
      const frequency = freqMatch ? freqMatch[0].trim() : "once daily"

      // Get clean medicine name
      const nameParts = line.split(/\s+/).slice(0, 3).join(" ")

      drugs.push({
        brandName: nameParts,
        genericName: matchedMed,
        dose: dose,
        frequency: frequency
      })
    }
  })

  // If nothing matched — return everything that looks like a medicine line
  if (drugs.length === 0) {
    const fallbackLines = lines.filter(line =>
      line.match(/\d+\s*mg|\d+\s*ml|\d+\s*tablet|\d+\s*tab/i) &&
      line.length < 60
    )

    fallbackLines.forEach(line => {
      const doseMatch = line.match(/\d+\s*mg|\d+\s*ml|\d+\s*tablet|\d+\s*tab/i)
      drugs.push({
        brandName: line.split(/\s+/).slice(0, 2).join(" "),
        genericName: "unknown",
        dose: doseMatch ? doseMatch[0] : "unknown",
        frequency: "once daily"
      })
    })
  }

  // Last resort — return a placeholder
  if (drugs.length === 0) {
    return [
      { brandName: "Medicine 1", genericName: "unknown", dose: "unknown", frequency: "once daily" }
    ]
  }

  return drugs
}
