# Git 面试题集锦

## 1. 什么是 Git？

**答案：**

Git 是一个开源的分布式版本控制系统，是目前世界上最先进、最流行的版本控制系统。它可以快速高效地处理从很小到非常大的项目版本管理。

### Git 的特点

1. **分布式**：每个开发者都有完整的版本库，可以在本地进行提交、分支等操作
2. **高效**：项目越大越复杂，协同开发者越多，越能体现出 Git 的高性能和高可用性
3. **数据完整性**：Git 使用 SHA-1 哈希来保证数据的完整性
4. **分支管理**：Git 的分支管理非常轻量级，创建和合并分支都非常快速

### Git vs SVN

| 特性 | Git | SVN |
|------|-----|-----|
| 架构 | 分布式 | 集中式 |
| 分支 | 轻量级 | 重量级 |
| 速度 | 快 | 慢 |
| 离线工作 | 支持 | 不支持 |
| 版本号 | 无全局版本号 | 有全局版本号 |

---

## 2. Git 常用命令有哪些？

**答案：**

### 基础命令

```bash
# 初始化仓库
git init

# 克隆远程仓库
git clone <url>

# 添加文件到暂存区
git add <file>
git add .

# 提交更改
git commit -m "message"

# 查看状态
git status

# 查看日志
git log
git log --oneline
```

### 分支管理

```bash
# 查看分支
git branch

# 创建分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>
git switch <branch-name>

# 创建并切换分支
git checkout -b <branch-name>
git switch -c <branch-name>

# 合并分支
git merge <branch-name>

# 删除分支
git branch -d <branch-name>
```

### 远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add <name> <url>

# 推送到远程仓库
git push origin <branch-name>

# 从远程仓库拉取
git pull origin <branch-name>

# 获取远程更新但不合并
git fetch origin
```

### 撤销操作

```bash
# 撤销工作区的更改
git checkout -- <file>
git restore <file>

# 撤销暂存区的更改
git reset HEAD <file>
git restore --staged <file>

# 撤销提交
git reset --soft HEAD~1  # 保留更改
git reset --hard HEAD~1  # 完全删除

# 撤销提交（创建新提交）
git revert HEAD
```

---

## 3. git pull、git merge、git fetch 的区别是什么？

**答案：**

### git fetch

```bash
git fetch origin
```

- **作用**：从远程仓库获取最新的提交，但不自动合并到本地分支
- **特点**：只下载，不合并，安全但需要手动合并
- **使用场景**：想先查看远程更新，再决定是否合并

### git merge

```bash
git merge origin/main
```

- **作用**：将指定分支的更改合并到当前分支
- **特点**：会创建一个新的合并提交
- **使用场景**：合并分支，保留完整的提交历史

### git pull

```bash
git pull origin main
```

- **作用**：从远程仓库获取最新提交并自动合并到当前分支
- **特点**：`git pull = git fetch + git merge`
- **使用场景**：快速获取并合并远程更新

### 对比

```bash
# 方式 1：先 fetch 再 merge（推荐）
git fetch origin
git merge origin/main

# 方式 2：直接 pull
git pull origin main

# 方式 3：使用 rebase（保持线性历史）
git pull --rebase origin main
```

---

## 4. git merge 和 git rebase 的区别是什么？

**答案：**

### git merge

```bash
git merge feature-branch
```

- **特点**：创建一个新的合并提交，保留完整的提交历史
- **优点**：保留真实的开发历史，安全
- **缺点**：提交历史会有分叉

**示例：**
```
A---B---C  main
     \   
      D---E  feature-branch

git merge feature-branch 后：

A---B---C---F  main
     \   /   
      D---E  feature-branch
```

### git rebase

```bash
git rebase main
```

- **特点**：将当前分支的提交"移动"到目标分支的顶部，创建线性历史
- **优点**：提交历史更清晰、线性
- **缺点**：会改变提交历史，可能有风险

**示例：**
```
A---B---C  main
     \   
      D---E  feature-branch

git rebase main 后：

A---B---C---D'---E'  feature-branch
```

### 使用建议

```bash
# 使用 merge 的情况
- 保留真实的开发历史
- 公共分支（如 main、develop）
- 团队协作

# 使用 rebase 的情况
- 清理本地提交历史
- 保持提交历史线性
- 个人分支
```

---

## 5. 如何解决 Git 冲突？

**答案：**

### 冲突产生的原因

当多个开发者同时修改同一个文件的同一行代码时，Git 无法自动合并，就会产生冲突。

### 解决冲突的步骤

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 如果有冲突，Git 会提示
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt

# 3. 打开冲突文件，手动解决冲突
# Git 会在文件中标记冲突内容：
# <<<<<<< HEAD
# 你的代码
# =======
# 别人的代码
# >>>>>>> feature-branch

# 4. 编辑文件，保留需要的代码，删除冲突标记
# 例如：
def hello():
    print("Hello World")  # 保留这一行

# 5. 标记冲突已解决
git add file.txt

# 6. 提交合并
git commit -m "解决冲突"

# 7. 推送到远程
git push origin main
```

