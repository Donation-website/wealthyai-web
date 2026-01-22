// pages/index.js
import { loadStripe } from '@stripe/stripe-js';

// A Vercel Environment Variablesból jön
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const handleCheckout = async (priceId) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error(error.message);
    }
  } catch (error) {
    console.error("Checkout error:", error);
  }
};


export default function Home() {
  return (
    <main
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/wealthyai/wealthyai.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: "white",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Középső szöveg és fizetési opciók */}
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <h1 style={{ fontSize: "3.5rem", marginBottom: "1rem", fontWeight: "bold" }}>WealthyAI</h1>
        <p style={{ opacity: 0.9, fontSize: "1.2rem", letterSpacing: "1px", marginBottom: "2rem" }}>
          Professional financial planning – Choose your subscription plan.
        </p>

        {/* Fizetési gombok */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          
          <button 
            onClick={() => handleCheckout('price_1P8h1oLyLtejYlZiB12345')} // Ez egy TESZT ID, cseréld ki!
            style={buttonStyle}>
            1 Day ($9.99)
          </button>
          <button 
            onClick={() => handleCheckout('price_1P8h1oLyLtejYlZiB67890')} // Ez egy TESZT ID, cseréld ki!
            style={buttonStyle}>
            1 Week ($14.99)
          </button>
          <button 
            onClick={() => handleCheckout('price_1P8h1oLyLtejYlZiC11111')} // Ez egy TESZT ID, cseréld ki!
            style={buttonStyle}>
            1 Month ($24.99)
          </button>

        </div>
      </div>

      {/* Ikonok a bal alsó sarokban (maradt a helyén) */}
       <div style={{ 
        position: "absolute",
        bottom: "30px",
        left: "30px",
        display: "flex", 
        gap: "15px",
        zIndex: 2
      }}>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <img src="/wealthyai/icons/fb.png" alt="Facebook" style={{ width: "28px", height: "28px" }} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <img src="/wealthyai/icons/insta.png" alt="Instagram" style={{ width: "28px", height: "28px" }} />
        </a>
        <a href="https://x.com" target="_blank" rel="noopener noreferrer">
          <img src="/wealthyai/icons/x.png" alt="X" style={{ width: "28px", height: "28px" }} />
        </a>
      </div>
    </main>
  );
}

const buttonStyle = {
    backgroundColor: '#4ade80', // Zöld szín
    border: 'none',
    padding: '15px 25px',
    borderRadius: '8px',
    color: '#0f172a',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s'
};
