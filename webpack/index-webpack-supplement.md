# Webpack 高频面试题补充（截止 2025 年底）

## 目录

1. [1. Webpack 如何配置环境变量？](./questions-webpack-supplement/01__1__Webpack_如何配置环境变量_.md)
2. [2. Webpack 如何使用环境变量？](./questions-webpack-supplement/02__2__Webpack_如何使用环境变量_.md)
3. [3. Webpack 如何在代码中使用环境变量？](./questions-webpack-supplement/03__3__Webpack_如何在代码中使用环境变量_.md)
4. [4. Webpack 如何使用 dotenv？](./questions-webpack-supplement/04__4__Webpack_如何使用_dotenv_.md)
5. [5. Webpack 如何配置 .env 文件？](./questions-webpack-supplement/05__5__Webpack_如何配置_.env_文件_.md)
6. [6. Webpack 如何配置多入口？](./questions-webpack-supplement/06__6__Webpack_如何配置多入口_.md)
7. [7. Webpack 如何配置动态入口？](./questions-webpack-supplement/07__7__Webpack_如何配置动态入口_.md)
8. [8. Webpack 如何配置多页面应用？](./questions-webpack-supplement/08__8__Webpack_如何配置多页面应用_.md)
9. [9. Webpack 如何使用插件自动生成 HTML？](./questions-webpack-supplement/09__9__Webpack_如何使用插件自动生成_HTML_.md)
10. [10. Webpack 如何配置 SSR 服务端？](./questions-webpack-supplement/10__10__Webpack_如何配置_SSR_服务端_.md)
11. [11. Webpack 如何配置 SSR 客户端？](./questions-webpack-supplement/11__11__Webpack_如何配置_SSR_客户端_.md)
12. [12. Webpack 如何同时构建客户端和服务端？](./questions-webpack-supplement/12__12__Webpack_如何同时构建客户端和服务端_.md)
13. [13. Webpack SSR 如何配置服务端入口？](./questions-webpack-supplement/13__13__Webpack_SSR_如何配置服务端入口_.md)
14. [14. Webpack 如何使用 Module Federation 实现微前端？](./questions-webpack-supplement/14__14__Webpack_如何使用_Module_Federation_实现微前端_.md)
15. [15. Webpack 如何配置微前端子应用？](./questions-webpack-supplement/15__15__Webpack_如何配置微前端子应用_.md)
16. [16. Webpack 微前端如何在主应用中使用远程组件？](./questions-webpack-supplement/16__16__Webpack_微前端如何在主应用中使用远程组件_.md)
17. [17. Webpack 如何使用 qiankun 实现微前端？](./questions-webpack-supplement/17__17__Webpack_如何使用_qiankun_实现微前端_.md)
18. [18. Webpack 如何使用 externals 处理 CDN 资源？](./questions-webpack-supplement/18__18__Webpack_如何使用_externals_处理_CDN_资源_.md)
19. [19. Webpack 如何在 HTML 中引入 CDN？](./questions-webpack-supplement/19__19__Webpack_如何在_HTML_中引入_CDN_.md)
20. [20. Webpack 如何配置 publicPath？](./questions-webpack-supplement/20__20__Webpack_如何配置_publicPath_.md)
21. [21. Webpack 如何使用插件处理 CDN 资源？](./questions-webpack-supplement/21__21__Webpack_如何使用插件处理_CDN_资源_.md)
22. [22. Webpack 如何配置动态 publicPath？](./questions-webpack-supplement/22__22__Webpack_如何配置动态_publicPath_.md)
23. [23. Webpack 如何配置多环境？](./questions-webpack-supplement/23__23__Webpack_如何配置多环境_.md)
24. [24. Webpack 如何配置开发环境？](./questions-webpack-supplement/24__24__Webpack_如何配置开发环境_.md)
25. [25. Webpack 如何配置生产环境？](./questions-webpack-supplement/25__25__Webpack_如何配置生产环境_.md)
26. [26. Webpack 如何配置 package.json 脚本？](./questions-webpack-supplement/26__26__Webpack_如何配置_package.json_脚本_.md)
27. [27. Webpack 如何使用环境变量配置？](./questions-webpack-supplement/27__27__Webpack_如何使用环境变量配置_.md)
28. [28. Webpack 如何配置 CSS Modules？](./questions-webpack-supplement/28__28__Webpack_如何配置_CSS_Modules_.md)
29. [29. Webpack 如何使用 CSS Modules？](./questions-webpack-supplement/29__29__Webpack_如何使用_CSS_Modules_.md)
30. [30. Webpack 如何配置 SCSS Modules？](./questions-webpack-supplement/30__30__Webpack_如何配置_SCSS_Modules_.md)
31. [31. Webpack 如何提取 CSS？](./questions-webpack-supplement/31__31__Webpack_如何提取_CSS_.md)
32. [32. Webpack 如何配置图片优化？](./questions-webpack-supplement/32__32__Webpack_如何配置图片优化_.md)
33. [33. Webpack 如何使用 image-minimizer-webpack-plugin？](./questions-webpack-supplement/33__33__Webpack_如何使用_image-minimizer-webpack-plugin_.md)
34. [34. Webpack 如何配置响应式图片？](./questions-webpack-supplement/34__34__Webpack_如何配置响应式图片_.md)
35. [35. Webpack 如何使用响应式图片？](./questions-webpack-supplement/35__35__Webpack_如何使用响应式图片_.md)
36. [36. Webpack 如何配置字体文件？](./questions-webpack-supplement/36__36__Webpack_如何配置字体文件_.md)
37. [37. Webpack 如何在 CSS 中使用字体？](./questions-webpack-supplement/37__37__Webpack_如何在_CSS_中使用字体_.md)
38. [38. Webpack 如何配置字体子集化？](./questions-webpack-supplement/38__38__Webpack_如何配置字体子集化_.md)
39. [39. Webpack 如何使用 Web Font Loader？](./questions-webpack-supplement/39__39__Webpack_如何使用_Web_Font_Loader_.md)
40. [40. Webpack 如何配置文件系统缓存？](./questions-webpack-supplement/40__40__Webpack_如何配置文件系统缓存_.md)
41. [41. Webpack 如何配置 Babel 缓存？](./questions-webpack-supplement/41__41__Webpack_如何配置_Babel_缓存_.md)
42. [42. Webpack 如何配置缓存加载器？](./questions-webpack-supplement/42__42__Webpack_如何配置缓存加载器_.md)
43. [43. Webpack 如何配置持久化缓存？](./questions-webpack-supplement/43__43__Webpack_如何配置持久化缓存_.md)
44. [44. Webpack 如何清除缓存？](./questions-webpack-supplement/44__44__Webpack_如何清除缓存_.md)

