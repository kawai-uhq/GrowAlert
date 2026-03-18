// api/lookup.js — Vercel proxy for the lookup endpoint

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q = req.query.q?.trim();
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/lookup?q=${encodeURIComponent(q)}`, {
      signal: AbortSignal.timeout(15000)
    });
    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    console.error('[Vercel lookup proxy] Error:', err.message);
    res.status(502).json({ error: 'Bot unreachable', detail: err.message });
  }
}
