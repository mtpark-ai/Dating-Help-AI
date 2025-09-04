# Generate Answer 点击计数功能

## 功能描述

非登录用户在所有功能页累计点击3次"Generate Answer"按钮后，会自动弹出引导注册弹窗。

## 实现的功能

### 1. 全局计数
- 使用 `useGenerateCount` hook 管理全局点击计数
- 计数存储在 localStorage 中，页面刷新后保持
- 所有功能页的点击次数累计计算

### 2. 自动弹窗
- 非登录用户点击3次后自动显示注册弹窗
- 弹窗设计与signup页面保持一致
- 右上角有红色关闭按钮

### 3. 智能重置
- 用户登录后自动重置计数
- 弹窗关闭后计数继续累加
- 支持手动重置计数

## 涉及的功能页面

1. **Conversation Page** (`/conversation`)
   - 对话生成功能
   - Generate Answer 按钮

2. **Pickup Lines Page** (`/pickup-lines`)
   - 搭讪话术生成功能
   - Generate Answer 按钮

3. **Upload Screenshot Page** (`/upload-screenshot`)
   - 截图分析功能
   - Generate Answer 按钮

## 技术实现

### Hook: `useGenerateCount`
```typescript
const { count, incrementCount, resetCount, shouldShowSignupModal } = useGenerateCount()
```

### 主要方法
- `incrementCount()`: 增加计数
- `shouldShowSignupModal()`: 检查是否应该显示弹窗
- `resetCount()`: 重置计数

### 状态管理
- 使用 localStorage 持久化存储
- 自动监听用户登录状态变化
- 登录后自动重置计数

## 用户体验

1. **渐进式引导**: 用户可以在前2次点击中正常使用功能
2. **非强制注册**: 弹窗可以关闭，用户可以选择继续使用
3. **一致性设计**: 弹窗样式与现有注册页面保持一致
4. **智能提示**: 在合适的时机引导用户注册

## 配置参数

- 触发弹窗的点击次数: **3次**
- 计数存储键: `globalGenerateCount`
- 弹窗样式: 与signup页面一致
- 关闭按钮: 右上角红色圆形按钮

## 测试方法

1. 清除浏览器localStorage
2. 以非登录状态访问任意功能页
3. 点击Generate Answer按钮3次
4. 验证弹窗是否正常显示
5. 测试弹窗关闭和计数继续累加
6. 测试登录后计数重置
