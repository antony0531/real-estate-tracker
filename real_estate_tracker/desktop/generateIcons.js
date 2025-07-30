// Simple icon generator for PWA
// This creates placeholder icons until we have proper ones

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// SVG icon template
const createSvgIcon = (size, bgColor = '#3B82F6', textColor = '#FFFFFF') => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.1}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="${textColor}">RE</text>
</svg>`;
};

// Generate SVG icons
fs.writeFileSync(path.join(publicDir, 'icon.svg'), createSvgIcon(512));

// Create canvas-based PNG generator
const createPngIcon = (size) => {
  // For now, we'll create a simple HTML file that can be used to generate PNGs
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Icon Generator</title>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; }
    canvas { display: block; margin: 0 auto 20px; background: white; }
    button { display: block; margin: 0 auto; padding: 10px 20px; }
  </style>
</head>
<body>
  <canvas id="canvas" width="${size}" height="${size}"></canvas>
  <button onclick="download()">Download icon-${size}.png</button>
  
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.roundRect(0, 0, ${size}, ${size}, ${size * 0.1});
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold ${size * 0.3}px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RE', ${size / 2}, ${size / 2});
    
    function download() {
      const link = document.createElement('a');
      link.download = 'icon-${size}.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  </script>
</body>
</html>`;
  
  return html;
};

// Generate icon generator HTML files
fs.writeFileSync(path.join(publicDir, 'icon-generator-192.html'), createPngIcon(192));
fs.writeFileSync(path.join(publicDir, 'icon-generator-512.html'), createPngIcon(512));

console.log(`
✅ Icon files generated!

To create PNG icons:
1. Open public/icon-generator-192.html in a browser
2. Click "Download icon-192.png"
3. Open public/icon-generator-512.html in a browser
4. Click "Download icon-512.png"
5. Move the downloaded files to the public directory

Or use an online tool to convert the SVG:
- public/icon.svg has been created
`);

// Create placeholder screenshots
const screenshotSvg = `<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <rect width="1280" height="720" fill="#F3F4F6"/>
  <rect x="40" y="40" width="1200" height="640" fill="#FFFFFF" rx="8"/>
  <text x="640" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="#6B7280">Real Estate Tracker Screenshot</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'screenshot-1.svg'), screenshotSvg);
fs.writeFileSync(path.join(publicDir, 'screenshot-2.svg'), screenshotSvg);