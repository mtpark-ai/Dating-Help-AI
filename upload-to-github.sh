#!/bin/bash

# 自动上传代码到GitHub仓库的脚本
echo "🚀 开始上传代码到GitHub仓库..."
echo "📍 目标仓库: https://github.com/mtpark-ai/Dating-Help-AI.git"

# 检查是否在正确的目录
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是Git仓库"
    echo "请确保您在项目根目录中运行此脚本"
    exit 1
fi

echo "✅ 确认在Git仓库中"

# 检查远程仓库配置
REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE_URL" ]; then
    echo "❌ 错误：未配置远程仓库"
    echo "正在配置远程仓库..."
    git remote add origin https://github.com/mtpark-ai/Dating-Help-AI.git
elif [ "$REMOTE_URL" != "https://github.com/mtpark-ai/Dating-Help-AI.git" ]; then
    echo "⚠️  远程仓库URL不匹配，正在更新..."
    git remote set-url origin https://github.com/mtpark-ai/Dating-Help-AI.git
fi

echo "✅ 远程仓库配置正确"

# 获取最新的远程信息
echo "📥 获取远程分支信息..."
git fetch origin

# 检查远程分支是否存在
if ! git ls-remote --heads origin haohao-dev | grep -q haohao-dev; then
    echo "🆕 远程分支 haohao-dev 不存在，创建新分支..."
    git checkout -b haohao-dev
    git push -u origin haohao-dev
    echo "✅ 成功创建并推送 haohao-dev 分支"
    exit 0
fi

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 如果当前不在 haohao-dev 分支，切换到该分支
if [ "$CURRENT_BRANCH" != "haohao-dev" ]; then
    echo "🔄 切换到 haohao-dev 分支..."
    git checkout haohao-dev 2>/dev/null || git checkout -b haohao-dev
fi

# 尝试拉取远程更改
echo "📥 拉取远程更改..."
if git pull origin haohao-dev --no-edit; then
    echo "✅ 成功拉取远程更改"
else
    echo "⚠️  拉取失败，尝试重置分支..."
    
    # 备份当前更改
    echo "💾 备份当前更改..."
    git stash push -m "Backup before reset - $(date)"
    
    # 重置到远程分支状态
    echo "🔄 重置分支到远程状态..."
    git reset --hard origin/haohao-dev
    
    # 恢复本地更改
    echo "📤 恢复本地更改..."
    if git stash pop; then
        echo "✅ 成功恢复本地更改"
    else
        echo "⚠️  没有本地更改需要恢复"
    fi
fi

# 添加所有更改
echo "📝 添加所有更改..."
git add .

# 检查是否有更改需要提交
if git diff --cached --quiet; then
    echo "ℹ️  没有更改需要提交"
else
    echo "💾 提交更改..."
    git commit -m "Update Dating Help AI application with latest features and improvements

- Enhanced conversation analysis
- Improved pickup line generation
- Profile optimization features
- Screenshot analysis capabilities
- Blog system implementation
- SEO optimization
- Mobile responsiveness improvements
- Error handling enhancements"
fi

# 推送到远程仓库
echo "🚀 推送到远程仓库..."
if git push origin haohao-dev; then
    echo "✅ 成功推送到 haohao-dev 分支！"
    echo "🎉 代码上传完成！"
    echo ""
    echo "🌐 查看您的代码："
    echo "https://github.com/mtpark-ai/Dating-Help-AI/tree/haohao-dev"
else
    echo "❌ 推送失败，尝试强制推送..."
    if git push --force-with-lease origin haohao-dev; then
        echo "✅ 强制推送成功！"
        echo "🎉 代码上传完成！"
        echo ""
        echo "🌐 查看您的代码："
        echo "https://github.com/mtpark-ai/Dating-Help-AI/tree/haohao-dev"
    else
        echo "❌ 推送失败，请检查以下问题："
        echo "1. 网络连接是否正常"
        echo "2. GitHub账户是否有仓库写入权限"
        echo "3. 是否需要配置GitHub认证"
        echo ""
        echo "🔧 手动解决步骤："
        echo "git push origin haohao-dev"
        exit 1
    fi
fi

echo ""
echo "✨ 代码上传流程完成！"
echo "📊 当前状态："
git status --short
echo ""
echo "🔗 远程分支信息："
git branch -r
