## 4. Vite 的配置文件有哪些？如何配置？

**答案：**

### Vite 配置文件

Vite 支持多种配置文件格式：

1. **vite.config.js**
2. **vite.config.ts**
3. **vite.config.mjs**

### 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  // 插件
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      components: path.resolve(__dirname, 'src/components')
    }
  },

  // 开发服务器
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },

  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0')
  }
});
```

### 详细配置

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    // 基础路径
    base: '/',

    // 插件
    plugins: [
      vue(),
      // 其他插件
    ],

    // 路径解析
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils')
      }
    },

    // 开发服务器
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: true,
      strictPort: false,
      https: false,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          }
        }
      },
      hmr: {
        overlay: true
      }
    },

    // 预览服务器
    preview: {
      port: 4000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },

    // 依赖优化
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
      exclude: ['your-dep'],
      esbuildOptions: {
        target: 'es2020'
      }
    },

    // 构建配置
    build: {
      target: 'modules',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html')
        },
        output: {
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            utils: ['lodash', 'axios']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true
      }
    },

    // CSS 配置
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        },
        less: {
          modifyVars: {
            'primary-color': '#1890ff'
          }
        }
      },
      devSourcemap: true
    },

    // JSON 配置
    json: {
      namedExports: true,
      stringify: true
    },

    // 全局变量
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    },

    // 环境变量前缀
    envPrefix: 'VITE_',

    // Worker 配置
    worker: {
      format: 'es',
      plugins: [],
      rollupOptions: {}
    },

    // 实验性功能
    experimental: {
      renderBuiltUrl: (filename, { hostId, hostType, type }) => {
        return `https://cdn.example.com/${filename}`;
      }
    }
  };
});
```

### 环境变量

```javascript
// .env
VITE_APP_TITLE=My App

// .env.development
VITE_API_BASE_URL=http://localhost:8080

// .env.production
VITE_API_BASE_URL=https://api.example.com

// 使用
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---