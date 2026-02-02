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