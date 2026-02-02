## 3. Vite 的热更新（HMR）是如何工作的？

**答案：**

### Vite HMR 简介

Vite 的热更新基于原生 ES Modules 和 WebSocket，实现了极快的热更新速度。

### HMR 工作原理

```
1. 文件变化
   ├── Vite 监听文件变化
   └── 重新编译变化的模块

2. 生成更新
   ├── 生成新的模块代码
   └── 生成 HMR 更新消息

3. 通过 WebSocket 发送更新
   ├── 发送更新通知
   └── 发送更新内容

4. 浏览器接收更新
   ├── 接收 HMR 通知
   └── 请求更新的模块

5. 替换模块
   ├── 使用新的模块替换旧模块
   └── 执行模块的 HMR 代码

6. 更新界面
   ├── 更新 DOM
   └── 保留应用状态
```

### HMR API

```javascript
// 检测模块是否支持 HMR
if (import.meta.hot) {
  // 接受当前模块的更新
  import.meta.hot.accept();

  // 接受依赖模块的更新
  import.meta.hot.accept('./dependency', (newDependency) => {
    // 依赖模块更新后的回调
    console.log('Dependency updated', newDependency);
  });

  // 处理更新错误
  import.meta.hot.dispose(() => {
    // 清理工作
    console.log('Module disposed');
  });

  // 削减模块
  import.meta.hot.prune(() => {
    // 清理工作
  });
}
```

### Vue HMR

```javascript
// Vue 组件自动支持 HMR
// 无需手动配置
```

### React HMR

```javascript
// 安装：npm install @vitejs/plugin-react-fast-refresh
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-fast-refresh';

export default defineConfig({
  plugins: [react()]
});
```

### HMR 配置

```javascript
// vite.config.js
export default {
  server: {
    hmr: {
      overlay: true,  // 显示错误覆盖层
      protocol: 'ws',  // WebSocket 协议
      host: 'localhost',  // WebSocket 主机
      port: 24678  // WebSocket 端口
    }
  }
};
```

### HMR 注意事项

1. **CSS HMR**
   - CSS 自动支持 HMR
   - 无需手动配置

2. **生产环境不启用 HMR**
   - HMR 只在开发环境启用
   - 生产环境不适用

3. **HMR 失败**
   - 如果 HMR 失败，会自动刷新页面
   - 可以通过 `hmr.overlay` 配置错误覆盖层

---