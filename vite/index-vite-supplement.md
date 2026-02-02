# Vite 高频面试题补充（截止 2025 年底）

## 目录

1. [1. Vite 如何配置环境变量文件？](./questions-vite-supplement/01__1__Vite_如何配置环境变量文件_.md)
2. [2. Vite 如何在代码中使用环境变量？](./questions-vite-supplement/02__2__Vite_如何在代码中使用环境变量_.md)
3. [3. Vite 如何配置环境变量？](./questions-vite-supplement/03__3__Vite_如何配置环境变量_.md)
4. [4. Vite 环境变量有哪些注意事项？](./questions-vite-supplement/04__4__Vite_环境变量有哪些注意事项_.md)
5. [5. Vite 依赖预构建是如何工作的？](./questions-vite-supplement/05__5__Vite_依赖预构建是如何工作的_.md)
6. [6. Vite 如何配置依赖预构建？](./questions-vite-supplement/06__6__Vite_如何配置依赖预构建_.md)
7. [7. Vite 依赖预构建的缓存机制是什么？](./questions-vite-supplement/07__7__Vite_依赖预构建的缓存机制是什么_.md)
8. [8. Vite 如何配置多页面应用（MPA）？](./questions-vite-supplement/08__8__Vite_如何配置多页面应用_MPA__.md)
9. [9. Vite 多页面应用的项目结构是什么？](./questions-vite-supplement/09__9__Vite_多页面应用的项目结构是什么_.md)
10. [10. Vite 多页面应用如何配置 HTML 文件？](./questions-vite-supplement/10__10__Vite_多页面应用如何配置_HTML_文件_.md)
11. [11. Vite 如何使用插件实现多页面应用？](./questions-vite-supplement/11__11__Vite_如何使用插件实现多页面应用_.md)
12. [12. Vite 如何配置 SSR（服务端渲染）？](./questions-vite-supplement/12__12__Vite_如何配置_SSR_服务端渲染__.md)
13. [13. Vite SSR 如何配置服务端入口？](./questions-vite-supplement/13__13__Vite_SSR_如何配置服务端入口_.md)
14. [14. Vite SSR 如何配置客户端入口？](./questions-vite-supplement/14__14__Vite_SSR_如何配置客户端入口_.md)
15. [15. Vite SSR 如何配置 Express 服务器？](./questions-vite-supplement/15__15__Vite_SSR_如何配置_Express_服务器_.md)
16. [16. Vite 如何配置库模式（Library Mode）？](./questions-vite-supplement/16__16__Vite_如何配置库模式_Library_Mode__.md)
17. [17. Vite 库模式如何配置入口文件？](./questions-vite-supplement/17__17__Vite_库模式如何配置入口文件_.md)
18. [18. Vite 库模式如何配置 package.json？](./questions-vite-supplement/18__18__Vite_库模式如何配置_package.json_.md)
19. [19. Vite 库模式如何构建？](./questions-vite-supplement/19__19__Vite_库模式如何构建_.md)
20. [20. Vite 如何配置 CSS Modules？](./questions-vite-supplement/20__20__Vite_如何配置_CSS_Modules_.md)
21. [21. Vite 如何使用 CSS Modules？](./questions-vite-supplement/21__21__Vite_如何使用_CSS_Modules_.md)
22. [22. Vite CSS Modules 如何使用动态类名？](./questions-vite-supplement/22__22__Vite_CSS_Modules_如何使用动态类名_.md)
23. [23. Vite CSS Modules 如何支持 TypeScript？](./questions-vite-supplement/23__23__Vite_CSS_Modules_如何支持_TypeScript_.md)
24. [24. Vite 如何导入 SVG？](./questions-vite-supplement/24__24__Vite_如何导入_SVG_.md)
25. [25. Vite 如何使用 vite-plugin-svgr 处理 SVG？](./questions-vite-supplement/25__25__Vite_如何使用_vite-plugin-svgr_处理_SVG_.md)
26. [26. Vite 如何在 React 中使用 SVG？](./questions-vite-supplement/26__26__Vite_如何在_React_中使用_SVG_.md)
27. [27. Vite 如何在 Vue 中使用 SVG？](./questions-vite-supplement/27__27__Vite_如何在_Vue_中使用_SVG_.md)
28. [28. Vite 如何在主线程中使用 Worker？](./questions-vite-supplement/28__28__Vite_如何在主线程中使用_Worker_.md)
29. [29. Vite 如何配置 Worker 文件？](./questions-vite-supplement/29__29__Vite_如何配置_Worker_文件_.md)
30. [30. Vite 如何配置 Worker？](./questions-vite-supplement/30__30__Vite_如何配置_Worker_.md)
31. [31. Vite 如何使用 Composable 封装 Worker？](./questions-vite-supplement/31__31__Vite_如何使用_Composable_封装_Worker_.md)
32. [32. Vite 如何使用 vite-plugin-imp 实现按需导入？](./questions-vite-supplement/32__32__Vite_如何使用_vite-plugin-imp_实现按需导入_.md)
33. [33. Vite 如何使用 unplugin-vue-components 实现按需导入？](./questions-vite-supplement/33__33__Vite_如何使用_unplugin-vue-components_实现按需导入_.md)
34. [34. Vite 如何使用 unplugin-auto-import 实现按需导入？](./questions-vite-supplement/34__34__Vite_如何使用_unplugin-auto-import_实现按需导入_.md)
35. [35. Vite 按需导入如何使用？](./questions-vite-supplement/35__35__Vite_按需导入如何使用_.md)
36. [36. Vite 如何使用 rollup-plugin-visualizer 进行构建分析？](./questions-vite-supplement/36__36__Vite_如何使用_rollup-plugin-visualizer_进行构建分析_.md)
37. [37. Vite 如何使用 vite-plugin-inspect 进行构建分析？](./questions-vite-supplement/37__37__Vite_如何使用_vite-plugin-inspect_进行构建分析_.md)
38. [38. Vite 构建分析如何使用？](./questions-vite-supplement/38__38__Vite_构建分析如何使用_.md)
39. [39. Vite 如何自定义构建分析配置？](./questions-vite-supplement/39__39__Vite_如何自定义构建分析配置_.md)

