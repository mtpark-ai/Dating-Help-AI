const fs = require('fs');
const path = require('path');

console.log('🔍 分析项目冗余文件...\n');

// 分析未使用的图片文件
const unusedImages = [
  'pickup-lines.jpeg',
  'ai-coach-feature.jpeg', 
  'profile-review-feature.jpeg',
  'photo-generator-feature.jpeg',
  'conversation-reference.png',
  'screenshot-area-reference.png',
  'upload-screenshot-reference.png',
  'upload-reference.png',
  'reference-design.png'
];

console.log('📸 未使用的图片文件 (可删除):');
unusedImages.forEach(img => {
  const filePath = `public/images/${img}`;
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ❌ ${img} (${sizeInMB}MB)`);
  }
});

console.log('\n💾 可节省的空间:');
const totalUnusedSize = unusedImages.reduce((total, img) => {
  const filePath = `public/images/${img}`;
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    return total + stats.size;
  }
  return total;
}, 0);
console.log(`   📊 总计: ${(totalUnusedSize / (1024 * 1024)).toFixed(2)}MB`);

// 分析可能未使用的UI组件
const potentiallyUnusedComponents = [
  'accordion.tsx',
  'alert-dialog.tsx', 
  'alert.tsx',
  'aspect-ratio.tsx',
  'avatar.tsx',
  'badge.tsx',
  'breadcrumb.tsx',
  'calendar.tsx',
  'carousel.tsx',
  'chart.tsx',
  'checkbox.tsx',
  'collapsible.tsx',
  'command.tsx',
  'context-menu.tsx',
  'dialog.tsx',
  'drawer.tsx',
  'dropdown-menu.tsx',
  'form.tsx',
  'hover-card.tsx',
  'input-otp.tsx',
  'label.tsx',
  'menubar.tsx',
  'navigation-menu.tsx',
  'pagination.tsx',
  'popover.tsx',
  'progress.tsx',
  'radio-group.tsx',
  'resizable.tsx',
  'scroll-area.tsx',
  'select.tsx',
  'separator.tsx',
  'sheet.tsx',
  'sidebar.tsx',
  'skeleton.tsx',
  'slider.tsx',
  'sonner.tsx',
  'switch.tsx',
  'table.tsx',
  'tabs.tsx',
  'textarea.tsx',
  'toast.tsx',
  'toaster.tsx',
  'toggle-group.tsx',
  'toggle.tsx',
  'tooltip.tsx',
  'use-mobile.tsx',
  'use-toast.ts'
];

console.log('\n🧩 可能未使用的UI组件:');
console.log('   注意: 这些组件可能被间接使用，删除前请仔细检查');
potentiallyUnusedComponents.forEach(comp => {
  const filePath = `components/ui/${comp}`;
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(1);
    console.log(`   ⚠️  ${comp} (${sizeInKB}KB)`);
  }
});

// 检查其他可能的冗余文件
console.log('\n🗂️ 其他可能的冗余文件:');
const otherFiles = [
  'node_modules/is-arrayish/yarn-error.log',
  'tsconfig.tsbuildinfo',
  'pnpm-lock.yaml' // 如果使用npm，这个文件是冗余的
];

otherFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const sizeInKB = (stats.size / 1024).toFixed(1);
    console.log(`   ⚠️  ${file} (${sizeInKB}KB)`);
  }
});

console.log('\n📋 优化建议:');
console.log('1. 🗑️  删除未使用的图片文件 (可节省约6MB)');
console.log('2. 🖼️  压缩正在使用的图片文件 (可节省约9MB)');
console.log('3. 🧹  清理node_modules中的日志文件');
console.log('4. 📦  考虑使用tree-shaking减少UI组件体积');
console.log('5. 🗜️  启用gzip压缩减少传输体积');

console.log('\n🚀 立即执行的优化命令:');
console.log('   # 删除未使用的图片');
unusedImages.forEach(img => {
  console.log(`   rm public/images/${img}`);
});

console.log('\n   # 删除日志文件');
console.log('   rm node_modules/is-arrayish/yarn-error.log');

console.log('\n   # 如果使用npm，删除pnpm-lock.yaml');
console.log('   rm pnpm-lock.yaml'); 