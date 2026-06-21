// api/recent.js — Returns 5 most recent scammer + DWC listings
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120'); // cache 2 min

  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/recent`, { signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Bot unreachable' });
  }
}
