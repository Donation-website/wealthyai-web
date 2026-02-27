// api/track.js
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Figyelj a nevekre: pontosan az, ami a képeden van!
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const country = req.headers['x-vercel-ip-country'] || 'Unknown';
  const city = req.headers['x-vercel-ip-city'] || 'Unknown';

  const { data, error } = await supabase
    .from('visitations')
    .insert([{ 
      country: country, // kisbetűs legyen a Supabase-ben is!
      city: city,
      user_agent: req.headers['user-agent']
    }])

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true, country });
}
