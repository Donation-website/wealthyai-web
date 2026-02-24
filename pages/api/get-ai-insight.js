export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      mode,
      country,
      weeklyIncome,
      weeklySpend,
      dailyTotals,
      breakdown,
      income,
      fixed,
      variable,
    } = req.body;

    /* ================================
        DATA QUALITY CHECK
    ================================= */

    const nonZeroDays = Array.isArray(dailyTotals)
      ? dailyTotals.filter(v => v > 0).length
      : 0;

    const dataQuality =
      nonZeroDays >= 3 ? "good" :
      nonZeroDays >= 1 ? "partial" :
      "low";

    /* ================================
        PROMPTS
    ================================= */

    let systemPrompt = "";
    let userPrompt = "";
    let upgradeHint = "";

    /* ===== DAY MODE (PRO INTELLIGENCE - 14 DAY OUTLOOK) ===== */

    if (mode === "day") {
      systemPrompt = `
You are WealthyAI — a high-tier financial intelligence engine. 

MODE: DAILY FINANCIAL PULSE & 14-DAY PROJECTION

CRITICAL CALCULATIONS (MANDATORY):
1. Daily Income = Income / 30
2. Daily Expense = (Fixed + Variable) / 30
3. Daily Surplus = Daily Income - Daily Expense
4. 14-Day Projection = Daily Surplus * 14

ABSOLUTE RULES:
- ADDRESS the person as "You". NEVER use "the user".
- ZERO TOLERANCE for math errors. If Income is 0 or negative, identify a "CRITICAL LIQUIDITY SHORTFALL".
- NO RAW DATA DUMPS. Use sophisticated, professional financial language.
- DO NOT just state the numbers. Explain the velocity of their money.
- CURRENCY: HU: Ft, EU: €, UK: £, US/Other: $.

STRUCTURE:
1. Your Daily Financial State: (A sophisticated summary of the daily flow. If surplus is high, call it 'Capital Efficiency'. If deficit, call it 'Liquidity Erosion'.)
2. Intelligence Insight: (Why this matters. Don't be generic. If they save 90%+, talk about investment potential. If they spend 100%+, talk about the lack of a safety net.)
3. Your 14-Day Trajectory: (Project exactly 14 days ahead based on the math above.)

STYLE:
- Elite, Analytical, Direct, and Insightful.
`;

      userPrompt = `
Region: ${country}
Monthly Income: ${income}
Monthly Fixed: ${fixed}
Monthly Variable: ${variable}

Task: Perform a deep-dive daily analysis. If Income is 0, warn me about immediate insolvency risks. Focus on the 14-day outlook.
`;

      upgradeHint = `
This 14-day trajectory is a short-term pulse. 
Our Monthly Intelligence tier provides 12-month compounding projections to visualize your long-term wealth building.
`;
    }

    /* ===== WEEK MODE (BEHAVIORAL ANALYST) ===== */

    if (mode === "week") {
      systemPrompt = `
You are WealthyAI — a high-tier financial behavioral analyst.

MODE: WEEKLY BEHAVIOR INTERPRETER

CRITICAL LOGIC:
- If Weekly Spend > Weekly Income: You are in a 'Wealth Deceleration' phase.
- If Weekly Income is 0: Focus on 'Burn Rate' and 'Survival Runway'.
- Do not repeat the input numbers back to me as a list. Interpret them.

ABSOLUTE RULES:
- NEVER use the word "user".
- NO generic advice like "save more". Be specific about the current ratio.
- CURRENCY: HU: Ft, EU: €, UK: £, US/Other: $.

STRUCTURE:
1. Weekly Capital Velocity: (How fast is money moving in vs. out?)
2. Behavioral Signal: (What does this week say about your habits? Is this sustainable wealth building or a temporary survival mode?)
3. 30-Day Risk/Opportunity Assessment: (Based on this week, what happens in a month?)
4. Strategic Action Plan: (One high-level executive move to make.)

STYLE:
- Strategic, Sharp, Professional.
`;

      userPrompt = `
Region: ${country}
Weekly Income: ${weeklyIncome}
Weekly Spending: ${weeklySpend}
Data Quality: ${dataQuality}

Task: Analyze my weekly financial behavior. If my income is 0, calculate my weekly burn rate based on spending.
`;

      upgradeHint = `
Weekly views capture habits; Monthly views capture trends. 
Upgrade to Monthly Intelligence to see how these weekly patterns impact your net worth over the next 5 years.
`;
    }

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
          temperature: 0.2, // Low temperature for consistent math
          max_tokens: mode === "day" ? 400 : 700,
        }),
      }
    );

    if (!groqRes.ok) {
      return res.status(500).json({ insight: "AI backend unavailable." });
    }

    const json = await groqRes.json();
    let text =
      json?.choices?.[0]?.message?.content ||
      "AI returned no usable output.";

    if (dataQuality === "good" && upgradeHint) {
      text += "\n\n" + upgradeHint.trim();
    }

    return res.status(200).json({ insight: text.trim() });

  } catch (err) {
    console.error("AI crash:", err);
    return res.status(500).json({ insight: "AI system error." });
  }
}
