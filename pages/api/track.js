import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const country = req.headers['x-vercel-ip-country'] || 'Unknown';
  // A decodeURIComponent eltünteti a %20 jeleket a városnévből
  const rawCity = req.headers['x-vercel-ip-city'] || 'Unknown';
  const city = decodeURIComponent(rawCity);

  const { error } = await supabase
    .from('visitations') // Ez a jó tábla!
    .insert([{ 
      country: country, 
      city: city,
      user_agent: req.headers['user-agent']
    }])

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true, country });
}
