export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ insight: "Method not allowed." });
  }

  try {
    const {
      country = "US",
      weeklyIncome = 0,
      weeklySpend = 0,
      dailyTotals = [],
    } = req.body;

    const safe = (v) => (typeof v === "number" && isFinite(v) ? v : 0);

    const income = safe(weeklyIncome);
    const spend = safe(weeklySpend);
    const surplus = income - spend;
    const savingsRate = income > 0 ? surplus / income : 0;

    const days = dailyTotals.map(safe);

    const worstDayIndex = days.indexOf(Math.max(...days));
    const bestDayIndex = days.indexOf(Math.min(...days));

    const COUNTRY = {
      US: { avg: 900, currency: "USD", target: 0.2 },
      DE: { avg: 650, currency: "EUR", target: 0.22 },
      UK: { avg: 720, currency: "GBP", target: 0.2 },
      HU: { avg: 420, currency: "HUF", target: 0.15 },
    };

    const ref = COUNTRY[country] || COUNTRY.US;

    const insight = `
WEEKLY FINANCIAL INTELLIGENCE (${country})

• Weekly income: ${income} ${ref.currency}
• Weekly spending: ${spend} ${ref.currency}
• Weekly surplus: ${surplus} ${ref.currency}
• Savings rate: ${(savingsRate * 100).toFixed(1)}%
• Country average spend: ${ref.avg} ${ref.currency}

Behavior analysis:
• Highest spending day: Day ${worstDayIndex + 1}
• Lowest spending day: Day ${bestDayIndex + 1}

Assessment:
• Your spending is ${
      spend > ref.avg ? "above" : "below"
    } the national average.
• Your savings rate is ${
      savingsRate >= ref.target ? "healthy" : "below target"
    }.

Outlook:
• Monthly projection: ${(surplus * 4).toFixed(0)} ${ref.currency}
• Yearly projection: ${(surplus * 52).toFixed(0)} ${ref.currency}

Focus action for next week:
Reduce spending on the highest-cost day and aim to stabilize daily variance.
`;

    return res.status(200).json({ insight: insight.trim() });
  } catch (err) {
    console.error(err);
    return res.status(200).json({
      insight: "Analysis unavailable.",
    });
  }
}
