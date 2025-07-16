# Dating-Help-AI 智能约会助手

Dating Help AI 是一个基于人工智能的约会助手应用，专为帮助用户在约会软件上获得更好的匹配效果和对话体验而设计。无论您是在 Tinder、Bumble、Hinge 还是其他约会平台上，这个应用都能提供个性化的指导，助您建立自信并与心仪对象建立更紧密的联系。

## 🌟 主要功能

### 1. 智能对话助手 (Dating AI Coach)
- **截图分析**：上传聊天截图，AI 自动分析对话内容
- **文本输入**：手动输入对话内容进行分析
- **智能回复生成**：基于对话语境生成3条高情商回复
- **语调定制**：支持多种语调风格（随意、正式、幽默等）
- **个性化建议**：根据对方信息提供更精准的回复建议

### 2. 智能破冰工具 (AI Pickup lines)
- **个人资料分析**：分析对方的照片和个人简介
- **定制化开场白**：基于分析结果生成个性化的开场白
- **多样化选择**：提供多种风格的破冰话术
- **提高匹配率**：优化开场白效果，提升回复概率

### 3. 约会档案优化 (Dating Profile Review)
- **个人资料评估**：分析您的个人简介和照片
- **优化建议**：提供具体的改进建议
- **吸引力提升**：帮助创建更具吸引力的个人档案
- **匹配度提升**：优化档案以获得更多匹配

### 4. 约会照片生成器 (Dating App Photo Generator)
- **照片质量优化**：提升约会档案照片的吸引力
- **个性化建议**：针对不同约会平台提供照片建议
- **专业指导**：获得专业的照片拍摄和选择建议

## 🚀 技术架构

### 前端技术栈
- **框架**：Next.js 15.2.4 (React 19)
- **样式**：Tailwind CSS
- **UI组件**：Radix UI 组件库
- **状态管理**：React Hooks
- **类型检查**：TypeScript

### 后端技术栈
- **API 框架**：Next.js API Routes
- **AI 服务**：OpenAI GPT-4o 模型
- **图像处理**：Base64 编码图像分析
- **错误处理**：全面的错误处理和日志系统

### 核心服务模块
- **GPT 服务** (`lib/gpt-service.ts`)：负责与 OpenAI API 的交互
- **对话分析** (`lib/profile-analysis.ts`)：处理个人资料分析逻辑
- **破冰话术生成** (`lib/generate-pickup-lines.ts`)：生成个性化开场白
- **错误处理** (`lib/error-handler.ts`)：统一的错误处理机制
- **日志系统** (`lib/logger.ts`)：完整的日志记录功能

## 📁 项目结构

```
Dating-Help-AI/
├── app/                          # Next.js 应用目录
│   ├── api/                      # API 路由
│   │   ├── conversation/         # 对话 API
│   │   ├── generate-pickup-lines/ # 破冰话术生成 API
│   │   ├── profile-analysis/     # 个人资料分析 API
│   │   └── screenshot-analysis/  # 截图分析 API
│   ├── conversation/             # 对话页面
│   ├── pickup-lines/             # 破冰话术页面
│   ├── upload-screenshot/        # 截图上传页面
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 应用布局
│   └── page.tsx                  # 首页
├── components/                   # React 组件
│   ├── ui/                       # UI 组件库
│   ├── error-boundary.tsx        # 错误边界组件
│   ├── footer.tsx                # 页脚组件
│   ├── header.tsx                # 页头组件
│   └── theme-provider.tsx        # 主题提供者
├── lib/                          # 工具库和服务
│   ├── config/                   # 配置文件
│   ├── client-api.ts             # 客户端 API
│   ├── error-handler.ts          # 错误处理
│   ├── gpt-service.ts            # GPT 服务
│   ├── logger.ts                 # 日志系统
│   └── utils.ts                  # 工具函数
├── types/                        # TypeScript 类型定义
│   └── index.ts                  # 主要类型定义
├── public/                       # 静态资源
│   └── images/                   # 图片资源
└── package.json                  # 项目依赖
```

## 🛠️ 快速开始

### 环境要求
- Node.js 18.x 或更高版本
- npm 或 pnpm 包管理器
- OpenAI API 密钥

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/Dating-Help-AI.git
   cd Dating-Help-AI
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   pnpm install
   ```

3. **环境配置**
   
   创建 `.env.local` 文件并配置以下环境变量：
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```

5. **访问应用**
   
   打开浏览器访问 `http://localhost:3000`

### 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 🔧 API 接口文档

### 1. 对话分析和回复生成
- **接口**：`POST /api/conversation`
- **功能**：基于对话历史生成智能回复
- **参数**：
  ```typescript
  {
    conversation: Message[],
    matchName?: string,
    otherInfo?: string,
    tone: string
  }
  ```

### 2. 截图分析
- **接口**：`POST /api/screenshot-analysis`
- **功能**：分析聊天截图并提取对话内容
- **参数**：
  ```typescript
  {
    imageBase64: string,
    matchName?: string
  }
  ```

### 3. 个人资料分析
- **接口**：`POST /api/profile-analysis`
- **功能**：分析个人资料并提供优化建议
- **参数**：
  ```typescript
  {
    bio: string,
    photos: string[]
  }
  ```

### 4. 破冰话术生成
- **接口**：`POST /api/generate-pickup-lines`
- **功能**：基于分析结果生成个性化开场白
- **参数**：
  ```typescript
  {
    analysis: ProfileAnalysisResponse,
    tone?: string
  }
  ```

## 🎯 使用指南

### 智能对话助手使用流程

1. **上传截图或输入对话**
   - 点击"Upload Screenshot"上传聊天截图
   - 或点击"Type Conversation"手动输入对话内容

2. **添加背景信息**
   - 输入对方姓名（可选）
   - 添加其他了解的信息（可选）

3. **选择回复风格**
   - 随意：轻松自然的聊天风格
   - 正式：礼貌得体的交流方式
   - 幽默：风趣幽默的对话风格

4. **获取智能回复**
   - AI 分析对话内容和语境
   - 生成3条的回复选项
   - 选择最合适的回复进行发送

### 智能破冰工具使用流程

1. **上传个人资料**
   - 在"AI Pickup Lines"页面点击"Upload Profile"
   - 上传对方的个人资料信息

2. **AI 分析处理**
   - 系统分析个人资料的文本和视觉内容
   - 提取关键信息和兴趣点

3. **生成个性化开场白**
   - 基于分析结果生成定制化开场白
   - 提供多种风格选择

## 🔒 安全和隐私

- **数据加密**：所有敏感信息都经过加密处理
- **隐私保护**：不会存储或分享用户的个人聊天记录
- **API 安全**：完善的错误处理和输入验证机制
- **日志记录**：详细的操作日志确保问题可追溯

## 📱 移动端适配

- **响应式设计**：完全适配移动设备
- **触控优化**：针对触摸操作进行优化
- **加载性能**：快速加载和流畅交互
- **跨平台支持**：支持 iOS 和 Android 设备

## 🤝 贡献指南

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

如果您有任何问题或建议，请通过以下方式联系我们：

- 提交 Issue：[GitHub Issues](https://github.com/your-username/Dating-Help-AI/issues)
- 邮件联系：your-email@example.com

## 🎉 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**Dating Help AI** - 让每一次聊天都更有魅力！ 💕
