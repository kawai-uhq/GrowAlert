// api/lookup.js
// Required Vercel env vars:
//   BOT_STATS_URL    = http://node24.lunes.host:3203
//   HCAPTCHA_SECRET  = your-hcaptcha-secret-key

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const q     = req.query.q?.trim();
  const token = req.query.token?.trim(); // hCaptcha token from frontend

  if (!q)     return res.status(400).json({ error: 'Missing query' });
  if (!token) return res.status(400).json({ error: 'Missing captcha token' });

  // ── Verify hCaptcha token server-side ──
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return res.status(500).json({ error: 'HCAPTCHA_SECRET not configured' });

  try {
    const verify = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
    });
    const verifyData = await verify.json();
    if (!verifyData.success) {
      return res.status(403).json({ error: 'Captcha verification failed. Please try again.' });
    }
  } catch (err) {
    return res.status(502).json({ error: 'Could not verify captcha.' });
  }

  // ── Forward to bot ──
  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/lookup?q=${encodeURIComponent(q)}`, {
      signal: AbortSignal.timeout(15000)
    });
    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Bot unreachable', detail: err.message });
  }
}
