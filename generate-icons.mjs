import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('src-tauri/icons/mimic-icon.svg');

const sizes = [
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
  { size: 1024, name: 'icon.png' },
];

console.log('🎨 Generating Mimic icons...\n');

for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`src-tauri/icons/${name}`);
  console.log(`✅ Generated ${name} (${size}x${size})`);
}

console.log('\n👻 All icons generated successfully!');
console.log('Note: .ico and .icns files need to be generated separately for Windows/macOS builds');
