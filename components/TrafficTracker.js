import { useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

// A te meglévő Supabase kulcsaid
const SUPABASE_URL = "https://csfaqnsuhhnposhyfxmk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wjDPUzwhkqApZWEHWrvalQ_bSJr8iT0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function TrafficTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      // Ha épp csak fejlesztesz (localhost), ne számolja bele, csak az éles oldalt
      if (window.location.hostname === "localhost") return;

      try {
        await supabase.from('site_traffic').insert([
          { 
            path: window.location.pathname, 
            referrer: document.referrer || 'direct'
          }
        ]);
        console.log("Visit tracked."); 
      } catch (e) {
        console.error("Traffic error:", e);
      }
    };

    trackVisit();
  }, []);

  return null; // Ez a komponens nem rajzol semmit, láthatatlan marad
}
