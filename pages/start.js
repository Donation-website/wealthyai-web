const handleCheckout = async (priceId, tier) => {
  localStorage.setItem("userFinancials", JSON.stringify(data));

  try {
    const res = await fetch("/api/create-stripe-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, tier }),
    });

    const session = await res.json();
    if (session.url) window.location.href = session.url;
    else alert("Payment initialization failed");
  } catch {
    alert("Unexpected error");
  }
};