---

## 问题列表


### 1. Webpack 如何配置环境变量？

[查看详细答案](./questions-webpack-supplement/01__1__Webpack_如何配置环境变量_.md)

### 2. Webpack 如何使用环境变量？

[查看详细答案](./questions-webpack-supplement/02__2__Webpack_如何使用环境变量_.md)

### 3. Webpack 如何在代码中使用环境变量？

[查看详细答案](./questions-webpack-supplement/03__3__Webpack_如何在代码中使用环境变量_.md)

### 4. Webpack 如何使用 dotenv？

[查看详细答案](./questions-webpack-supplement/04__4__Webpack_如何使用_dotenv_.md)

### 5. Webpack 如何配置 .env 文件？

[查看详细答案](./questions-webpack-supplement/05__5__Webpack_如何配置_.env_文件_.md)

### 6. Webpack 如何配置多入口？

[查看详细答案](./questions-webpack-supplement/06__6__Webpack_如何配置多入口_.md)

### 7. Webpack 如何配置动态入口？

[查看详细答案](./questions-webpack-supplement/07__7__Webpack_如何配置动态入口_.md)

### 8. Webpack 如何配置多页面应用？

[查看详细答案](./questions-webpack-supplement/08__8__Webpack_如何配置多页面应用_.md)

### 9. Webpack 如何使用插件自动生成 HTML？

[查看详细答案](./questions-webpack-supplement/09__9__Webpack_如何使用插件自动生成_HTML_.md)

### 10. Webpack 如何配置 SSR 服务端？

[查看详细答案](./questions-webpack-supplement/10__10__Webpack_如何配置_SSR_服务端_.md)

### 11. Webpack 如何配置 SSR 客户端？

[查看详细答案](./questions-webpack-supplement/11__11__Webpack_如何配置_SSR_客户端_.md)

### 12. Webpack 如何同时构建客户端和服务端？

[查看详细答案](./questions-webpack-supplement/12__12__Webpack_如何同时构建客户端和服务端_.md)

### 13. Webpack SSR 如何配置服务端入口？

[查看详细答案](./questions-webpack-supplement/13__13__Webpack_SSR_如何配置服务端入口_.md)

### 14. Webpack 如何使用 Module Federation 实现微前端？

[查看详细答案](./questions-webpack-supplement/14__14__Webpack_如何使用_Module_Federation_实现微前端_.md)

### 15. Webpack 如何配置微前端子应用？

[查看详细答案](./questions-webpack-supplement/15__15__Webpack_如何配置微前端子应用_.md)

### 16. Webpack 微前端如何在主应用中使用远程组件？

[查看详细答案](./questions-webpack-supplement/16__16__Webpack_微前端如何在主应用中使用远程组件_.md)

