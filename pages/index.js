import { loadStripe } from '@stripe/stripe-js';

// Ezt a kulcsot már megadtad, ez biztonságosan szerepelhet a kliens kódban
const stripePromise = loadStripe('pk_live_51S0zyXDyLtejYlZibrRjTKEHsMWqtJh1WpENv2SeEc0m3KXH9yv1tdPKevrkvVgSzIYfBcukep1fo50KVn5AYp3n000F6g1N2u');

export default function Home() {
  
  const handleCheckout = async (priceId) => {
    // Ideiglenes figyelmeztetés, amíg nincs kész a backend
    alert("Checkout integration in progress. Price ID: " + priceId);
    
    /* 
       Ha kész az api/checkout fájlod, ezt kell majd aktiválni:
       const response = await fetch('/api/checkout', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ priceId }),
       });
       const session = await response.json();
       const stripe = await stripePromise;
       await stripe.redirectToCheckout({ sessionId: session.id });
    */
  };

  return (
    <main style={mainStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>WealthyAI</h1>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>Professional financial planning</p>
        
        {/* Fehér téglalap alakú gombok */}
        <div style={buttonContainer}>
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

      {/* Social ikonok bal alul */}
      <div style={iconContainer}>
        <a href="https://facebook.com" target="_blank"><img src="/wealthyai/icons/fb.png" style={iconStyle} /></a>
        <a href="https://instagram.com" target="_blank"><img src="/wealthyai/icons/insta.png" style={iconStyle} /></a>
        <a href="https://x.com" target="_blank"><img src="/wealthyai/icons/x.png" style={iconStyle} /></a>
      </div>
    </main>
  );
}

// Stílusok
const mainStyle = {
  height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center",
  backgroundImage: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('/wealthyai/wealthyai.png')",
  backgroundSize: 'cover', backgroundPosition: 'center', color: "white", fontFamily: "sans-serif", position: "relative"
};

const contentStyle = { textAlign: "center", zIndex: 1 };

const buttonContainer = { display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" };

const whiteButtonStyle = {
  backgroundColor: "white", color: "black", border: "none", padding: "15px 30px",
  borderRadius: "4px", fontWeight: "bold", cursor: "pointer", minWidth: "120px",
  transition: "transform 0.2s"
};

const iconContainer = { position: "absolute", bottom: "30px", left: "30px", display: "flex", gap: "15px" };
const iconStyle = { width: "28px", height: "28px" };
