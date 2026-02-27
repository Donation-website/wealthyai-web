import { useEffect } from 'react';

export default function TrafficTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      // Ne mérjük a saját gépünket
      if (window.location.hostname === "localhost") return;

      try {
        // Ez az egyetlen sor elindítja a Vercel API-t, 
        // ami pedig beírja az országot a Supabase-be.
        await fetch('/api/track');
        console.log("WealthyAI: Tracking triggered.");
      } catch (e) {
        console.error("Tracking error:", e);
      }
    };

    trackVisit();
  }, []);

  return null;
}