### 17. Webpack 如何使用 qiankun 实现微前端？

[查看详细答案](./questions-webpack-supplement/17__17__Webpack_如何使用_qiankun_实现微前端_.md)

### 18. Webpack 如何使用 externals 处理 CDN 资源？

[查看详细答案](./questions-webpack-supplement/18__18__Webpack_如何使用_externals_处理_CDN_资源_.md)

### 19. Webpack 如何在 HTML 中引入 CDN？

[查看详细答案](./questions-webpack-supplement/19__19__Webpack_如何在_HTML_中引入_CDN_.md)

### 20. Webpack 如何配置 publicPath？

[查看详细答案](./questions-webpack-supplement/20__20__Webpack_如何配置_publicPath_.md)

### 21. Webpack 如何使用插件处理 CDN 资源？

[查看详细答案](./questions-webpack-supplement/21__21__Webpack_如何使用插件处理_CDN_资源_.md)

### 22. Webpack 如何配置动态 publicPath？

[查看详细答案](./questions-webpack-supplement/22__22__Webpack_如何配置动态_publicPath_.md)

### 23. Webpack 如何配置多环境？

[查看详细答案](./questions-webpack-supplement/23__23__Webpack_如何配置多环境_.md)

### 24. Webpack 如何配置开发环境？

[查看详细答案](./questions-webpack-supplement/24__24__Webpack_如何配置开发环境_.md)

### 25. Webpack 如何配置生产环境？

[查看详细答案](./questions-webpack-supplement/25__25__Webpack_如何配置生产环境_.md)

### 26. Webpack 如何配置 package.json 脚本？

[查看详细答案](./questions-webpack-supplement/26__26__Webpack_如何配置_package.json_脚本_.md)

### 27. Webpack 如何使用环境变量配置？

[查看详细答案](./questions-webpack-supplement/27__27__Webpack_如何使用环境变量配置_.md)

### 28. Webpack 如何配置 CSS Modules？

[查看详细答案](./questions-webpack-supplement/28__28__Webpack_如何配置_CSS_Modules_.md)

### 29. Webpack 如何使用 CSS Modules？

[查看详细答案](./questions-webpack-supplement/29__29__Webpack_如何使用_CSS_Modules_.md)

### 30. Webpack 如何配置 SCSS Modules？

[查看详细答案](./questions-webpack-supplement/30__30__Webpack_如何配置_SCSS_Modules_.md)

### 31. Webpack 如何提取 CSS？

[查看详细答案](./questions-webpack-supplement/31__31__Webpack_如何提取_CSS_.md)

### 32. Webpack 如何配置图片优化？

[查看详细答案](./questions-webpack-supplement/32__32__Webpack_如何配置图片优化_.md)

### 33. Webpack 如何使用 image-minimizer-webpack-plugin？

[查看详细答案](./questions-webpack-supplement/33__33__Webpack_如何使用_image-minimizer-webpack-plugin_.md)

### 34. Webpack 如何配置响应式图片？

[查看详细答案](./questions-webpack-supplement/34__34__Webpack_如何配置响应式图片_.md)

### 35. Webpack 如何使用响应式图片？

[查看详细答案](./questions-webpack-supplement/35__35__Webpack_如何使用响应式图片_.md)

### 36. Webpack 如何配置字体文件？

[查看详细答案](./questions-webpack-supplement/36__36__Webpack_如何配置字体文件_.md)

### 37. Webpack 如何在 CSS 中使用字体？

[查看详细答案](./questions-webpack-supplement/37__37__Webpack_如何在_CSS_中使用字体_.md)

### 38. Webpack 如何配置字体子集化？

[查看详细答案](./questions-webpack-supplement/38__38__Webpack_如何配置字体子集化_.md)

### 39. Webpack 如何使用 Web Font Loader？

[查看详细答案](./questions-webpack-supplement/39__39__Webpack_如何使用_Web_Font_Loader_.md)

### 40. Webpack 如何配置文件系统缓存？

[查看详细答案](./questions-webpack-supplement/40__40__Webpack_如何配置文件系统缓存_.md)

### 41. Webpack 如何配置 Babel 缓存？

[查看详细答案](./questions-webpack-supplement/41__41__Webpack_如何配置_Babel_缓存_.md)

### 42. Webpack 如何配置缓存加载器？

[查看详细答案](./questions-webpack-supplement/42__42__Webpack_如何配置缓存加载器_.md)

### 43. Webpack 如何配置持久化缓存？

[查看详细答案](./questions-webpack-supplement/43__43__Webpack_如何配置持久化缓存_.md)

### 44. Webpack 如何清除缓存？

[查看详细答案](./questions-webpack-supplement/44__44__Webpack_如何清除缓存_.md)
