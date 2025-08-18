@echo off
chcp 65001 >nul
echo 🚀 开始自动解决Git分支问题...

REM 检查是否在Git仓库中
if not exist ".git" (
    echo ❌ 错误：当前目录不是Git仓库
    pause
    exit /b 1
)

echo ✅ 确认在Git仓库中

REM 检查当前分支
for /f "tokens=2" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
echo 📍 当前分支: %CURRENT_BRANCH%

REM 获取远程分支信息
echo 📥 获取远程分支信息...
git fetch origin

REM 检查远程分支是否存在
git ls-remote --heads origin haohao-dev | findstr haohao-dev >nul
if errorlevel 1 (
    echo 🆕 远程分支 haohao-dev 不存在，创建新分支...
    git checkout -b haohao-dev
    git push -u origin haohao-dev
    echo ✅ 成功创建并推送 haohao-dev 分支
    pause
    exit /b 0
)

REM 如果当前不在 haohao-dev 分支，切换到该分支
if not "%CURRENT_BRANCH%"=="haohao-dev" (
    echo 🔄 切换到 haohao-dev 分支...
    git checkout haohao-dev 2>nul || git checkout -b haohao-dev
)

REM 尝试拉取远程更改
echo 📥 拉取远程更改...
git pull origin haohao-dev --no-edit
if errorlevel 1 (
    echo ⚠️ 拉取失败，尝试重置分支...
    
    REM 备份当前更改
    git stash push -m "Backup before reset"
    
    REM 重置到远程分支状态
    git reset --hard origin/haohao-dev
    
    REM 恢复本地更改
    git stash pop
    if errorlevel 1 (
        echo ⚠️ 没有本地更改需要恢复
    ) else (
        echo ✅ 成功恢复本地更改
    )
) else (
    echo ✅ 成功拉取远程更改
)

REM 添加所有更改
echo 📝 添加所有更改...
git add .

REM 检查是否有更改需要提交
git diff --cached --quiet
if errorlevel 1 (
    echo 💾 提交更改...
    git commit -m "Update Dating Help AI application with latest features"
) else (
    echo ℹ️ 没有更改需要提交
)

REM 推送到远程仓库
echo 🚀 推送到远程仓库...
git push origin haohao-dev
if errorlevel 1 (
    echo ❌ 推送失败，尝试强制推送...
    git push --force-with-lease origin haohao-dev
    if errorlevel 1 (
        echo ❌ 推送失败，请手动检查
        pause
        exit /b 1
    ) else (
        echo ✅ 强制推送成功！
    )
) else (
    echo ✅ 成功推送到 haohao-dev 分支！
)

echo 🎉 代码上传完成！
echo ✨ Git分支问题解决完成！
pause
