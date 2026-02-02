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