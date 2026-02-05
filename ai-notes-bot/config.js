export const CONFIG = {
  // --- POSZTOLÁSI IDŐZÍTÉS ---
  POST_INTERVAL_DAYS: 5,

  // --- PLATFORM ---
  PLATFORM: "substack",

  // --- SUBSTACK LOGIN ---
  // ⚠️ IDE KÉSŐBB JÖN AZ EMAIL + JELSZÓ
  SUBSTACK_EMAIL: "",
  SUBSTACK_PASSWORD: "",

  // --- PUBLIKÁCIÓ ---
  PUBLICATION_URL: "https://timeinterpretation.substack.com",

  // --- IDENTITÁS ---
  AUTHOR_NAME: "Time & Interpretation",

  // --- VISZELKEDÉSI SZABÁLYOK ---
  RULES: {
    allowReplies: false,
    allowQuestions: false,
    allowCTA: false,
    allowLinks: false,
    allowAdvice: false,
    allowPredictions: false,
  },

  // --- STÍLUS ---
  STYLE: {
    tone: "calm, observational, minimal",
    sentenceCount: [2, 4],
    lineBreaksAllowed: true,
  },
};
