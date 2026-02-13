// pages/api/verify-priority.js

export default async function handler(req, res) {
  // Csak a POST kéréseket engedélyezzük
  if (req.method !== "POST") {
    return res.status(405).json({ active: false, message: "Method not allowed" });
  }

  try {
    const { vipCode, financials } = req.body;

    // Ha nincs kód, azonnal elutasítjuk
    if (!vipCode) {
      return res.status(400).json({ active: false, message: "No code provided" });
    }

    const trimmedCode = vipCode.trim();

    // 1. BIG MASTER (Te) - Teljes hozzáférés a Hub-hoz (Nincs időkorlát)
    if (trimmedCode === "MASTER-DOMINANCE-2026") {
      return res.status(200).json({
        active: true,
        level: "master",
        redirectPath: "/premium/hub",
      });
    }

    // 2. VIP VENDÉG KÓDOK - Csak a Month oldalhoz (A frontend itt indítja el a 7 napot)
    const guestCodes = [
      "WAI-GUEST-7725", 
      "WAI-CLIENT-8832", 
      "WAI-PARTNER-9943"
    ];

    if (guestCodes.includes(trimmedCode)) {
      return res.status(200).json({
        active: true,
        level: "guest",
        redirectPath: "/premium-month",
      });
    }

    // 3. Ha egyik sem stimmel vagy időközben törölted a kódot a listából
    return res.status(401).json({ 
      active: false, 
      message: "Invalid or expired priority code." 
    });

  } catch (err) {
    console.error("Priority verification error:", err);
    return res.status(500).json({ active: false, message: "Internal server error" });
  }
}
