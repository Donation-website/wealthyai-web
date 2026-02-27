import { useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

// A te meglévő Supabase kulcsaid
const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function TrafficTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      if (window.location.hostname === "localhost") return;

      try {
        // 1. Megkérdezzük a Verceltől, hol van a júzer
        const geoRes = await fetch('/api/track');
        const geoData = await geoRes.json();

        // 2. Beküldjük a Supabase-be az országot is
        const { error } = await supabase.from('site_traffic').insert([
          { 
            path: window.location.pathname, 
            referrer: document.referrer || 'direct',
            user_agent: navigator.userAgent,
            country: geoData.country || 'Unknown',
            city: geoData.city || 'Unknown'
          }
        ]);
        
        if (error) throw error;
        console.log("WealthyAI: Visit tracked from " + geoData.country); 
      } catch (e) {
        console.error("Traffic error:", e);
      }
    };

    trackVisit();
  }, []);

  return null;
}
