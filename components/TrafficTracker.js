import { useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

// A te meglévő Supabase kulcsaid
const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function TrafficTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      // Fejlesztői környezet kiszűrése
      if (window.location.hostname === "localhost") return;

      try {
        const { error } = await supabase.from('site_traffic').insert([
          { 
            path: window.location.pathname, 
            referrer: document.referrer || 'direct',
            // EZ AZ ÚJ RÉSZ: Beküldjük az eszköz adatait
            user_agent: navigator.userAgent 
          }
        ]);
        
        if (error) throw error;
        console.log("Visit tracked with device info."); 
      } catch (e) {
        console.error("Traffic error:", e);
      }
    };

    trackVisit();
  }, []);

  return null;
}
