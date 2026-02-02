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