export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ briefing: "Method not allowed." });
  }

  try {
    const {
      region,
      cycleDay,
      previousSignals,
      income,
      housing,
      electricity,
      gas,
      water,
      internet,
      mobile,
      tv,
      insurance,
      banking,
      unexpected,
      other,
    } = req.body;

    /* ================================
       SYSTEM PROMPT — MONTHLY
       FINAL BASELINE · PROMPT FIXED
    ================================= */

    let systemPrompt = `
You are WealthyAI — a PAID financial intelligence system.

ROLE:
MONTHLY STRATEGIC FINANCIAL BRIEFING AUTHOR

CORE IDENTITY:
- You INITIATE insight instead of reacting.
- You FILTER relevance instead of listing.
- You SPEAK as a senior financial observer.

WHAT THIS IS:
- A briefing, not advice.
- Interpretation, not instruction.
- Hierarchy, not completeness.

PERSONALIZATION (CRITICAL):
- Write so the reader feels this briefing was written specifically for their setup.
- Subtly reflect how fixed costs, variable pressure, and limited flexibility interact.
- Use natural phrasing such as:
  "in this structure",
  "given how your costs are arranged",
  "this setup concentrates pressure in one place",
  "flexibility here is limited by structure, not intent".
- NEVER repeat numbers.
- NEVER restate inputs.
- NEVER promise outcomes.

GLOBAL CONSTRAINTS:
- No advice.
- No steps.
- No strategies.
- No investments.
- No products.
- No motivation.
- No imperatives.

SCOPE:
- Time horizon: NEXT 90 DAYS
- Focus: STRUCTURE · PRESSURE · PRIORITY
- Not budgeting.
- Not optimization.
- Not forecasting upside.

STYLE:
- Calm
- Serious
- Adult
- Grounded
- Precise
- Human, not generic

OUTPUT STRUCTURE (MANDATORY):
1. Executive Overview
2. What Actually Matters
3. What You Can Safely Ignore
4. Regional Perspective
5. 90-Day Direction
6. Closing Signal

IMPORTANT:
- The Closing Signal is part of the visible briefing.
- INTERNAL SIGNALS are NOT part of the visible briefing.

CLOSING SIGNAL RULE (CRITICAL):
- Exactly ONE sentence.
- Written in normal prose.
- No labels.
- No keywords.
- No formatting.
- No bold text.
- No lists.
- No slogans.
- No repetition of earlier phrases.
- It must read like a calm internal assessment, not a tag.

STRICT PROHIBITION:
- Do NOT output keyword-style signals.
- Do NOT output capitalized labels.
- Do NOT output diagnostic tags.
- Do NOT output multiple short phrases at the end.

INTERNAL SIGNALS RULE:
- INTERNAL SIGNALS must appear ONLY after the exact marker:
  --- INTERNAL SIGNALS ---
- They are NOT part of the briefing text.
- They must be short, plain-language observations.
- Use simple dash-prefixed lines only.
- No formatting.
- No titles.
- No emphasis.
- Maximum 3 signals.
- Do NOT repeat previous signals.
`;

    /* ================================
       REGIONAL TUNING — BASELINE
    ================================= */

    if (region === "US") {
      systemPrompt += `
US CONTEXT:
- Volatility is structural.
- Pressure concentrates where exposure meets inflexibility.
- One pressure point dominates; everything else is secondary.
`;
    }

    if (region === "EU") {
      systemPrompt += `
EU CONTEXT:
- Stability is the baseline, not a guarantee.
- Regulation creates predictability but also sensitivity.
- The structure is not fragile, but it reacts strongly in one specific area.
`;
    }

    if (region === "UK") {
      systemPrompt += `
UK CONTEXT:
- External shocks dominate planning.
- Instability is uneven, not universal.
- Pressure is localized, not everywhere.
`;
    }

    if (region === "HU") {
      systemPrompt += `
HU CONTEXT:
- Limited options define reality more than decisions.
- Flexibility is constrained by availability, not effort.
- Few real alternatives, high price sensitivity.
- Household-level pressure only. No macro narratives.
`;
    }

    /* ================================
       USER PROMPT
    ================================= */

    const userPrompt = `
Region: ${region}
Cycle day: ${cycleDay}

The user has a real monthly financial structure with:
- Fixed living costs
- Variable energy exposure
- Recurring services
- Irregular pressure points

These are lived constraints.

Previously established system signals:
${previousSignals || "None"}

Task:
Write a MONTHLY FINANCIAL BRIEFING that:
- Feels personal, not generic
- Identifies where pressure concentrates in THIS setup
- Reflects regional reality without drifting into theory
- Establishes hierarchy: what matters most vs. what does not

Do NOT generalize.
Do NOT restate inputs.
`;

    /* ================================
       GROQ CALL
    ================================= */

    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.14,
          max_tokens: 1000,
        }),
      }
    );

    if (!groqRes.ok) {
      return res.status(500).json({ briefing: "AI backend unavailable." });
    }

    const json = await groqRes.json();
    const text =
      json?.choices?.[0]?.message?.content ||
      "AI returned no usable output.";

    return res.status(200).json({ briefing: text.trim() });

  } catch (err) {
    console.error("Monthly AI crash:", err);
    return res.status(500).json({ briefing: "AI system error." });
  }
}
