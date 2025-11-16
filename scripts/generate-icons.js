const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

const svgIcon = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Generate regular icons
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(svgIcon)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with padding for safe zone)
  for (const size of maskableSizes) {
    const outputPath = path.join(outputDir, `icon-maskable-${size}x${size}.png`);
    const paddingSize = Math.floor(size * 0.8); // 80% of original size for safe zone
    const padding = Math.floor((size - paddingSize) / 2);

    await sharp(svgIcon)
      .resize(paddingSize, paddingSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 16, g: 185, b: 129, alpha: 1 } // Theme color
      })
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated icon-maskable-${size}x${size}.png`);
  }

  // Generate shortcut icons
  const shortcuts = [
    {
      name: 'shortcut-log-meal.png',
      svg: `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="12" fill="#10b981"/>
        <path d="M48 28v40M28 48h40" stroke="white" stroke-width="6" stroke-linecap="round"/>
        <circle cx="48" cy="48" r="6" fill="white"/>
      </svg>`
    },
    {
      name: 'shortcut-workout.png',
      svg: `<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" rx="12" fill="#3b82f6"/>
        <rect x="20" y="44" width="8" height="8" rx="2" fill="white"/>
        <rect x="28" y="40" width="12" height="16" rx="2" fill="white"/>
        <rect x="40" y="44" width="16" height="8" rx="2" fill="white"/>
        <rect x="56" y="40" width="12" height="16" rx="2" fill="white"/>
        <rect x="68" y="44" width="8" height="8" rx="2" fill="white"/>
      </svg>`
    }
  ];

  for (const shortcut of shortcuts) {
    const outputPath = path.join(outputDir, shortcut.name);
    await sharp(Buffer.from(shortcut.svg))
      .resize(96, 96)
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated ${shortcut.name}`);
  }

  // Create placeholder screenshots
  const screenshotMobile = `<svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
    <rect width="390" height="844" fill="#f9fafb"/>
    <text x="195" y="422" text-anchor="middle" font-family="Arial" font-size="24" fill="#6b7280">
      Recipe Health App
    </text>
  </svg>`;

  const screenshotDesktop = `<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="1080" fill="#f9fafb"/>
    <text x="960" y="540" text-anchor="middle" font-family="Arial" font-size="48" fill="#6b7280">
      Recipe Health App
    </text>
  </svg>`;

  await sharp(Buffer.from(screenshotMobile))
    .png()
    .toFile(path.join(outputDir, 'screenshot-mobile.png'));
  console.log('✅ Generated screenshot-mobile.png');

  await sharp(Buffer.from(screenshotDesktop))
    .png()
    .toFile(path.join(outputDir, 'screenshot-desktop.png'));
  console.log('✅ Generated screenshot-desktop.png');

  console.log('\n✨ All icons generated successfully!');
}

generateIcons().catch(console.error);
