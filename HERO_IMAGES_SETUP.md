# Hero图片设置说明

## 需要替换的图片

我已经更新了代码，将hero部分的两张图片替换为：

### 1. AI Pickup Lines部分
- **原图片**: `/images/smart-pickup-lines.webp`
- **新图片**: `/images/chat-interface.webp`
- **描述**: 显示Tinder聊天界面的手机截图

### 2. Chat Assistance部分  
- **原图片**: `/images/chat-assistance.webp`
- **新图片**: `/images/tinder-profiles.webp`
- **描述**: 显示两个Tinder手机屏幕的复合图片

## 需要执行的步骤

### 步骤1: 将图片文件放入public/images目录

你需要将你上传的两张图片重命名并放入 `public/images/` 目录：

1. **第一张图片** (聊天界面截图) → 重命名为 `chat-interface.webp`
2. **第二张图片** (Tinder手机屏幕) → 重命名为 `tinder-profiles.webp`

### 步骤2: 文件格式要求

- 支持格式: `.webp`, `.png`, `.jpg`, `.jpeg`
- 推荐尺寸: 300x200 像素或更大
- 文件大小: 建议小于1MB

### 步骤3: 验证

将图片放入目录后，刷新页面即可看到新的hero图片。

## 当前状态

✅ 代码已更新完成  
⏳ 等待图片文件放入正确目录  
⏳ 需要刷新页面查看效果  

## 注意事项

- 确保图片文件名与代码中的路径完全匹配
- 图片应该清晰、专业，符合dating app的主题
- 如果图片加载失败，检查文件名和路径是否正确
