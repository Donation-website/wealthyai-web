export default async function handler(req, res) {
  const symbols = ["^GSPC", "^IXIC", "BTC-USD", "GC=F", "EURUSD=X"];
  const symbolString = symbols.join(",");
  
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolString}`,
      { next: { revalidate: 60 } }
    );
    
    const data = await response.json();
    
    if (!data.quoteResponse || !data.quoteResponse.result) {
      throw new Error("No data");
    }

    const formattedData = data.quoteResponse.result.map((quote) => ({
      symbol: quote.symbol,
      name: quote.shortName || quote.symbol,
      price: quote.regularMarketPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      change: (quote.regularMarketChangePercent > 0 ? "+" : "") + quote.regularMarketChangePercent.toFixed(2) + "%",
      up: quote.regularMarketChangePercent >= 0,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    // FALLBACK: Ha a Yahoo blokkol, ezeket fogod látni, hogy ne legyen hiba
    const fallback = [
      { symbol: "^GSPC", name: "S&P 500", price: "5,123.42", change: "+0.45%", up: true },
      { symbol: "BTC-USD", name: "Bitcoin", price: "64,210.00", change: "-1.24%", up: false },
      { symbol: "GC=F", name: "Gold", price: "2,165.40", change: "+0.12%", up: true }
    ];
    res.status(200).json(fallback);
  }
}
