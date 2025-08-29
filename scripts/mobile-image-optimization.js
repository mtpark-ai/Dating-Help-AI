const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 移动端图片优化配置
const MOBILE_OPTIMIZATION_CONFIG = {
  // 移动端特定尺寸 - 基于PageSpeed报告的显示尺寸
  sizes: {
    // 主页特色图片 - 移动端显示尺寸
    'Pickup-Lines': { width: 351, height: 259 },
    'Datinghelpai': { width: 330, height: 245 },
    'Dating-AI-Coach': { width: 248, height: 202 },
    'Dating-Profile Review': { width: 305, height: 202 },
    'Photo generator': { width: 383, height: 232 },
  },
  // 移动端质量设置
  quality: {
    mobile: 70,  // 移动端更激进的压缩
    tablet: 75,
    desktop: 85
  },
  // 渐进式加载
  progressive: true,
  // WebP设置
  webp: {
    quality: 70,
    effort: 6,
    lossless: false
  }
};

// 需要优化的大图片文件
const LARGE_IMAGES = [
  '/images/Dating-Profile Review.webp', // 3470.4 KiB -> 305x202
  '/images/Photo generator.webp',       // 1340.5 KiB -> 383x232
  '/images/Pickup-Lines.webp',          // 890.7 KiB -> 351x259
  '/images/Dating-AI-Coach.webp',       // 678.5 KiB -> 248x202
  '/images/Datinghelpai.webp'          // 636.6 KiB -> 330x245
];

async function generateMobileOptimizedImages(inputPath, baseName) {
  try {
    const input = sharp(inputPath);
    const metadata = await input.metadata();
    
    console.log(`\n🔄 优化中: ${baseName}`);
    console.log(`📐 原始尺寸: ${metadata.width}x${metadata.height}`);
    console.log(`📊 原始大小: ${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB`);
    
    const sizeConfig = MOBILE_OPTIMIZATION_CONFIG.sizes[baseName];
    
    if (!sizeConfig) {
      console.log(`⚠️  没有找到 ${baseName} 的移动端尺寸配置`);
      return;
    }
    
    const outputDir = path.dirname(inputPath);
    const outputBase = path.join(outputDir, baseName);
    
    // 生成移动端特定版本
    const versions = [
      {
        suffix: '-mobile',
        width: sizeConfig.width,
        height: sizeConfig.height,
        quality: MOBILE_OPTIMIZATION_CONFIG.quality.mobile,
        description: '移动端版本 (实际显示尺寸)'
      },
      {
        suffix: '-tablet',
        width: Math.round(sizeConfig.width * 1.5),
        height: Math.round(sizeConfig.height * 1.5),
        quality: MOBILE_OPTIMIZATION_CONFIG.quality.tablet,
        description: '平板版本 (1.5x)'
      },
      {
        suffix: '-desktop',
        width: Math.round(sizeConfig.width * 2),
        height: Math.round(sizeConfig.height * 2),
        quality: MOBILE_OPTIMIZATION_CONFIG.quality.desktop,
        description: '桌面版本 (2x)'
      }
    ];
    
    for (const version of versions) {
      const outputPath = `${outputBase}${version.suffix}.webp`;
      
      await input
        .resize(version.width, version.height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: false // 允许放大以确保尺寸匹配
        })
        .webp({
          quality: version.quality,
          progressive: MOBILE_OPTIMIZATION_CONFIG.progressive,
          effort: MOBILE_OPTIMIZATION_CONFIG.webp.effort
        })
        .toFile(outputPath);
        
      const outputStats = await fs.promises.stat(outputPath);
      const sizeMB = (outputStats.size / 1024).toFixed(1);
      
      console.log(`  ✅ ${version.description}: ${version.width}x${version.height} - ${sizeMB} KB`);
    }
    
    // 计算总体节省
    const originalSize = fs.statSync(inputPath).size;
    const mobileSize = fs.statSync(`${outputBase}-mobile.webp`).size;
    const savings = ((originalSize - mobileSize) / originalSize * 100).toFixed(1);
    
    console.log(`  💾 移动端节省: ${savings}% (${((originalSize - mobileSize) / 1024).toFixed(1)} KB)`);
    
  } catch (error) {
    console.error(`❌ 优化失败 ${baseName}:`, error.message);
  }
}

async function optimizeAllMobileImages() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('🚀 开始移动端图片优化...\n');
  console.log('📱 基于PageSpeed Insights移动端实际显示尺寸优化\n');
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const imagePath of LARGE_IMAGES) {
    const fullInputPath = path.join(publicDir, imagePath);
    
    if (fs.existsSync(fullInputPath)) {
      const baseName = path.basename(imagePath, '.webp');
      
      const originalStats = await fs.promises.stat(fullInputPath);
      totalOriginalSize += originalStats.size;
      
      await generateMobileOptimizedImages(fullInputPath, baseName);
      
      // 计算移动端版本大小
      const mobileVersionPath = path.join(publicDir, 'images', `${baseName}-mobile.webp`);
      if (fs.existsSync(mobileVersionPath)) {
        const mobileStats = await fs.promises.stat(mobileVersionPath);
        totalOptimizedSize += mobileStats.size;
      }
      
    } else {
      console.log(`⚠️  文件不存在: ${imagePath}`);
    }
  }
  
  // 总体统计
  const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  const savedMB = ((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2);
  
  console.log('\n📊 移动端优化总结:');
  console.log(`  原始总大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  移动端大小: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  节省空间: ${savedMB} MB (${totalSavings}%)`);
  
  console.log('\n✅ 移动端图片优化完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 🔍 检查生成的移动端图片质量');
  console.log('2. 🔄 更新代码使用MobileOptimizedImage组件');
  console.log('3. 🚀 部署到Vercel测试移动端性能');
  console.log('4. 📱 使用PageSpeed Insights移动端重新测试');
}

// 执行移动端优化
optimizeAllMobileImages().catch(console.error);
