const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// 정적 파일 서빙
app.use(express.static('.'));

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 상담 페이지
app.get('/counseling', (req, res) => {
  res.sendFile(path.join(__dirname, 'counseling.html'));
});

// 관리자 페이지
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// API 프록시 (CORS 해결)
app.use('/api', (req, res) => {
  const apiUrl = `http://223.39.246.133:3001${req.path}`;
  
  const options = {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (req.method === 'POST' || req.method === 'PUT') {
    options.body = JSON.stringify(req.body);
  }
  
  fetch(apiUrl, options)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.error('API Proxy Error:', error);
      res.status(500).json({ error: 'API Server Error' });
    });
});

// SEO를 위한 사이트맵
app.get('/sitemap.xml', (req, res) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.irosecon.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.irosecon.com/counseling</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.irosecon.com/admin</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  
  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://www.irosecon.com/sitemap.xml`;
  
  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

// 404 페이지
app.use((req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>404 - 페이지를 찾을 수 없습니다 | iRoseCon</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #667eea; }
            a { color: #667eea; text-decoration: none; }
        </style>
    </head>
    <body>
        <h1>404 - 페이지를 찾을 수 없습니다</h1>
        <p>요청하신 페이지를 찾을 수 없습니다.</p>
        <a href="/">홈으로 돌아가기</a>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🌐 iRoseCon Web Server is running on: http://223.39.246.133:${PORT}`);
  console.log(`🔗 Domain: www.irosecon.com`);
  console.log(`🌍 Access URL: https://www.irosecon.com`);
  console.log(`📱 Mobile friendly: Yes`);
  console.log(`🔍 SEO optimized: Yes`);
});
