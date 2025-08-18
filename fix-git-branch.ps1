# 自动解决Git分支落后问题的PowerShell脚本
Write-Host "🚀 开始自动解决Git分支问题..." -ForegroundColor Green

# 检查是否在正确的目录
if (-not (Test-Path ".git")) {
    Write-Host "❌ 错误：当前目录不是Git仓库" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}

Write-Host "✅ 确认在Git仓库中" -ForegroundColor Green

# 检查当前分支
try {
    $CURRENT_BRANCH = git branch --show-current 2>$null
    Write-Host "📍 当前分支: $CURRENT_BRANCH" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️ 无法获取当前分支信息" -ForegroundColor Yellow
}

# 获取最新的远程信息
Write-Host "📥 获取远程分支信息..." -ForegroundColor Cyan
git fetch origin

# 检查远程分支是否存在
$remoteBranchExists = git ls-remote --heads origin haohao-dev 2>$null | Select-String "haohao-dev"
if (-not $remoteBranchExists) {
    Write-Host "🆕 远程分支 haohao-dev 不存在，创建新分支..." -ForegroundColor Yellow
    git checkout -b haohao-dev
    git push -u origin haohao-dev
    Write-Host "✅ 成功创建并推送 haohao-dev 分支" -ForegroundColor Green
    Read-Host "按回车键退出"
    exit 0
}

# 如果当前不在 haohao-dev 分支，切换到该分支
if ($CURRENT_BRANCH -ne "haohao-dev") {
    Write-Host "🔄 切换到 haohao-dev 分支..." -ForegroundColor Yellow
    try {
        git checkout haohao-dev
    } catch {
        git checkout -b haohao-dev
    }
}

# 尝试拉取远程更改
Write-Host "📥 拉取远程更改..." -ForegroundColor Cyan
try {
    git pull origin haohao-dev --no-edit
    Write-Host "✅ 成功拉取远程更改" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 拉取失败，尝试重置分支..." -ForegroundColor Yellow
    
    # 备份当前更改
    Write-Host "💾 备份当前更改..." -ForegroundColor Cyan
    git stash push -m "Backup before reset"
    
    # 重置到远程分支状态
    Write-Host "🔄 重置分支到远程状态..." -ForegroundColor Cyan
    git reset --hard origin/haohao-dev
    
    # 恢复本地更改
    Write-Host "📤 恢复本地更改..." -ForegroundColor Cyan
    try {
        git stash pop
        Write-Host "✅ 成功恢复本地更改" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ 没有本地更改需要恢复" -ForegroundColor Yellow
    }
}

# 添加所有更改
Write-Host "📝 添加所有更改..." -ForegroundColor Cyan
git add .

# 检查是否有更改需要提交
$hasChanges = git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "💾 提交更改..." -ForegroundColor Cyan
    git commit -m "Update Dating Help AI application with latest features"
} else {
    Write-Host "ℹ️ 没有更改需要提交" -ForegroundColor Yellow
}

# 推送到远程仓库
Write-Host "🚀 推送到远程仓库..." -ForegroundColor Cyan
try {
    git push origin haohao-dev
    Write-Host "✅ 成功推送到 haohao-dev 分支！" -ForegroundColor Green
} catch {
    Write-Host "❌ 推送失败，尝试强制推送..." -ForegroundColor Yellow
    try {
        git push --force-with-lease origin haohao-dev
        Write-Host "✅ 强制推送成功！" -ForegroundColor Green
    } catch {
        Write-Host "❌ 推送失败，请手动检查" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
}

Write-Host "🎉 代码上传完成！" -ForegroundColor Green
Write-Host "✨ Git分支问题解决完成！" -ForegroundColor Green
Read-Host "按回车键退出"
