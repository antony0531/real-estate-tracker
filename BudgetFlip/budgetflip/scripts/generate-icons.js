import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes needed for PWA
const iconSizes = [
  // Android
  { size: 36, name: 'icon-36x36.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // iOS
  { size: 120, name: 'icon-120x120.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 167, name: 'icon-167x167.png' },
  { size: 180, name: 'icon-180x180.png' },
  
  // Maskable icons for Android
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true }
];

// iOS splash screens
const splashScreens = [
  { width: 640, height: 1136, name: 'splash-640x1136.png' },
  { width: 750, height: 1334, name: 'splash-750x1334.png' },
  { width: 828, height: 1792, name: 'splash-828x1792.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 1170, height: 2532, name: 'splash-1170x2532.png' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' },
  { width: 1242, height: 2688, name: 'splash-1242x2688.png' },
  { width: 1284, height: 2778, name: 'splash-1284x2778.png' },
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' },
  { width: 1668, height: 2224, name: 'splash-1668x2224.png' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' },
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' }
];

async function generateIcon() {
  try {
    const iconDir = path.join(__dirname, '../public/icons');
    const splashDir = path.join(__dirname, '../public/splash');
    
    // Create directories if they don't exist
    await fs.mkdir(iconDir, { recursive: true });
    await fs.mkdir(splashDir, { recursive: true });
    
    // Create base SVG icon
    const svgIcon = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#0073ea" rx="102"/>
        <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" text-anchor="middle" fill="white">B</text>
      </svg>
    `;
    
    // Generate regular icons
    console.log('Generating app icons...');
    for (const icon of iconSizes) {
      if (!icon.maskable) {
        await sharp(Buffer.from(svgIcon))
          .resize(icon.size, icon.size)
          .png()
          .toFile(path.join(iconDir, icon.name));
        console.log(`✓ Generated ${icon.name}`);
      }
    }
    
    // Generate maskable icons with padding
    const maskableSvg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#0073ea"/>
        <rect x="56" y="56" width="400" height="400" fill="#0073ea" rx="80"/>
        <text x="256" y="320" font-family="Arial, sans-serif" font-size="220" font-weight="bold" text-anchor="middle" fill="white">B</text>
      </svg>
    `;
    
    for (const icon of iconSizes) {
      if (icon.maskable) {
        await sharp(Buffer.from(maskableSvg))
          .resize(icon.size, icon.size)
          .png()
          .toFile(path.join(iconDir, icon.name));
        console.log(`✓ Generated ${icon.name} (maskable)`);
      }
    }
    
    // Generate splash screens
    console.log('\nGenerating splash screens...');
    for (const splash of splashScreens) {
      const splashSvg = `
        <svg width="${splash.width}" height="${splash.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="${splash.width}" height="${splash.height}" fill="#0073ea"/>
          <rect x="${splash.width/2 - 100}" y="${splash.height/2 - 100}" width="200" height="200" fill="white" rx="40"/>
          <text x="${splash.width/2}" y="${splash.height/2 + 20}" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#0073ea">B</text>
        </svg>
      `;
      
      await sharp(Buffer.from(splashSvg))
        .png()
        .toFile(path.join(splashDir, splash.name));
      console.log(`✓ Generated ${splash.name}`);
    }
    
    console.log('\n✅ All icons and splash screens generated successfully!');
    
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcon();