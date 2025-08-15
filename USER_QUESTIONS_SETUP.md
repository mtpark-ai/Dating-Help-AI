# 用户问题管理系统设置指南

## 概述
这个系统允许用户在landing page提交问题，管理员可以在后台查看、回复和管理这些问题。

## 数据库设置

### 1. 在Supabase中创建表
运行以下SQL命令在你的Supabase数据库中：

```sql
-- 创建用户问题表
CREATE TABLE IF NOT EXISTS user_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'answered', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_questions_email ON user_questions(email);
CREATE INDEX IF NOT EXISTS idx_user_questions_status ON user_questions(status);
CREATE INDEX IF NOT EXISTS idx_user_questions_created_at ON user_questions(created_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_questions_updated_at 
    BEFORE UPDATE ON user_questions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## 功能特性

### 用户端
- 在landing page的FAQ部分可以点击"Ask a Question"按钮
- 填写问题和邮箱地址
- 提交后问题会保存到数据库

### 管理员端
- 访问 `/admin/questions` 页面
- 查看所有用户提交的问题
- 更新问题状态（pending, in_progress, answered, closed）
- 添加管理员回复
- 删除问题
- 查看问题统计

## API端点

- `POST /api/user-questions` - 创建新问题
- `GET /api/user-questions` - 获取所有问题
- `GET /api/user-questions?email=xxx` - 根据邮箱获取问题
- `PUT /api/user-questions/[id]` - 更新问题
- `DELETE /api/user-questions/[id]` - 删除问题
- `GET /api/user-questions/stats` - 获取问题统计

## 使用方法

### 1. 用户提交问题
1. 访问landing page
2. 滚动到FAQ部分
3. 点击"Ask a Question"按钮
4. 填写问题和邮箱
5. 点击"Submit Question"

### 2. 管理员查看问题
1. 访问 `/admin/questions`
2. 查看问题列表和统计
3. 点击问题查看详情
4. 更新状态和添加回复
5. 保存更改

## 问题状态说明

- **pending** - 待处理
- **in_progress** - 处理中
- **answered** - 已回复
- **closed** - 已关闭

## 注意事项

1. 确保Supabase环境变量已正确配置
2. 数据库表必须按照上述SQL创建
3. 管理员页面目前没有权限控制，生产环境需要添加认证
4. 所有API都有错误处理和日志记录

## 故障排除

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 确认Supabase连接正常
3. 验证数据库表结构是否正确
4. 检查API路由是否正确创建
