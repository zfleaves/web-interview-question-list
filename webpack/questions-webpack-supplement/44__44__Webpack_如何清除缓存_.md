# 44. Webpack 如何清除缓存？

**答案：**

```javascript
// package.json
{
  "scripts": {
    "clean:cache": "rm -rf .webpack-cache node_modules/.cache"
  }
}
```

---

## 总结

以上补充了 Webpack 的高频面试题，涵盖了：

1. **环境变量配置** - DefinePlugin 配置
2. **环境变量使用** - package.json 脚本
3. **环境变量代码使用** - 在代码中使用
4. **dotenv** - 使用 dotenv
5. **.env 文件** - 环境变量文件
6. **多入口配置** - entry 配置
7. **动态入口** - 动态生成入口
8. **多页面应用** - MPA 配置
9. **自动生成 HTML** - 使用插件
10. **SSR 服务端** - 服务端配置
11. **SSR 客户端** - 客户端配置
12. **同时构建** - 同时构建客户端和服务端
13. **SSR 服务端入口** - 服务端入口文件
14. **Module Federation** - 微前端主应用
15. **微前端子应用** - 子应用配置
16. **远程组件使用** - 使用远程组件
17. **qiankun** - qiankun 微前端
18. **externals** - CDN 资源
19. **HTML CDN** - HTML 引入 CDN
20. **publicPath** - 资源路径
21. **CDN 插件** - CDN 插件
22. **动态 publicPath** - 动态路径
23. **多环境配置** - 通用配置
24. **开发环境** - 开发环境配置
25. **生产环境** - 生产环境配置
26. **package.json** - 脚本配置
27. **环境变量配置** - 使用环境变量
28. **CSS Modules** - CSS 模块化
29. **CSS Modules 使用** - 使用 CSS Modules
30. **SCSS Modules** - SCSS 模块化
31. **提取 CSS** - 提取 CSS
32. **图片优化** - 图片配置
33. **image-minimizer** - 图片压缩
34. **响应式图片** - 响应式配置
35. **响应式图片使用** - 使用示例
36. **字体文件** - 字体配置
37. **CSS 字体** - CSS 使用字体
38. **字体子集化** - 字体优化
39. **Web Font Loader** - 字体加载器
40. **文件系统缓存** - Webpack 5 缓存
41. **Babel 缓存** - Babel 缓存
42. **缓存加载器** - cache-loader
43. **持久化缓存** - 持久化配置
44. **清除缓存** - 清除缓存

这些题目补充了 Webpack 的高级特性，能够更全面地考察候选人的 Webpack 能力。