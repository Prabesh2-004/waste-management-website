/** Built-in answers for the citizen "Ask" helper. Matching is by keywords, so it only
 * knows these topics; it is a help menu, not an AI model. */
export interface FaqEntry {
  q: string;
  keywords: string[];
  a: string[];
}

export const FAQ: FaqEntry[] = [
  {
    q: "How do I separate household waste?",
    keywords: ["separate", "segregat", "sort", "household", "bins", "which bin"],
    a: [
      "In Kathmandu, household waste is separated into two groups:",
      "• Organic (wet): food scraps, peels, tea leaves, garden waste → green bin.",
      "• Inorganic (dry): plastic, paper, metal, glass → blue bin. Keep it clean and dry.",
      "Not sure about an item? Use Identify to scan it with your camera.",
    ],
  },
  {
    q: "Where should I dispose of batteries?",
    keywords: ["batter", "e-waste", "ewaste", "electronic", "phone", "charger", "bulb"],
    a: [
      "Batteries and e-waste must not go in regular bins. Drop them at:",
      "• Your ward office (small household batteries).",
      "• KMC e-waste collection points and drives (larger items).",
      "Keep them in a dry container until you drop them off.",
    ],
  },
  {
    q: "What can be recycled?",
    keywords: ["recycl", "plastic", "bottle", "paper", "cardboard", "metal", "can", "glass"],
    a: [
      "Clean, dry items recycle best: PET bottles, hard plastic, cardboard, paper, metal cans and glass bottles.",
      "Rinse containers, remove food, flatten boxes and crush bottles to save space.",
      "Dirty or greasy items (food-soaked paper, chip packets) usually cannot be recycled.",
    ],
  },
  {
    q: "Why was my collection delayed?",
    keywords: ["delay", "late", "missed", "not come", "didn't come", "did not come", "no truck"],
    a: [
      "Delays usually come from vehicle breakdowns, road closures or festivals.",
      "Open Collection to see where the truck is right now and when it should reach your stop.",
      "If it never came, report a missed collection under Reports so the ward office can follow up.",
    ],
  },
  {
    q: "How do I compost at home?",
    keywords: ["compost", "organic", "kitchen", "food waste", "manure"],
    a: [
      "Use a bin or pot with holes. Add kitchen scraps and dry leaves in layers (about one part food to two parts dry).",
      "Keep it damp but not wet, turn it every week, and it becomes compost in 6–8 weeks.",
      "No meat, oil or plastic in the compost.",
    ],
  },
  {
    q: "What about medicines and sharp items?",
    keywords: ["medicine", "syringe", "needle", "sharp", "glass broken", "hazard", "chemical", "paint"],
    a: [
      "Wrap broken glass and sharp items in thick paper and label them before putting them out.",
      "Return old medicines to a pharmacy. Needles and syringes go in a closed hard bottle, handed to a health post.",
      "Paint and chemicals should not go in household bins; ask your ward office.",
    ],
  },
];

export const SUGGESTED = FAQ.slice(0, 4).map((f) => f.q);

export function answer(question: string, collectionLine?: string): string[] {
  const q = question.toLowerCase();
  if (/(when|what time|schedule|today|tomorrow).*(collect|truck|pickup|pick up)|next collection/.test(q) && collectionLine) {
    return [collectionLine, "Open Collection for the live truck position and the time it reaches each stop."];
  }
  let best: FaqEntry | null = null;
  let score = 0;
  for (const f of FAQ) {
    const s = f.keywords.filter((k) => q.includes(k)).length;
    if (s > score) {
      best = f;
      score = s;
    }
  }
  if (best) return best.a;
  return [
    "Sorry, I only know common waste questions. Try one of these:",
    ...SUGGESTED.map((s) => `• ${s}`),
    "For anything else, contact your ward office or send a report.",
  ];
}
