const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 图片压缩配置
const COMPRESSION_CONFIG = {
  quality: 80, // WebP质量
  maxWidth: 1200, // 最大宽度
  maxHeight: 800, // 最大高度
  progressive: true
};

// 需要压缩的大图片文件（根据PageSpeed Insights结果）
const LARGE_IMAGES = [
  '/images/Dating-Profile Review.webp', // 3470.4 KiB
  '/images/Photo generator.webp',       // 1340.5 KiB  
  '/images/Pickup-Lines.webp',          // 890.7 KiB
  '/images/Dating-AI-Coach.webp',       // 678.5 KiB
  '/images/Datinghelpai.webp'          // 636.6 KiB
];

async function compressImage(inputPath, outputPath) {
  try {
    const input = sharp(inputPath);
    const metadata = await input.metadata();
    
    console.log(`压缩中: ${path.basename(inputPath)}`);
    console.log(`原始尺寸: ${metadata.width}x${metadata.height}`);
    
    // 创建多个响应式版本
    const sizes = [
      { suffix: '-mobile', width: 320, height: 240 },
      { suffix: '-tablet', width: 768, height: 576 },
      { suffix: '-desktop', width: 1200, height: 800 },
      { suffix: '', width: COMPRESSION_CONFIG.maxWidth, height: COMPRESSION_CONFIG.maxHeight }
    ];
    
    for (const size of sizes) {
      const sizedOutputPath = outputPath.replace('.webp', `${size.suffix}.webp`);
      
      await input
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: COMPRESSION_CONFIG.quality,
          progressive: COMPRESSION_CONFIG.progressive,
          effort: 6 // 最高压缩努力
        })
        .toFile(sizedOutputPath);
        
      const outputStats = await fs.promises.stat(sizedOutputPath);
      console.log(`  ${size.suffix || 'original'}: ${(outputStats.size / 1024).toFixed(1)} KB`);
    }
    
  } catch (error) {
    console.error(`压缩失败 ${inputPath}:`, error.message);
  }
}

async function compressAllImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('开始压缩大图片文件...\n');
  
  for (const imagePath of LARGE_IMAGES) {
    const fullInputPath = path.join(publicDir, imagePath);
    const fullOutputPath = path.join(publicDir, imagePath.replace('.webp', '-compressed.webp'));
    
    if (fs.existsSync(fullInputPath)) {
      const inputStats = await fs.promises.stat(fullInputPath);
      console.log(`处理: ${imagePath} (${(inputStats.size / 1024).toFixed(1)} KB)`);
      
      await compressImage(fullInputPath, fullOutputPath);
      console.log('✅ 完成\n');
    } else {
      console.log(`⚠️  文件不存在: ${imagePath}`);
    }
  }
  
  console.log('所有图片压缩完成！');
  console.log('\n下一步:');
  console.log('1. 检查压缩后的图片质量');
  console.log('2. 如果满意，替换原文件');
  console.log('3. 更新代码中的图片引用以使用响应式版本');
}

// 执行压缩
compressAllImages().catch(console.error);
