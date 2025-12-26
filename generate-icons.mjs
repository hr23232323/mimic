import sharp from 'sharp';
import { readFileSync, mkdirSync, rmSync } from 'fs';
import { execSync } from 'child_process';

const svgBuffer = readFileSync('src-tauri/icons/mimic-icon.svg');

const pngSizes = [
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
  { size: 1024, name: 'icon.png' },
];

// macOS .icns requires these specific sizes
const icnsSizes = [
  { size: 16, name: 'icon_16x16.png' },
  { size: 32, name: 'icon_16x16@2x.png' },
  { size: 32, name: 'icon_32x32.png' },
  { size: 64, name: 'icon_32x32@2x.png' },
  { size: 128, name: 'icon_128x128.png' },
  { size: 256, name: 'icon_128x128@2x.png' },
  { size: 256, name: 'icon_256x256.png' },
  { size: 512, name: 'icon_256x256@2x.png' },
  { size: 512, name: 'icon_512x512.png' },
  { size: 1024, name: 'icon_512x512@2x.png' },
];

console.log('🎨 Generating Mimic icons...\n');

// Generate PNG icons
for (const { size, name } of pngSizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`src-tauri/icons/${name}`);
  console.log(`✅ Generated ${name} (${size}x${size})`);
}

// Generate macOS .icns file
console.log('\n🍎 Generating macOS .icns file...');

// Create iconset directory
const iconsetPath = 'src-tauri/icons/icon.iconset';
rmSync(iconsetPath, { recursive: true, force: true });
mkdirSync(iconsetPath, { recursive: true });

// Generate all required sizes for .icns
for (const { size, name } of icnsSizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`${iconsetPath}/${name}`);
}

// Convert iconset to .icns using macOS iconutil
try {
  execSync(`iconutil -c icns "${iconsetPath}" -o src-tauri/icons/icon.icns`);
  console.log('✅ Generated icon.icns');

  // Clean up iconset folder
  rmSync(iconsetPath, { recursive: true, force: true });
} catch (error) {
  console.error('⚠️  Failed to generate .icns file. Run this on macOS with iconutil installed.');
  console.error('    Alternatively, use an online converter for mimic-icon.svg → icon.icns');
}

console.log('\n👻 All icons generated successfully!');
console.log('Note: Windows .ico file needs to be generated separately (or use online converter)');
