## 5. 什么是代码分割（Code Splitting）？如何实现？

**答案：**

### 代码分割简介

代码分割是将代码拆分成多个小块，按需加载，从而减少初始加载时间，提高性能。

### 代码分割的方式

#### 1. 入口起点（Entry Points）

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    vendor: './src/vendor.js'
  }
};

// 生成 app.js 和 vendor.js
```

#### 2. 动态导入（Dynamic Import）

```javascript
// 普通导入（同步）
import { add } from './utils';

// 动态导入（异步）
import('./utils').then(utils => {
  console.log(utils.add(1, 2));
});

// 使用 async/await
async function loadUtils() {
  const utils = await import('./utils');
  console.log(utils.add(1, 2));
}
```

#### 3. SplitChunksPlugin

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',  // 对所有模块进行分割
      minSize: 30000,  // 最小 30KB
      maxSize: 0,  // 无最大限制
      minChunks: 1,  // 最少被引用 1 次
      maxAsyncRequests: 5,  // 最大异步请求数
      maxInitialRequests: 3,  // 最大初始请求数
      automaticNameDelimiter: '~',  // 名称分隔符
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,  // 优先级
          name: 'vendors'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 代码分割示例

#### 1. 路由懒加载

```javascript
// React Router
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

#### 2. 组件懒加载

```javascript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### 3. 条件加载

```javascript
// 根据条件加载模块
async function loadFeature() {
  if (isMobile) {
    const MobileFeature = await import('./MobileFeature');
    MobileFeature.init();
  } else {
    const DesktopFeature = await import('./DesktopFeature');
    DesktopFeature.init();
  }
}
```

### 代码分割优化

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取 React 和 Vue
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all'
        },
        // 提取 Vue
        vue: {
          test: /[\\/]node_modules[\\/](vue|vue-router|vuex)[\\/]/,
          name: 'vue',
          chunks: 'all'
        },
        // 提取第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        // 提取公共代码
        common: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### 代码分割的好处

1. **减少初始加载时间**
   - 只加载必要的代码
   - 按需加载其他代码

2. **提高缓存利用率**
   - 第三方库单独打包，不易变化
   - 业务代码单独打包，频繁更新

3. **提高性能**
   - 减少网络请求
   - 提高加载速度

### 预加载和预取

```javascript
// 预加载（Preload）
// 在当前页面加载完成后立即加载
import(
  /* webpackChunkName: "heavy" */
  /* webpackPreload: true */
  './HeavyComponent'
);

// 预取（Prefetch）
// 在浏览器空闲时加载
import(
  /* webpackChunkName: "heavy" */
  /* webpackPrefetch: true */
  './HeavyComponent'
);
```

---