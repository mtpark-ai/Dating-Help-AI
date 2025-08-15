-- 创建用户反馈表
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- 可以为空，表示匿名用户
  email VARCHAR(255), -- 用户邮箱（如果提供）
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  thoughts TEXT,
  follow_up BOOLEAN DEFAULT false,
  page_source VARCHAR(100) NOT NULL, -- 来源页面：conversation, pickup-lines, upload-screenshot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_email ON user_feedback(email);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_user_feedback_page_source ON user_feedback(page_source);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_feedback_updated_at
    BEFORE UPDATE ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_user_feedback_updated_at();

-- 创建RLS策略
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 允许插入反馈
CREATE POLICY "Enable insert for all users" ON "public"."user_feedback"
FOR INSERT WITH CHECK (true);

-- 允许查看反馈（管理员用）
CREATE POLICY "Enable read access for admins" ON "public"."user_feedback"
FOR SELECT USING (true);

-- 允许更新反馈
CREATE POLICY "Enable update for admins" ON "public"."user_feedback"
FOR UPDATE USING (true);

-- 允许删除反馈
CREATE POLICY "Enable delete for admins" ON "public"."user_feedback"
FOR DELETE USING (true);
