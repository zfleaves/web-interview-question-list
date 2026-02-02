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