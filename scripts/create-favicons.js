const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 创建渐变背景的心形图标
async function createFavicon(size, filename) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
      <path d="M${size * 0.5} ${size * 0.25}c-${size * 0.05}-${size * 0.0625}-${size * 0.125}-${size * 0.078125}-${size * 0.1875}-${size * 0.046875}-${size * 0.0625} ${size * 0.015625}-${size * 0.109375} ${size * 0.078125}-${size * 0.109375} ${size * 0.140625} 0 ${size * 0.09375} ${size * 0.09375} ${size * 0.1875} ${size * 0.296875} ${size * 0.328125} ${size * 0.203125}-${size * 0.140625} ${size * 0.296875}-${size * 0.234375} ${size * 0.296875}-${size * 0.328125} 0-${size * 0.0625}-${size * 0.046875}-${size * 0.125}-${size * 0.109375}-${size * 0.140625}-${size * 0.0625}-${size * 0.015625}-${size * 0.125}-${size * 0.015625}-${size * 0.1875} ${size * 0.046875}z" fill="white"/>
    </svg>
  `;

  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(`public/${filename}`);
    console.log(`✅ 已生成: ${filename}`);
  } catch (error) {
    console.error(`❌ 生成失败 ${filename}:`, error.message);
  }
}

// 生成所有尺寸的图标
async function generateAllFavicons() {
  console.log('🎨 开始生成favicon文件...\n');

  const icons = [
    { size: 16, filename: 'favicon-16x16.png' },
    { size: 32, filename: 'favicon-32x32.png' },
    { size: 180, filename: 'apple-touch-icon.png' },
    { size: 192, filename: 'android-chrome-192x192.png' },
    { size: 512, filename: 'android-chrome-512x512.png' }
  ];

  for (const icon of icons) {
    await createFavicon(icon.size, icon.filename);
  }

  // 创建ICO文件（16x16和32x32的组合）
  try {
    const svg16 = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="16" height="16" rx="3" fill="url(#gradient)"/>
        <path d="M8 4c-0.8-1-2-1.25-3-0.75-1 0.25-1.75 1.25-1.75 2.25 0 1.5 1.5 3 4.75 5.25 3.25-2.25 4.75-3.75 4.75-5.25 0-1-0.75-2-1.75-2.25-1-0.5-2.25-0.25-3 0.75z" fill="white"/>
      </svg>
    `;

    await sharp(Buffer.from(svg16))
      .png()
      .toFile('public/favicon.ico');
    console.log('✅ 已生成: favicon.ico');
  } catch (error) {
    console.error('❌ 生成失败 favicon.ico:', error.message);
  }

  console.log('\n🎉 所有favicon文件生成完成！');
  console.log('\n📁 生成的文件：');
  console.log('- favicon.ico (传统favicon)');
  console.log('- favicon-16x16.png (小尺寸)');
  console.log('- favicon-32x32.png (标准尺寸)');
  console.log('- apple-touch-icon.png (iOS设备)');
  console.log('- android-chrome-192x192.png (Android设备)');
  console.log('- android-chrome-512x512.png (高分辨率)');
  console.log('\n✨ 设计特点：');
  console.log('- 粉色到紫色渐变背景');
  console.log('- 白色心形图标');
  console.log('- 圆角矩形设计');
  console.log('- 简洁现代风格');
}

generateAllFavicons().catch(console.error); 