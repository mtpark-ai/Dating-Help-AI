const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

console.log('🖼️ 开始压缩图片文件...\n');

// 需要压缩的图片文件
const imagesToCompress = [
  'photo-generator-updated.png',
  'chat-assistance.png', 
  'profile-review-updated.png',
  'smart-pickup-lines.png',
  'ai-coach-updated.png'
];

async function compressImage(filename) {
  const inputPath = `public/images/${filename}`;
  const outputPath = `public/images/compressed_${filename}`;
  
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ 文件不存在: ${filename}`);
    return;
  }

  try {
    const inputStats = fs.statSync(inputPath);
    const originalSize = (inputStats.size / (1024 * 1024)).toFixed(2);
    
    await sharp(inputPath)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPath);
    
    const outputStats = fs.statSync(outputPath);
    const compressedSize = (outputStats.size / (1024 * 1024)).toFixed(2);
    const savedSize = (inputStats.size - outputStats.size) / (1024 * 1024);
    
    console.log(`✅ ${filename}:`);
    console.log(`   原始大小: ${originalSize}MB`);
    console.log(`   压缩后: ${compressedSize}MB`);
    console.log(`   节省: ${savedSize.toFixed(2)}MB (${((savedSize / inputStats.size) * 100).toFixed(1)}%)`);
    console.log('');
    
    // 替换原文件
    fs.unlinkSync(inputPath);
    fs.renameSync(outputPath, inputPath);
    
  } catch (error) {
    console.error(`❌ 压缩失败 ${filename}:`, error.message);
  }
}

async function compressAllImages() {
  console.log('📋 压缩计划:');
  imagesToCompress.forEach(img => {
    console.log(`   🎯 ${img}`);
  });
  console.log('');

  for (const image of imagesToCompress) {
    await compressImage(image);
  }

  console.log('🎉 图片压缩完成！');
  console.log('\n💡 进一步优化建议:');
  console.log('1. 考虑将PNG转换为WebP格式 (可节省50-80%)');
  console.log('2. 使用响应式图片，为不同设备提供不同尺寸');
  console.log('3. 实施懒加载减少初始加载时间');
  console.log('4. 使用CDN加速图片加载');
}

compressAllImages().catch(console.error); 