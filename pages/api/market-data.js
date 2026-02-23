// pages/api/market-data.js
export default async function handler(req, res) {
  // A lekérni kívánt szimbólumok listája
  const symbols = ["^GSPC", "^IXIC", "BTC-USD", "GC=F", "EURUSD=X"];
  const symbolString = symbols.join(",");
  
  try {
    // A Yahoo Finance v7 API-t használjuk
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolString}`
    );
    
    if (!response.ok) {
      throw new Error("Yahoo Finance API hiba");
    }

    const data = await response.json();
    
    // Csak a nekünk kellő adatokat csomagoljuk ki
    const formattedData = data.quoteResponse.result.map((quote) => ({
      symbol: quote.symbol,
      name: quote.shortName || quote.symbol,
      price: quote.regularMarketPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      change: (quote.regularMarketChangePercent > 0 ? "+" : "") + 
              quote.regularMarketChangePercent.toFixed(2) + "%",
      up: quote.regularMarketChangePercent >= 0,
    }));

    // 200 OK válasz az adatokkal
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Nem sikerült lekérni a tőzsdei adatokat" });
  }
}
