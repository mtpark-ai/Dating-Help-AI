#!/bin/bash

# 自动解决Git分支落后问题的脚本
echo "🚀 开始自动解决Git分支问题..."

# 检查是否在正确的目录
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是Git仓库"
    exit 1
fi

echo "✅ 确认在Git仓库中"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 当前分支: $CURRENT_BRANCH"

# 检查远程分支是否存在
if ! git ls-remote --heads origin haohao-dev | grep -q haohao-dev; then
    echo "🆕 远程分支 haohao-dev 不存在，创建新分支..."
    git checkout -b haohao-dev
    git push -u origin haohao-dev
    echo "✅ 成功创建并推送 haohao-dev 分支"
    exit 0
fi

# 如果当前不在 haohao-dev 分支，切换到该分支
if [ "$CURRENT_BRANCH" != "haohao-dev" ]; then
    echo "🔄 切换到 haohao-dev 分支..."
    git checkout haohao-dev 2>/dev/null || git checkout -b haohao-dev
fi

# 获取最新的远程信息
echo "📥 获取远程分支信息..."
git fetch origin

# 检查本地分支是否落后于远程分支
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/haohao-dev)

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo "✅ 本地分支已是最新状态"
else
    echo "⚠️  本地分支落后于远程分支，开始同步..."
    
    # 尝试拉取远程更改
    echo "📥 拉取远程更改..."
    if git pull origin haohao-dev --no-edit; then
        echo "✅ 成功拉取远程更改"
    else
        echo "⚠️  拉取失败，尝试重置分支..."
        # 备份当前更改
        git stash push -m "Backup before reset"
        
        # 重置到远程分支状态
        git reset --hard origin/haohao-dev
        
        # 恢复本地更改
        if git stash pop; then
            echo "✅ 成功恢复本地更改"
        else
            echo "⚠️  没有本地更改需要恢复"
        fi
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
    git commit -m "Update Dating Help AI application with latest features"
fi

# 推送到远程仓库
echo "🚀 推送到远程仓库..."
if git push origin haohao-dev; then
    echo "✅ 成功推送到 haohao-dev 分支！"
    echo "🎉 代码上传完成！"
else
    echo "❌ 推送失败，尝试强制推送..."
    if git push --force-with-lease origin haohao-dev; then
        echo "✅ 强制推送成功！"
    else
        echo "❌ 推送失败，请手动检查"
        exit 1
    fi
fi

echo "✨ Git分支问题解决完成！"