---

## 问题列表


### 1. Vite 如何配置环境变量文件？

[查看详细答案](./questions-vite-supplement/01__1__Vite_如何配置环境变量文件_.md)

### 2. Vite 如何在代码中使用环境变量？

[查看详细答案](./questions-vite-supplement/02__2__Vite_如何在代码中使用环境变量_.md)

### 3. Vite 如何配置环境变量？

[查看详细答案](./questions-vite-supplement/03__3__Vite_如何配置环境变量_.md)

### 4. Vite 环境变量有哪些注意事项？

[查看详细答案](./questions-vite-supplement/04__4__Vite_环境变量有哪些注意事项_.md)

### 5. Vite 依赖预构建是如何工作的？

[查看详细答案](./questions-vite-supplement/05__5__Vite_依赖预构建是如何工作的_.md)

### 6. Vite 如何配置依赖预构建？

[查看详细答案](./questions-vite-supplement/06__6__Vite_如何配置依赖预构建_.md)

### 7. Vite 依赖预构建的缓存机制是什么？

[查看详细答案](./questions-vite-supplement/07__7__Vite_依赖预构建的缓存机制是什么_.md)

### 8. Vite 如何配置多页面应用（MPA）？

[查看详细答案](./questions-vite-supplement/08__8__Vite_如何配置多页面应用_MPA__.md)

### 9. Vite 多页面应用的项目结构是什么？

[查看详细答案](./questions-vite-supplement/09__9__Vite_多页面应用的项目结构是什么_.md)

### 10. Vite 多页面应用如何配置 HTML 文件？

[查看详细答案](./questions-vite-supplement/10__10__Vite_多页面应用如何配置_HTML_文件_.md)

### 11. Vite 如何使用插件实现多页面应用？

[查看详细答案](./questions-vite-supplement/11__11__Vite_如何使用插件实现多页面应用_.md)

### 12. Vite 如何配置 SSR（服务端渲染）？

[查看详细答案](./questions-vite-supplement/12__12__Vite_如何配置_SSR_服务端渲染__.md)

### 13. Vite SSR 如何配置服务端入口？

[查看详细答案](./questions-vite-supplement/13__13__Vite_SSR_如何配置服务端入口_.md)

### 14. Vite SSR 如何配置客户端入口？

[查看详细答案](./questions-vite-supplement/14__14__Vite_SSR_如何配置客户端入口_.md)

### 15. Vite SSR 如何配置 Express 服务器？