### 使用工具解决冲突

```bash
# 使用 Git 的合并工具
git mergetool

# 使用 IDE 的合并工具
# VS Code: 打开冲突文件，点击 "Accept Current Change" 或 "Accept Incoming Change"
```

### 避免冲突的方法

1. **良好的分支策略**：每个功能使用独立分支
2. **频繁同步**：定期从主分支拉取最新代码
3. **代码审查**：在合并前进行代码审查
4. **小步提交**：频繁提交，减少冲突范围

---

## 6. git reset 和 git revert 的区别是什么？

**答案：**

### git reset

```bash
# 软重置：保留更改，回退提交
git reset --soft HEAD~1

# 混合重置：重置暂存区，保留工作区
git reset --mixed HEAD~1  # 默认
git reset HEAD~1

# 硬重置：完全删除更改
git reset --hard HEAD~1
```

- **作用**：回退到指定的提交，可以删除或保留更改
- **特点**：会改变历史记录
- **使用场景**：
  - 修改上一次提交
  - 删除错误的提交
  - 重新组织提交历史

**注意**：不要对已经推送到远程的提交使用 `git reset`

### git revert

```bash
# 撤销指定的提交，创建新的提交
git revert HEAD

# 撤销多个提交
git revert HEAD~3..HEAD
```

- **作用**：创建一个新的提交来撤销指定的提交
- **特点**：不会改变历史记录，是安全的
- **使用场景**：
  - 撤销已经推送到远程的提交
  - 保留完整的提交历史
  - 团队协作

### 对比

```bash
# 撤销上一次提交

# 方式 1：reset（危险）
git reset --hard HEAD~1
# 优点：快速
# 缺点：会删除提交，如果已经推送会造成问题

# 方式 2：revert（安全）
git revert HEAD
# 优点：安全，不会删除提交
# 缺点：会创建新的提交
```

---

## 7. 什么是 git stash？

**答案：**

### git stash 的作用

`git stash` 用于临时保存当前工作区的更改，以便切换到其他分支或处理紧急任务。

### 基本用法

```bash
# 保存当前更改
git stash

# 保存更改并添加说明
git stash save "修复 bug 的临时更改"

# 查看所有 stash
git stash list

# 恢复最近的 stash
git stash pop

# 恢复指定的 stash
git stash pop stash@{0}

# 应用 stash 但不删除
git stash apply stash@{0}

# 删除 stash
git stash drop stash@{0}

# 删除所有 stash
git stash clear
```

### 实际应用场景

```bash
# 场景 1：紧急切换分支
# 当前在 feature 分支，有未提交的更改
git stash
git checkout main
# 处理紧急任务
git checkout feature
git stash pop

# 场景 2：解决冲突
git pull origin main
# 出现冲突
git stash
git pull origin main
git stash pop
# 手动解决冲突

# 场景 3：临时保存多个版本
git stash save "版本 1"
# 继续开发
git stash save "版本 2"
# 查看所有版本
git stash list
# 恢复指定版本
git stash apply stash@{1}
```

---

## 8. Git 的工作流程是什么？

**答案：**

### Git 的三个工作区

```
工作区（Working Directory）
    ↓ git add
暂存区（Staging Area / Index）
    ↓ git commit
本地仓库（Local Repository）
    ↓ git push
远程仓库（Remote Repository）
```

### Git 工作流程

```bash
# 1. 克隆远程仓库
git clone <url>

# 2. 创建分支
git checkout -b feature-branch

# 3. 修改文件
# 编辑文件...

# 4. 查看状态
git status

# 5. 添加到暂存区
git add .

# 6. 提交到本地仓库
git commit -m "添加新功能"

# 7. 拉取远程更新
git pull origin main

# 8. 推送到远程仓库
git push origin feature-branch

# 9. 创建 Pull Request
# 在 GitHub/GitLab 上创建 PR
```

### Git Flow 工作流

```
main（生产分支）
    ↓
develop（开发分支）
    ↓
feature/*（功能分支）
hotfix/*（修复分支）
release/*（发布分支）
```

---

## 总结

Git 是现代软件开发中最重要的版本控制工具，掌握 Git 对于团队协作开发至关重要。重点掌握：

1. **基础命令**：clone、add、commit、push、pull
2. **分支管理**：branch、checkout、merge、rebase
3. **冲突解决**：手动解决、使用工具
4. **撤销操作**：reset、revert、stash
5. **工作流程**：Git Flow、GitHub Flow