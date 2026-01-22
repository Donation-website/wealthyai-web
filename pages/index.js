import { loadStripe } from '@stripe/stripe-js';

// Az éles publikus kulcsod
const stripePromise = loadStripe('pk_live_51S0zyXDyLtejYlZibrRjTKEHsMWqtJh1WpENv2SeEc0m3KXH9yv1tdPKevrkvVgSzIYfBcukep1fo50KVn5AYp3n000F6g1N2u');

export default function Home() {
  
  const handleCheckout = async (priceId) => {
    try {
      // Hívja meg az 1. lépésben létrehozott API végpontot
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      // Átirányítás a Stripe fizetési oldalára
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error(error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <main style={mainStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>WealthyAI</h1>
        <p style={{ opacity: 0.8, marginBottom: "2rem" }}>Professional financial planning</p>
        
        {/* Fehér téglalap alakú gombok - CSERÉLD KI AZ ID-KAT!!! */}
        <div style={buttonContainer}>
          <button onClick={() => handleCheckout('IDE_TEDD_A_1_NAPOS_PRICE_ID-JAT')} style={whiteButtonStyle}>
            1 DAY <br/> <span style={{fontSize: '0.8rem'}}>$9.99</span>
          </button>
          <button onClick={() => handleCheckout('IDE_TEDD_A_1_HETES_PRICE_ID-JAT')} style={whiteButtonStyle}>
            1 WEEK <br/> <span style={{fontSize: '0.8rem'}}>$14.99</span>
          </button>
          <button onClick={() => handleCheckout('IDE_TEDD_A_1_HONAPOS_PRICE_ID-JAT')} style={whiteButtonStyle}>
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

// Stílusok (ugyanaz maradt)
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
