// api/stats.js — Vercel serverless proxy
// Required env vars in Vercel: BOT_STATS_URL

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/stats`, {
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) throw new Error(`Bot returned HTTP ${response.status}`);

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('[Vercel proxy] Error reaching bot at', botUrl, '-', err.message);
    res.status(502).json({
      error: 'Bot unreachable',
      url: botUrl,
      detail: err.message
    });
  }
}
