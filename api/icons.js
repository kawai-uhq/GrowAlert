// api/icons.js — proxies to bot's /icons endpoint
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/icons`, { signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Bot unreachable' });
  }
}
