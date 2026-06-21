// api/staff.js — calls the fast /staff endpoint on the bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60');

  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/staff`, {
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`Bot returned ${response.status}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('[api/staff] Error:', err.message);
    res.status(502).json({ error: 'Bot unreachable', detail: err.message });
  }
}
