export const INTERACTIONS = [
  // Heart + Antibiotics
  {
    drug1: "warfarin",
    drug2: "ciprofloxacin",
    severity: "HIGH",
    effect: "Ciprofloxacin increases Warfarin blood thinning effect. Risk of internal bleeding.",
    action: "Contact doctor immediately. INR monitoring required."
  },
  {
    drug1: "warfarin",
    drug2: "azithromycin",
    severity: "HIGH",
    effect: "Azithromycin increases Warfarin levels. Risk of serious bleeding.",
    action: "Monitor INR closely. Doctor may need to reduce Warfarin dose."
  },
  {
    drug1: "warfarin",
    drug2: "aspirin",
    severity: "HIGH",
    effect: "Combined use significantly increases bleeding risk.",
    action: "Avoid unless specifically directed by cardiologist."
  },
  {
    drug1: "warfarin",
    drug2: "ibuprofen",
    severity: "HIGH",
    effect: "NSAIDs like Ibuprofen increase bleeding risk with Warfarin.",
    action: "Use Paracetamol for pain instead. Consult doctor."
  },
  {
    drug1: "warfarin",
    drug2: "metronidazole",
    severity: "HIGH",
    effect: "Metronidazole significantly increases Warfarin effect.",
    action: "Avoid combination. Use alternative antibiotic."
  },
  {
    drug1: "warfarin",
    drug2: "clarithromycin",
    severity: "HIGH",
    effect: "Clarithromycin increases Warfarin blood levels dangerously.",
    action: "Avoid combination. Monitor INR if unavoidable."
  },

  // Statins + Antibiotics
  {
    drug1: "atorvastatin",
    drug2: "clarithromycin",
    severity: "HIGH",
    effect: "Risk of severe muscle damage (rhabdomyolysis).",
    action: "Avoid combination. Switch to different antibiotic."
  },
  {
    drug1: "simvastatin",
    drug2: "clarithromycin",
    severity: "HIGH",
    effect: "Clarithromycin increases Simvastatin levels causing muscle damage.",
    action: "Stop Simvastatin during antibiotic course."
  },
  {
    drug1: "atorvastatin",
    drug2: "azithromycin",
    severity: "MEDIUM",
    effect: "Slight increase in Atorvastatin levels. Monitor for muscle pain.",
    action: "Watch for muscle pain or weakness. Inform doctor."
  },

  // Blood Pressure + Pain
  {
    drug1: "amlodipine",
    drug2: "diclofenac",
    severity: "MEDIUM",
    effect: "Diclofenac reduces effectiveness of blood pressure medicines.",
    action: "Monitor blood pressure closely."
  },
  {
    drug1: "amlodipine",
    drug2: "ibuprofen",
    severity: "MEDIUM",
    effect: "Ibuprofen can raise blood pressure and reduce medicine effect.",
    action: "Use Paracetamol for pain. Monitor blood pressure."
  },
  {
    drug1: "ramipril",
    drug2: "ibuprofen",
    severity: "MEDIUM",
    effect: "NSAIDs reduce ACE inhibitor effectiveness and may damage kidneys.",
    action: "Avoid Ibuprofen. Use Paracetamol instead."
  },
  {
    drug1: "telmisartan",
    drug2: "ibuprofen",
    severity: "MEDIUM",
    effect: "NSAIDs reduce ARB effectiveness and may damage kidneys.",
    action: "Avoid NSAIDs. Use Paracetamol instead."
  },

  // Diabetes
  {
    drug1: "metformin",
    drug2: "alcohol",
    severity: "HIGH",
    effect: "Risk of lactic acidosis — a dangerous buildup of lactic acid.",
    action: "Avoid alcohol completely while on Metformin."
  },
  {
    drug1: "glimepiride",
    drug2: "ciprofloxacin",
    severity: "HIGH",
    effect: "Ciprofloxacin can cause severe low blood sugar with Glimepiride.",
    action: "Monitor blood sugar closely. Doctor may adjust dose."
  },
  {
    drug1: "metformin",
    drug2: "ciprofloxacin",
    severity: "MEDIUM",
    effect: "Ciprofloxacin may affect blood sugar levels.",
    action: "Monitor blood sugar during antibiotic course."
  },

  // Heart Rhythm
  {
    drug1: "amiodarone",
    drug2: "ciprofloxacin",
    severity: "HIGH",
    effect: "Both prolong QT interval. Risk of dangerous heart rhythm.",
    action: "Avoid combination. Use alternative antibiotic."
  },
  {
    drug1: "amiodarone",
    drug2: "azithromycin",
    severity: "HIGH",
    effect: "Both prolong QT interval. Serious heart rhythm risk.",
    action: "Avoid combination. Consult cardiologist."
  },

  // Mental Health
  {
    drug1: "sertraline",
    drug2: "tramadol",
    severity: "HIGH",
    effect: "Risk of serotonin syndrome — a potentially life threatening condition.",
    action: "Avoid combination. Use alternative pain medicine."
  },
  {
    drug1: "fluoxetine",
    drug2: "tramadol",
    severity: "HIGH",
    effect: "Risk of serotonin syndrome and seizures.",
    action: "Avoid combination. Consult doctor immediately."
  },
  {
    drug1: "alprazolam",
    drug2: "ciprofloxacin",
    severity: "MEDIUM",
    effect: "Ciprofloxacin increases Alprazolam levels causing excess sedation.",
    action: "Reduce activity. Avoid driving. Monitor closely."
  },

  // Thyroid
  {
    drug1: "levothyroxine",
    drug2: "calcium",
    severity: "MEDIUM",
    effect: "Calcium reduces absorption of thyroid medicine.",
    action: "Take Levothyroxine 4 hours apart from Calcium."
  },
  {
    drug1: "levothyroxine",
    drug2: "iron",
    severity: "MEDIUM",
    effect: "Iron reduces absorption of thyroid medicine.",
    action: "Take Levothyroxine 4 hours apart from Iron."
  },

  // Paracetamol Overdose
  {
    drug1: "paracetamol",
    drug2: "paracetamol",
    severity: "HIGH",
    effect: "Duplicate Paracetamol detected. Combined dose may exceed safe limit causing liver damage.",
    action: "Remove one medicine immediately. Safe limit is 4000mg per day for adults."
  },

  // Clopidogrel
  {
    drug1: "clopidogrel",
    drug2: "omeprazole",
    severity: "MEDIUM",
    effect: "Omeprazole reduces effectiveness of Clopidogrel blood thinning.",
    action: "Switch to Pantoprazole instead of Omeprazole."
  },
  {
    drug1: "clopidogrel",
    drug2: "aspirin",
    severity: "MEDIUM",
    effect: "Increased bleeding risk with dual antiplatelet therapy.",
    action: "Only use together if specifically prescribed by cardiologist."
  },

  // ACE Inhibitors
  {
    drug1: "ramipril",
    drug2: "potassium",
    severity: "HIGH",
    effect: "ACE inhibitors raise potassium levels. Combined with potassium supplements is dangerous.",
    action: "Monitor potassium levels. Avoid potassium supplements."
  },
  {
    drug1: "enalapril",
    drug2: "potassium",
    severity: "HIGH",
    effect: "Dangerous rise in potassium levels causing heart problems.",
    action: "Avoid potassium supplements. Monitor blood levels."
  }
]
