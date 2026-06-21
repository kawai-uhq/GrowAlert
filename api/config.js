// api/config.js
// Exposes only PUBLIC config values to the frontend
// Add these in Vercel → Settings → Environment Variables:
//   DISCORD_INVITE    = https://discord.gg/growalert
//   HCAPTCHA_SITE_KEY = your-hcaptcha-site-key

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600'); // cache 1 hour

  res.status(200).json({
    discordInvite:   process.env.DISCORD_INVITE    || '',
    hcaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY || '',
  });
}