[查看详细答案](./questions-vite-supplement/15__15__Vite_SSR_如何配置_Express_服务器_.md)

### 16. Vite 如何配置库模式（Library Mode）？

[查看详细答案](./questions-vite-supplement/16__16__Vite_如何配置库模式_Library_Mode__.md)

### 17. Vite 库模式如何配置入口文件？

[查看详细答案](./questions-vite-supplement/17__17__Vite_库模式如何配置入口文件_.md)

### 18. Vite 库模式如何配置 package.json？

[查看详细答案](./questions-vite-supplement/18__18__Vite_库模式如何配置_package.json_.md)

### 19. Vite 库模式如何构建？

[查看详细答案](./questions-vite-supplement/19__19__Vite_库模式如何构建_.md)

### 20. Vite 如何配置 CSS Modules？

[查看详细答案](./questions-vite-supplement/20__20__Vite_如何配置_CSS_Modules_.md)

### 21. Vite 如何使用 CSS Modules？

[查看详细答案](./questions-vite-supplement/21__21__Vite_如何使用_CSS_Modules_.md)

### 22. Vite CSS Modules 如何使用动态类名？

[查看详细答案](./questions-vite-supplement/22__22__Vite_CSS_Modules_如何使用动态类名_.md)

### 23. Vite CSS Modules 如何支持 TypeScript？

[查看详细答案](./questions-vite-supplement/23__23__Vite_CSS_Modules_如何支持_TypeScript_.md)

### 24. Vite 如何导入 SVG？

[查看详细答案](./questions-vite-supplement/24__24__Vite_如何导入_SVG_.md)

### 25. Vite 如何使用 vite-plugin-svgr 处理 SVG？

[查看详细答案](./questions-vite-supplement/25__25__Vite_如何使用_vite-plugin-svgr_处理_SVG_.md)

### 26. Vite 如何在 React 中使用 SVG？

[查看详细答案](./questions-vite-supplement/26__26__Vite_如何在_React_中使用_SVG_.md)

### 27. Vite 如何在 Vue 中使用 SVG？

[查看详细答案](./questions-vite-supplement/27__27__Vite_如何在_Vue_中使用_SVG_.md)

### 28. Vite 如何在主线程中使用 Worker？

[查看详细答案](./questions-vite-supplement/28__28__Vite_如何在主线程中使用_Worker_.md)

### 29. Vite 如何配置 Worker 文件？

[查看详细答案](./questions-vite-supplement/29__29__Vite_如何配置_Worker_文件_.md)

### 30. Vite 如何配置 Worker？

[查看详细答案](./questions-vite-supplement/30__30__Vite_如何配置_Worker_.md)

### 31. Vite 如何使用 Composable 封装 Worker？

[查看详细答案](./questions-vite-supplement/31__31__Vite_如何使用_Composable_封装_Worker_.md)

### 32. Vite 如何使用 vite-plugin-imp 实现按需导入？

[查看详细答案](./questions-vite-supplement/32__32__Vite_如何使用_vite-plugin-imp_实现按需导入_.md)

### 33. Vite 如何使用 unplugin-vue-components 实现按需导入？

[查看详细答案](./questions-vite-supplement/33__33__Vite_如何使用_unplugin-vue-components_实现按需导入_.md)

### 34. Vite 如何使用 unplugin-auto-import 实现按需导入？

[查看详细答案](./questions-vite-supplement/34__34__Vite_如何使用_unplugin-auto-import_实现按需导入_.md)

### 35. Vite 按需导入如何使用？

[查看详细答案](./questions-vite-supplement/35__35__Vite_按需导入如何使用_.md)

### 36. Vite 如何使用 rollup-plugin-visualizer 进行构建分析？

[查看详细答案](./questions-vite-supplement/36__36__Vite_如何使用_rollup-plugin-visualizer_进行构建分析_.md)

### 37. Vite 如何使用 vite-plugin-inspect 进行构建分析？

[查看详细答案](./questions-vite-supplement/37__37__Vite_如何使用_vite-plugin-inspect_进行构建分析_.md)

### 38. Vite 构建分析如何使用？

[查看详细答案](./questions-vite-supplement/38__38__Vite_构建分析如何使用_.md)

### 39. Vite 如何自定义构建分析配置？

[查看详细答案](./questions-vite-supplement/39__39__Vite_如何自定义构建分析配置_.md)
