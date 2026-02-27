// components/TrafficTracker.js
import { useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Adjunk neki egy 'onLocationFound' prop-ot, hogy az AI megkapja az infót!
export default function TrafficTracker({ onLocationFound }) {
  useEffect(() => {
    const trackVisit = async () => {
      if (window.location.hostname === "localhost") return;

      try {
        // 1. Megkérdezzük a Vercel API-t (amit korábban létrehoztunk), hogy hol vagyunk
        const geoRes = await fetch('/api/track');
        const geoData = await geoRes.json();

        // 2. Beküldjük a Supabase-be a TELJES adatot
        const { error } = await supabase.from('site_traffic').insert([
          { 
            path: window.location.pathname, 
            referrer: document.referrer || 'direct',
            user_agent: navigator.userAgent,
            country: geoData.country, // EZ HIÁNYZOTT!
            city: geoData.city        // EZ IS!
          }
        ]);
        
        if (error) throw error;

        // 3. Átadjuk az AI-nak az információt
        if (onLocationFound) {
          onLocationFound(geoData);
        }

        console.log("Pro visit tracked from:", geoData.country); 
      } catch (e) {
        console.error("Traffic error:", e);
      }
    };

    trackVisit();
  }, []);

  return null;
}
