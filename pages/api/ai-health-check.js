// Globális memóriaváltozók a cache-eléshez (a Vercel szerveren megmarad a futás idejére)
let cachedStatus = null;
let lastCheckTime = 0;
// 5 perc (300000 ms) a cache érvényességi ideje
const CACHE_TTL = 300000; 

export default async function handler(req, res) {
  const currentTime = Date.now();

  // 1. LÉPÉS: Visszaadjuk a tárolt eredményt, ha 5 percen belül vagyunk
  if (cachedStatus && (currentTime - lastCheckTime < CACHE_TTL)) {
    return res.status(200).json(cachedStatus);
  }

  // 2. LÉPÉS: Nincs friss cache, most muszáj kiáltani a Groq-hoz
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        status: "CRITICAL", 
        message: "GROQ_API_KEY hiányzik a környezeti változókból" 
      });
    }

    // Pehelysúlyú GET hívás (nulla token fogyasztás)
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
    });

    if (response.ok) {
      // Sikeres válasz mentése a memóriába
      cachedStatus = { status: "HEALTHY", engine: "Groq API (Cached)" };
      lastCheckTime = currentTime;
      return res.status(200).json(cachedStatus);
    } else {
      const errorData = await response.json().catch(() => ({}));
      return res.status(500).json({ 
        status: "CRITICAL", 
        message: errorData.error?.message || "Groq API hiba",
        http_code: response.status 
      });
    }
  } catch (err) {
    return res.status(500).json({ status: "OFFLINE", error: err.message });
  }
}
