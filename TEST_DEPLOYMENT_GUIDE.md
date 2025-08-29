# 测试环境部署指南

本文档描述如何将代码部署到 GitHub test-dev 分支并在 Vercel 上自动部署测试环境。

## 🚀 部署步骤

### 1. 准备工作

确保您有以下权限和资源：
- GitHub 仓库 `mtpark-ai/Dating-Help-AI` 的推送权限
- Vercel 账户访问权限
- 测试环境的 Supabase 项目

### 2. 推送代码到 test-dev 分支

```bash
# 1. 添加远程仓库（如果还没有添加）
git remote add test-repo https://github.com/mtpark-ai/Dating-Help-AI.git

# 2. 获取远程分支信息
git fetch test-repo

# 3. 切换到 test-dev 分支（如果不存在则创建）
git checkout -b test-dev test-repo/test-dev
# 如果分支不存在，使用：git checkout -b test-dev

# 4. 合并您的更改
git add .
git commit -m "feat: 优化移动端性能和触控体验，添加测试环境配置"

# 5. 推送到远程 test-dev 分支
git push test-repo test-dev
```

### 3. Vercel 自动部署配置

推送到 test-dev 分支后，Vercel 会自动触发部署。确保在 Vercel 中配置了以下环境变量：

#### 必需的环境变量

```bash
# 基础配置
NEXT_PUBLIC_ENV=test
NEXT_PUBLIC_SITE_URL=https://test.datinghelpai.com
NEXT_PUBLIC_API_URL=https://test.datinghelpai.com/api

# Supabase 测试环境配置
NEXT_PUBLIC_SUPABASE_TEST_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_TEST_ANON_KEY=your_test_supabase_anon_key

# OpenAI 配置（如果使用）
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 其他必要的 API 密钥...
```

#### Vercel 项目设置

1. **域名配置**：将 `test.datinghelpai.com` 绑定到 Vercel 项目
2. **分支配置**：确保 `test-dev` 分支启用了自动部署
3. **构建设置**：
   - 框架预设：`Next.js`
   - 构建命令：`next build`
   - 输出目录：`.next`
   - Node.js 版本：`18.x`

### 4. 测试环境特性

部署完成后，测试环境将具备以下特性：

#### 🔒 访问控制 (暂时禁用)
- 目前所有用户都可以访问测试环境
- 测试环境标识会显示在页面顶部

#### 🔍 SEO 优化
- 搜索引擎不会索引测试环境（noindex, nofollow）
- 页面标题包含 [TEST] 前缀
- 专用的 robots.txt 设置

#### 📊 性能监控
- Google Analytics 包含测试环境标记
- 调试模式默认启用
- 错误日志更详细

#### 🎨 视觉标识
- 页面左上角显示橙色"测试环境"标签
- 页面边框有橙色边框提示
- 网站图标和标题包含测试标识

## 🔧 测试环境管理

### 测试用户

由于暂时禁用了访问控制，所有用户都可以直接访问测试环境：

- 可以使用现有的生产环境用户账户
- 也可以创建专门的测试账户
- 用户登录后可以正常使用所有功能

### 用户管理 (暂时不需要)

```sql
-- 如果将来需要启用访问控制，可以使用以下 SQL：
-- 为用户添加测试权限
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"test_access": true}'::jsonb
WHERE email = 'test@example.com';
```

## 🚨 故障排除

### 常见问题

#### 1. 部署失败
```bash
# 检查构建日志
# 确保所有环境变量都已正确设置
# 检查 package.json 中的依赖是否完整
```

#### 2. 登录问题
```bash
# 确认 Supabase 测试环境连接正常
# 检查环境变量是否正确配置
# 验证用户账户在测试数据库中存在
```

#### 3. 样式问题
```bash
# 确认 Tailwind CSS 正确构建
# 检查全局样式是否正确加载
# 验证移动端优化是否生效
```

### 调试工具

#### 检查环境配置
```javascript
// 在浏览器控制台中运行
console.log('Environment:', process.env.NEXT_PUBLIC_ENV);
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_TEST_URL);
```

#### 验证用户状态
```javascript
// 在已登录状态下运行
console.log('User metadata:', user.app_metadata);
console.log('User ID:', user.id);
console.log('User email:', user.email);
```

## 📋 部署检查清单

- [ ] 代码已推送到 test-dev 分支
- [ ] Vercel 部署成功完成
- [ ] 环境变量已正确配置
- [ ] 域名 test.datinghelpai.com 正确解析
- [ ] 测试环境标识显示正常
- [ ] Supabase 测试数据库连接正常
- [ ] 用户可以正常登录和使用功能
- [ ] 移动端性能优化生效
- [ ] 触控目标大小符合要求
- [ ] 色彩对比度符合 WCAG AA 标准

## 🔄 持续集成

每次推送到 test-dev 分支时：
1. Vercel 自动构建和部署
2. 运行 TypeScript 检查
3. 执行 ESLint 代码检查
4. 构建并优化资源
5. 部署到测试域名

## 📞 支持联系

如遇到部署问题，请联系：
- 技术支持：tech@datinghelpai.com
- 项目管理：admin@datinghelpai.com

---

**注意**：测试环境仅用于内部测试，请勿用于生产数据或向外部用户开放。
