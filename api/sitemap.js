export default function handler(req, res) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://wansna.vercel.app/</loc><priority>1.0</priority></url>
  <url><loc>https://wansna.vercel.app/games</loc><priority>0.9</priority></url>
  <url><loc>https://wansna.vercel.app/about</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/setup</loc><priority>0.7</priority></url>
  <url><loc>https://wansna.vercel.app/play/who-said</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/who-said/setup</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/forbidden-word</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/forbidden-word/setup</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/know-me</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/know-me/setup</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/bring-it-fast</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/bring-it-fast/setup</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/golden-numbers</loc><priority>0.8</priority></url>
  <url><loc>https://wansna.vercel.app/play/golden-numbers/setup</loc><priority>0.8</priority></url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.status(200).send(xml);
}