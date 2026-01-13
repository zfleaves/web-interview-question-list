# 面试题集锦文档系统

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录中，包含所有面试题文档。

### 预览生产构建

```bash
npm run preview
```

访问 http://localhost:4173

## 手机端访问

### 方法一：本地网络访问

1. 确保手机和电脑在同一 Wi-Fi 网络
2. 运行预览服务器并暴露到网络：
   ```bash
   npm run preview -- --host
   ```
3. 查看终端显示的网络地址（如 http://192.168.x.x:4173）
4. 在手机浏览器中输入该地址访问

### 方法二：部署到服务器

将 `dist` 目录部署到任何静态文件服务器：

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Vercel 部署：**
```bash
npm install -g vercel
vercel
```

**GitHub Pages 部署：**
```bash
# 将 dist 目录推送到 gh-pages 分支
git subtree push --prefix dist origin gh-pages
```

### 方法三：使用本地服务器

使用 Python 快速启动本地服务器：
```bash
# Python 3
cd dist
python -m http.server 8000

# Python 2
cd dist
python -m SimpleHTTPServer 8000
```

然后在手机浏览器访问：`http://电脑IP:8000`

## 目录结构

```
.
├── index.html              # 主入口文件
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
├── react/                  # React 面试题
│   └── React面试题集锦.md  (24+题)
├── vue2/                   # Vue2 面试题
│   └── Vue2面试题集锦.md  (14题)
├── vue3/                   # Vue3 面试题
│   ├── Vue3面试题集锦.md  (11题)
│   └── Vue3高频面试题补充.md (10题)
├── javascript/             # JavaScript 面试题
│   └── JavaScript面试题集锦.md (20题)
├── typescript/             # TypeScript 面试题
│   └── TypeScript面试题集锦.md (7题)
├── css/                    # CSS 面试题
│   └── CSS面试题集锦.md   (8题)
├── html/                   # HTML 面试题
│   └── HTML面试题集锦.md  (6题)
├── es6/                    # ES6 面试题
│   └── ES6面试题集锦.md   (20题)
├── http/                   # HTTP 面试题
│   └── HTTP面试题集锦.md  (20题)
├── webpack/                # Webpack 面试题
│   ├── Webpack面试题集锦.md (10题)
│   └── Webpack高频面试题补充.md (10题)
├── vite/                   # Vite 面试题
│   ├── Vite面试题集锦.md  (10题)
│   └── Vite高频面试题补充.md (10题)
├── git/                    # Git 面试题
│   └── Git面试题集锦.md   (8题)
├── node/                   # Node.js 面试题
│   └── Node.js面试题集锦.md (10题)
├── design-patterns/        # 设计模式面试题
│   └── 设计模式面试题集锦.md (10题)
├── miniprogram/            # 小程序面试题
│   └── 小程序面试题集锦.md (15题)
├── scenarios/              # 高频场景题
│   ├── 高频场景题集锦.md  (10题)
│   ├── 前端性能优化高频面试题补充.md (10题)
│   └── 前端工程化高频面试题补充.md (10题)
├── algorithm/              # 算法面试题
│   └── 算法面试题集锦.md  (10题)
└── big-company/            # 大厂面试题
    ├── 腾讯面试题集锦.md  (8题)
    ├── 拼多多面试题集锦.md (8题)
    ├── 百度面试题集锦.md  (8题)
    ├── 京东面试题集锦.md  (5题)
    ├── 字节面试题集锦.md  (8题)
    ├── 知乎面试题集锦.md  (8题)
    ├── 阿里面试题集锦.md  (14题)
    └── 富途面试题集锦.md  (14题)
```

## 文档分类

### 前端框架
- **React** (24+题) - React 核心原理、Hooks、性能优化等
- **Vue2** (14题) - Vue2 双向绑定、生命周期、组件通信等
- **Vue3** (21题) - Vue3 新特性、Composition API、响应式原理等

### 基础技术
- **JavaScript** (20题) - 原型链、闭包、事件循环、ES6+ 等
- **CSS** (8题) - 盒模型、布局、动画、预处理器等
- **HTML** (6题) - 语义化、SEO、表单、多媒体等
- **TypeScript** (7题) - 类型系统、泛型、装饰器、高级类型等
- **ES6** (20题) - let/const、箭头函数、Promise、Module 等

### 网络与工程化
- **HTTP** (20题) - HTTP/HTTPS、缓存、跨域、WebSocket 等
- **前端性能优化** (10题) - 加载优化、渲染优化、代码优化等
- **Webpack** (20题) - 构建流程、Loader、Plugin、优化等
- **Vite** (20题) - 原理、配置、插件、性能等
- **前端工程化** (10题) - 模块化、自动化、CI/CD、监控等

### 大厂面试
- **腾讯** (8题) - 腾讯前端面试真题
- **拼多多** (8题) - 拼多多前端面试真题
- **百度** (8题) - 百度前端面试真题
- **京东** (5题) - 京东前端面试真题
- **字节** (8题) - 字节前端面试真题
- **知乎** (8题) - 知乎前端面试真题
- **阿里** (14题) - 阿里前端面试真题
- **富途** (14题) - 富途前端面试真题

### 进阶技术
- **Git** (8题) - 分支管理、合并、冲突解决、工作流等
- **Node.js** (10题) - 事件循环、流、Buffer、模块系统等
- **设计模式** (10题) - 常用设计模式及其在前端中的应用
- **小程序** (15题) - 微信小程序、uniapp 等开发技术
- **高频场景题** (10题) - 实际开发中的常见问题与解决方案
- **算法** (10题) - 前端常用算法与数据结构

## 功能特性

- 📚 **多技术栈面试题文档** - 覆盖前端全栈技术，从基础到进阶
- 🔍 **实时搜索功能** - 支持全文搜索，快速定位知识点
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **GitHub 风格 Markdown 渲染** - 优雅的代码高亮和排版
- 📁 **支持本地文件上传预览** - 可预览本地 Markdown 文件
- 📑 **题目导航** - 支持按题目快速跳转，提升阅读效率
- 🗂️ **分类折叠** - 支持分类折叠/展开，方便管理
- ⌨️ **快捷键支持** - Ctrl/Cmd + K 搜索，Esc 关闭菜单
- 🌐 **支持手机端访问** - 移动端优化，随时随地学习
- 📦 **完整的打包部署方案** - 支持多种部署方式
- 🔐 **代码块复制** - 一键复制代码块内容
- 🎯 **搜索结果高亮** - 搜索关键词高亮显示
- 📊 **题目数量统计** - 每个文档显示题目数量

## 技术栈

- Vite - 构建工具
- Marked - Markdown 解析
- Highlight.js - 代码高亮
- 纯 HTML/CSS/JavaScript - 无框架依赖