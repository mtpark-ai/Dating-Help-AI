const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

console.log('🔄 开始将PNG转换为WebP格式...\n');

// 需要转换的图片文件
const imagesToConvert = [
  'photo-generator-updated.png',
  'chat-assistance.png', 
  'profile-review-updated.png',
  'smart-pickup-lines.png',
  'ai-coach-updated.png'
];

async function convertToWebP(filename) {
  const inputPath = `public/images/${filename}`;
  const outputPath = `public/images/${filename.replace('.png', '.webp')}`;
  
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ 文件不存在: ${filename}`);
    return;
  }

  try {
    const inputStats = fs.statSync(inputPath);
    const originalSize = (inputStats.size / (1024 * 1024)).toFixed(2);
    
    await sharp(inputPath)
      .webp({ 
        quality: 85,
        effort: 6,
        nearLossless: true
      })
      .toFile(outputPath);
    
    const outputStats = fs.statSync(outputPath);
    const webpSize = (outputStats.size / (1024 * 1024)).toFixed(2);
    const savedSize = (inputStats.size - outputStats.size) / (1024 * 1024);
    const compressionRatio = ((savedSize / inputStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${filename}:`);
    console.log(`   PNG大小: ${originalSize}MB`);
    console.log(`   WebP大小: ${webpSize}MB`);
    console.log(`   节省: ${savedSize.toFixed(2)}MB (${compressionRatio}%)`);
    console.log('');
    
  } catch (error) {
    console.error(`❌ 转换失败 ${filename}:`, error.message);
  }
}

async function convertAllImages() {
  console.log('📋 转换计划:');
  imagesToConvert.forEach(img => {
    console.log(`   🎯 ${img} → ${img.replace('.png', '.webp')}`);
  });
  console.log('');

  for (const image of imagesToConvert) {
    await convertToWebP(image);
  }

  console.log('🎉 WebP转换完成！');
  console.log('\n💡 下一步操作:');
  console.log('1. 更新代码中的图片引用路径');
  console.log('2. 删除原始PNG文件');
  console.log('3. 测试网站功能');
}

convertAllImages().catch(console.error); 