export const FOOD_INTERACTIONS = [

  // ── WARFARIN (blood thinner) ──────────────────────────────────
  {
    drug: "warfarin",
    food: "Grapefruit",
    emoji: "🍊",
    severity: "HIGH",
    effect: "Grapefruit significantly increases Warfarin levels in blood. Risk of dangerous bleeding.",
    action: "Avoid grapefruit and grapefruit juice completely while on Warfarin."
  },
  {
    drug: "warfarin",
    food: "Spinach",
    emoji: "🥬",
    severity: "HIGH",
    effect: "Spinach is very high in Vitamin K which directly reduces Warfarin effectiveness.",
    action: "Keep spinach intake consistent. Do not suddenly increase or stop eating spinach."
  },
  {
    drug: "warfarin",
    food: "Kale",
    emoji: "🥦",
    severity: "HIGH",
    effect: "Kale is extremely high in Vitamin K. Reduces Warfarin effectiveness significantly.",
    action: "Limit kale intake. Keep amounts consistent week to week."
  },
  {
    drug: "warfarin",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol increases Warfarin levels and bleeding risk. Can cause serious internal bleeding.",
    action: "Avoid alcohol completely while on Warfarin."
  },
  {
    drug: "warfarin",
    food: "Green Tea",
    emoji: "🍵",
    severity: "MEDIUM",
    effect: "Green tea contains Vitamin K which reduces Warfarin effectiveness.",
    action: "Limit green tea to 1 cup per day. Keep intake consistent."
  },
  {
    drug: "warfarin",
    food: "Garlic",
    emoji: "🧄",
    severity: "MEDIUM",
    effect: "Large amounts of garlic may increase the blood-thinning effect of Warfarin.",
    action: "Limit garlic supplement use. Cooking amounts are generally safe."
  },
  {
    drug: "warfarin",
    food: "Mango",
    emoji: "🥭",
    severity: "MEDIUM",
    effect: "Mango can increase Warfarin effect and bleeding risk.",
    action: "Limit mango consumption. Monitor INR if eating mango regularly."
  },

  // ── STATINS (cholesterol) ─────────────────────────────────────
  {
    drug: "atorvastatin",
    food: "Grapefruit",
    emoji: "🍊",
    severity: "HIGH",
    effect: "Grapefruit dramatically increases Atorvastatin levels in blood. Risk of severe muscle damage.",
    action: "Avoid grapefruit and grapefruit juice completely while on Atorvastatin."
  },
  {
    drug: "simvastatin",
    food: "Grapefruit",
    emoji: "🍊",
    severity: "HIGH",
    effect: "Grapefruit increases Simvastatin levels 3x. Severe risk of muscle breakdown.",
    action: "Avoid grapefruit completely. Even small amounts can be dangerous."
  },
  {
    drug: "rosuvastatin",
    food: "Grapefruit",
    emoji: "🍊",
    severity: "MEDIUM",
    effect: "Grapefruit has a smaller effect on Rosuvastatin than other statins but still increases levels.",
    action: "Limit grapefruit consumption. Discuss with your doctor."
  },
  {
    drug: "atorvastatin",
    food: "Alcohol",
    emoji: "🍺",
    severity: "MEDIUM",
    effect: "Alcohol combined with Atorvastatin increases risk of liver damage.",
    action: "Limit alcohol to 1-2 drinks per day maximum. Avoid binge drinking."
  },

  // ── ACE INHIBITORS (blood pressure) ──────────────────────────
  {
    drug: "ramipril",
    food: "Banana",
    emoji: "🍌",
    severity: "MEDIUM",
    effect: "Bananas are high in potassium. ACE inhibitors raise potassium levels. Combined effect can be dangerous.",
    action: "Limit banana intake to 1 per day. Monitor potassium levels."
  },
  {
    drug: "ramipril",
    food: "Salt Substitute",
    emoji: "🧂",
    severity: "HIGH",
    effect: "Salt substitutes contain potassium chloride. ACE inhibitors raise potassium. Dangerous combination.",
    action: "Avoid salt substitutes (LoSalt, NoSalt) while on Ramipril."
  },
  {
    drug: "enalapril",
    food: "Banana",
    emoji: "🍌",
    severity: "MEDIUM",
    effect: "High potassium foods combined with ACE inhibitors can cause dangerously high potassium levels.",
    action: "Limit high-potassium foods. Monitor potassium levels with your doctor."
  },

  // ── METFORMIN (diabetes) ──────────────────────────────────────
  {
    drug: "metformin",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol with Metformin increases risk of lactic acidosis — a serious and potentially fatal condition.",
    action: "Avoid alcohol completely while on Metformin."
  },
  {
    drug: "metformin",
    food: "White Rice",
    emoji: "🍚",
    severity: "MEDIUM",
    effect: "High-glycemic foods like white rice cause blood sugar spikes that make Metformin less effective.",
    action: "Choose brown rice or limit white rice portions. Eat with protein to slow absorption."
  },
  {
    drug: "metformin",
    food: "Sugary Drinks",
    emoji: "🥤",
    severity: "HIGH",
    effect: "Sugary drinks cause rapid blood sugar spikes that Metformin cannot adequately control.",
    action: "Avoid sugary drinks completely. Choose water, plain tea or black coffee."
  },

  // ── THYROID (levothyroxine) ───────────────────────────────────
  {
    drug: "levothyroxine",
    food: "Coffee",
    emoji: "☕",
    severity: "HIGH",
    effect: "Coffee significantly reduces absorption of Levothyroxine by up to 36%.",
    action: "Take Levothyroxine on empty stomach. Wait at least 30 minutes before drinking coffee."
  },
  {
    drug: "levothyroxine",
    food: "Soy",
    emoji: "🫘",
    severity: "HIGH",
    effect: "Soy products interfere with Levothyroxine absorption significantly.",
    action: "Take Levothyroxine at least 4 hours away from soy products."
  },
  {
    drug: "levothyroxine",
    food: "Calcium",
    emoji: "🥛",
    severity: "HIGH",
    effect: "Calcium-rich foods and supplements reduce Levothyroxine absorption by binding to it.",
    action: "Take Levothyroxine on empty stomach. Wait 4 hours before dairy products."
  },
  {
    drug: "levothyroxine",
    food: "Walnuts",
    emoji: "🌰",
    severity: "MEDIUM",
    effect: "Walnuts can reduce absorption of Levothyroxine.",
    action: "Take Levothyroxine at least 4 hours before or after eating walnuts."
  },

  // ── ANTIBIOTICS ───────────────────────────────────────────────
  {
    drug: "ciprofloxacin",
    food: "Dairy",
    emoji: "🥛",
    severity: "HIGH",
    effect: "Dairy products reduce Ciprofloxacin absorption by 50% by forming insoluble compounds.",
    action: "Take Ciprofloxacin 2 hours before or 6 hours after dairy products."
  },
  {
    drug: "ciprofloxacin",
    food: "Caffeine",
    emoji: "☕",
    severity: "MEDIUM",
    effect: "Ciprofloxacin increases caffeine levels in blood causing increased heart rate and anxiety.",
    action: "Limit caffeine to 1-2 cups per day during Ciprofloxacin course."
  },
  {
    drug: "azithromycin",
    food: "Alcohol",
    emoji: "🍺",
    severity: "MEDIUM",
    effect: "Alcohol reduces immune function and may reduce effectiveness of antibiotics.",
    action: "Avoid alcohol during the full antibiotic course."
  },
  {
    drug: "amoxicillin",
    food: "Alcohol",
    emoji: "🍺",
    severity: "MEDIUM",
    effect: "Alcohol may reduce effectiveness of Amoxicillin and worsen side effects.",
    action: "Avoid alcohol during the full antibiotic course."
  },

  // ── MENTAL HEALTH ─────────────────────────────────────────────
  {
    drug: "sertraline",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol worsens depression and anxiety. Combined with Sertraline causes excessive sedation and impaired thinking.",
    action: "Avoid alcohol completely while on Sertraline."
  },
  {
    drug: "fluoxetine",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol combined with Fluoxetine causes excessive sedation and increases risk of serotonin syndrome.",
    action: "Avoid alcohol completely while on Fluoxetine."
  },
  {
    drug: "alprazolam",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Extremely dangerous combination. Both cause CNS depression. Risk of respiratory failure and death.",
    action: "Never combine Alprazolam with alcohol. This is life-threatening."
  },
  {
    drug: "alprazolam",
    food: "Grapefruit",
    emoji: "🍊",
    severity: "HIGH",
    effect: "Grapefruit significantly increases Alprazolam levels causing excessive sedation.",
    action: "Avoid grapefruit completely while on Alprazolam."
  },

  // ── BLOOD PRESSURE ────────────────────────────────────────────
  {
    drug: "amlodipine",
    food: "Grapefruit",
    emoji: "🍊",
    severity: "HIGH",
    effect: "Grapefruit increases Amlodipine levels causing excessive blood pressure lowering and dizziness.",
    action: "Avoid grapefruit and grapefruit juice while on Amlodipine."
  },
  {
    drug: "telmisartan",
    food: "Banana",
    emoji: "🍌",
    severity: "MEDIUM",
    effect: "High-potassium foods with ARBs can increase potassium to dangerous levels.",
    action: "Limit high-potassium foods. Monitor potassium levels regularly."
  },

  // ── ASPIRIN ───────────────────────────────────────────────────
  {
    drug: "aspirin",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol combined with Aspirin significantly increases stomach bleeding risk.",
    action: "Avoid alcohol while taking Aspirin regularly."
  },

  // ── PARACETAMOL ───────────────────────────────────────────────
  {
    drug: "paracetamol",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol combined with Paracetamol causes severe liver damage even at normal doses.",
    action: "Never combine Paracetamol with alcohol. Risk of acute liver failure."
  },

  // ── IBUPROFEN ─────────────────────────────────────────────────
  {
    drug: "ibuprofen",
    food: "Alcohol",
    emoji: "🍺",
    severity: "HIGH",
    effect: "Alcohol with Ibuprofen dramatically increases risk of stomach bleeding and ulcers.",
    action: "Avoid alcohol completely while taking Ibuprofen."
  },

  // ── CALCIUM CHANNEL BLOCKERS ──────────────────────────────────
  {
    drug: "amlodipine",
    food: "Salt",
    emoji: "🧂",
    severity: "MEDIUM",
    effect: "High salt intake reduces effectiveness of blood pressure medicines.",
    action: "Limit salt intake to less than 2300mg per day."
  },
]

// All unique foods for search suggestions
export const ALL_FOODS = [...new Set(FOOD_INTERACTIONS.map(f => f.food))]
