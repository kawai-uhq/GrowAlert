// api/staff.js — lightweight endpoint that only returns staff data
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60'); // cache 1 min

  const botUrl = process.env.BOT_STATS_URL;
  if (!botUrl) return res.status(500).json({ error: 'BOT_STATS_URL not configured' });

  try {
    const response = await fetch(`${botUrl}/stats`, {
      signal: AbortSignal.timeout(20000) // generous timeout for staff fetch
    });
    if (!response.ok) throw new Error(`Bot returned ${response.status}`);
    const data = await response.json();
    // Only return staff-relevant fields
    res.status(200).json({
      staff:     data.staff     || [],
      members:   data.members   || 0,
      guildIcon: data.guildIcon || null,
      updated:   data.updated   || null
    });
  } catch (err) {
    console.error('[api/staff] Error:', err.message);
    res.status(502).json({ error: 'Bot unreachable', detail: err.message });
  }
}
