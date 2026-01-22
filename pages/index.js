import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51S0zyXDyLtejYlZibrRjTKEHsMWqtJh1WpENv2SeEc0m3KXH9yv1tdPKevrkvVgSzIYfBcukep1fo50KVn5AYp3n000F6g1N2u');

export default function Home() {
  
  const handleCheckout = async (priceId) => {
    console.log("Kattintás észlelve, Price ID:", priceId);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Szerver hiba: " + (data.error || "Ismeretlen hiba"));
        return;
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });

      if (error) {
        alert("Stripe hiba: " + error.message);
      }
    } catch (error) {
      console.error("Hiba:", error);
      alert("Hálózati hiba történt a fizetés indításakor.");
    }
  };

  return (
    <main style={mainStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>WealthyAI</h1>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>Professional financial planning</p>
        
        <div style={buttonContainer}>
          {/* CSERÉLD KI A price_... RÉSZEKET AZ ÉLES ID-KRA! */}
          <button onClick={() => handleCheckout('price_1_day_id')} style={whiteButtonStyle}>
            1 DAY <br/> <span style={{fontSize: '0.8rem'}}>$9.99</span>
          </button>
          <button onClick={() => handleCheckout('price_1_week_id')} style={whiteButtonStyle}>
            1 WEEK <br/> <span style={{fontSize: '0.8rem'}}>$14.99</span>
          </button>
          <button onClick={() => handleCheckout('price_1_month_id')} style={whiteButtonStyle}>
            1 MONTH <br/> <span style={{fontSize: '0.8rem'}}>$24.99</span>
          </button>
        </div>
      </div>

      <div style={iconContainer}>
        <a href="https://facebook.com" target="_blank"><img src="/wealthyai/icons/fb.png" style={iconStyle} /></a>
        <a href="https://instagram.com" target="_blank"><img src="/wealthyai/icons/insta.png" style={iconStyle} /></a>
        <a href="https://x.com" target="_blank"><img src="/wealthyai/icons/x.png" style={iconStyle} /></a>
      </div>
    </main>
  );
}

const mainStyle = {
  height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center",
  backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/wealthyai/wealthyai.png')",
  backgroundSize: 'cover', backgroundPosition: 'center', color: "white", fontFamily: "sans-serif", position: "relative"
};
const contentStyle = { textAlign: "center", zIndex: 1 };
const buttonContainer = { display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" };
const whiteButtonStyle = {
  backgroundColor: "white", color: "black", border: "none", padding: "15px 30px",
  borderRadius: "4px", fontWeight: "bold", cursor: "pointer", minWidth: "120px"
};
const iconContainer = { position: "absolute", bottom: "30px", left: "30px", display: "flex", gap: "15px" };
const iconStyle = { width: "28px", height: "28px" };
