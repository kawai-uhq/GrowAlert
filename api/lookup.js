// api/lookup.js — Vercel proxy for the lookup endpoint
// Forwards to the bot with rate limiting (1 minute per IP)

const cooldowns = new Map();
const COOLDOWN_MS = 60 * 1000; // 1 minute

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q = req.query.q?.trim();
  if (!q) return res.status(400).json({ error: 'Missing query' });

  // ── Per-IP cooldown ──
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const last = cooldowns.get(ip) || 0;
  const now  = Date.now();
  const remaining = COOLDOWN_MS - (now - last);

  if (remaining > 0) {
    return res.status(429).json({
      error: 'cooldown',
      remaining: Math.ceil(remaining / 1000),
      message: `Please wait ${Math.ceil(remaining / 1000)} seconds before checking again.`
    });
  }

  cooldowns.set(ip, now);

  // Clean up old entries every 100 requests
  if (cooldowns.size > 500) {
    for (const [key, val] of cooldowns) {
      if (now - val > COOLDOWN_MS) cooldowns.delete(key);
    }
  }

  const botUrl = process.env.BOT_STATS_URL || 'http://node24.lunes.host:3203';

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
