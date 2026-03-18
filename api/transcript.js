// api/transcript.js
// Fetches a Discord CDN transcript HTML and serves it directly
// Usage: /api/transcript?url=https://cdn.discordapp.com/...

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing ?url= parameter');
  }

  // Only allow Discord CDN URLs for security
  let parsed;
  try { parsed = new URL(url); } catch {
    return res.status(400).send('Invalid URL');
  }

  const allowedHosts = ['cdn.discordapp.com', 'media.discordapp.net', 'attachments.discordapp.net'];
  if (!allowedHosts.some(h => parsed.hostname === h)) {
    return res.status(403).send('Only Discord CDN URLs are allowed');
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'GrowAlert-Transcript-Viewer/1.0' }
    });

    if (!response.ok) {
      return res.status(response.status).send(`Discord CDN returned ${response.status}`);
    }

    const html = await response.text();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
    res.status(200).send(html);
  } catch (err) {
    console.error('[Transcript proxy] Error:', err.message);
    res.status(502).send('Failed to fetch transcript: ' + err.message);
  }
}
