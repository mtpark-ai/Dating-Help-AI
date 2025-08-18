# Git分支问题自动修复脚本

这些脚本可以自动解决Git分支落后的问题，帮助您成功上传代码到GitHub。

## 🚀 使用方法

### 方法1：使用Bash脚本（macOS/Linux）
```bash
# 给脚本执行权限
chmod +x fix-git-branch.sh

# 运行脚本
./fix-git-branch.sh
```

### 方法2：使用PowerShell脚本（Windows）
```powershell
# 以管理员身份运行PowerShell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 运行脚本
.\fix-git-branch.ps1
```

### 方法3：使用批处理文件（Windows）
```cmd
# 双击运行或在命令提示符中运行
fix-git-branch.bat
```

## 📋 脚本功能

这些脚本会自动执行以下操作：

1. **检查Git仓库状态** - 确认当前目录是Git仓库
2. **获取远程信息** - 拉取最新的远程分支信息
3. **创建或切换分支** - 自动切换到 `haohao-dev` 分支
4. **同步远程更改** - 拉取远程分支的最新更改
5. **解决冲突** - 如果拉取失败，会备份本地更改并重置分支
6. **提交更改** - 添加并提交所有本地更改
7. **推送到远程** - 将更改推送到GitHub的 `haohao-dev` 分支

## ⚠️ 注意事项

- **备份重要更改**：脚本会自动备份您的更改，但建议在运行前手动备份重要文件
- **强制推送**：如果普通推送失败，脚本会尝试强制推送（`--force-with-lease`）
- **权限要求**：确保您有GitHub仓库的写入权限

## 🔧 手动解决步骤

如果您想手动解决，可以按照以下步骤：

```bash
# 1. 获取远程信息
git fetch origin

# 2. 切换到目标分支
git checkout haohao-dev

# 3. 拉取远程更改
git pull origin haohao-dev

# 4. 添加更改
git add .

# 5. 提交更改
git commit -m "Update Dating Help AI application"

# 6. 推送到远程
git push origin haohao-dev
```

## 📞 遇到问题？

如果脚本运行失败，请检查：

1. **Git是否安装**：运行 `git --version` 确认
2. **网络连接**：确保可以访问GitHub
3. **权限设置**：确认有仓库的写入权限
4. **分支名称**：确认远程分支名称正确

## 🎯 目标仓库

这些脚本会将代码推送到：
`https://github.com/mtpark-ai/Dating-Help-AI/tree/haohao-dev`

---

**提示**：建议先运行脚本，如果遇到问题再查看手动解决步骤。
