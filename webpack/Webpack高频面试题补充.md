# Webpack 高频面试题补充

## 1. Webpack 如何配置环境变量？

**答案：**

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
  console.log('NODE_ENV:', env.NODE_ENV);  // 从命令行获取

  return {
    mode: env.NODE_ENV || 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        'process.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:8080')
      })
    ]
  };
};
```

---

## 2. Webpack 如何使用环境变量？

**答案：**

```javascript
// package.json
{
  "scripts": {
    "build": "webpack --env NODE_ENV=production",
    "build:dev": "webpack --env NODE_ENV=development",
    "build:staging": "webpack --env NODE_ENV=staging --env API_URL=https://staging-api.example.com"
  }
}
```

---

## 3. Webpack 如何在代码中使用环境变量？

**答案：**

```javascript
// 使用 DefinePlugin 定义的环境变量
if (process.env.NODE_ENV === 'production') {
  console.log('Production mode');
}

const apiUrl = process.env.API_URL;
```

---

## 4. Webpack 如何使用 dotenv？

**答案：**

```javascript
// 安装
npm install dotenv-webpack -D

// webpack.config.js
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv({
      path: './.env.production',
      safe: true,
      systemvars: true
    })
  ]
};
```

---

## 5. Webpack 如何配置 .env 文件？

**答案：**

```bash
# .env.development
API_URL=http://localhost:8080
DEBUG=true

# .env.production
API_URL=https://api.example.com
DEBUG=false
```

---

## 6. Webpack 如何配置多入口？

**答案：**

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    main: './src/main.js',
    admin: './src/admin.js',
    vendor: './src/vendor.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true
  }
};
```

---

## 7. Webpack 如何配置动态入口？

**答案：**

```javascript
// webpack.config.js
const glob = require('glob');

const entries = glob.sync('./src/pages/**/*.js').reduce((acc, file) => {
  const name = file.replace('./src/pages/', '').replace('.js', '');
  acc[name] = file;
  return acc;
}, {});

module.exports = {
  entry: entries
};
```

---

## 8. Webpack 如何配置多页面应用？

**答案：**

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    index: './src/index.js',
    about: './src/about.js',
    contact: './src/contact.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      chunks: ['about']
    }),
    new HtmlWebpackPlugin({
      template: './src/contact.html',
      filename: 'contact.html',
      chunks: ['contact']
    })
  ]
};
```

---

## 9. Webpack 如何使用插件自动生成 HTML？

**答案：**

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');

const pages = glob.sync('./src/pages/**/*.html');

const htmlPlugins = pages.map(page => {
  const name = page.replace('./src/pages/', '').replace('.html', '');
  return new HtmlWebpackPlugin({
    template: page,
    filename: `${name}.html`,
    chunks: [name]
  });
});

module.exports = {
  plugins: [...htmlPlugins]
};
```

---

## 10. Webpack 如何配置 SSR 服务端？

**答案：**

```javascript
// webpack.server.config.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  entry: './src/server.js',
  output: {
    path: path.resolve(__dirname, 'dist/server'),
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

---

## 11. Webpack 如何配置 SSR 客户端？

**答案：**

```javascript
// webpack.client.config.js
const path = require('path');

module.exports = {
  target: 'web',
  entry: './src/client.js',
  output: {
    path: path.resolve(__dirname, 'dist/client'),
    filename: 'client.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

---

## 12. Webpack 如何同时构建客户端和服务端？

**答案：**

```javascript
// webpack.config.js
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.config.js');
const serverConfig = require('./webpack.server.config.js');
const clientConfig = require('./webpack.client.config.js');

module.exports = [
  merge(baseConfig, serverConfig),
  merge(baseConfig, clientConfig)
];
```

---

## 13. Webpack SSR 如何配置服务端入口？

**答案：**

```javascript
// src/server.js
import express from 'express';
import { renderToString } from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const appHtml = renderToString(<App />);
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR App</title>
      </head>
      <body>
        <div id="app">${appHtml}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000);
```

---

## 14. Webpack 如何使用 Module Federation 实现微前端？

**答案：**

```javascript
// 主应用 webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    })
  ]
};
```

---

## 15. Webpack 如何配置微前端子应用？

**答案：**

```javascript
// 子应用 webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button',
        './Card': './src/Card'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

---

## 16. Webpack 微前端如何在主应用中使用远程组件？

**答案：**

```javascript
// 主应用中使用远程组件
import React, { lazy, Suspense } from 'react';

const RemoteButton = lazy(() => import('app1/Button'));
const RemoteCard = lazy(() => import('app2/Card'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RemoteButton />
      <RemoteCard />
    </Suspense>
  );
}
```

---

## 17. Webpack 如何使用 qiankun 实现微前端？

**答案：**

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:3001',
    container: '#subapp-viewport',
    activeRule: '/app1'
  },
  {
    name: 'app2',
    entry: '//localhost:3002',
    container: '#subapp-viewport',
    activeRule: '/app2'
  }
]);

start();
```

---

## 18. Webpack 如何使用 externals 处理 CDN 资源？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    lodash: '_',
    axios: 'axios'
  }
};
```

---

## 19. Webpack 如何在 HTML 中引入 CDN？

**答案：**

```html
<!-- index.html -->
<script src="https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
```

---

## 20. Webpack 如何配置 publicPath？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/assets/'
  }
};
```

---

## 21. Webpack 如何使用插件处理 CDN 资源？

**答案：**

```javascript
// webpack.config.js
const CdnPlugin = require('webpack-cdn-plugin');

module.exports = {
  plugins: [
    new CdnPlugin({
      modules: [
        {
          name: 'react',
          var: 'React',
          path: 'umd/react.production.min.js',
          url: 'https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js'
        },
        {
          name: 'react-dom',
          var: 'ReactDOM',
          path: 'umd/react-dom.production.min.js',
          url: 'https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js'
        }
      ]
    })
  ]
};
```

---

## 22. Webpack 如何配置动态 publicPath？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  output: {
    publicPath: process.env.NODE_ENV === 'production'
      ? 'https://cdn.example.com/'
      : '/'
  }
};
```

---

## 23. Webpack 如何配置多环境？

**答案：**

```javascript
// webpack.common.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

---

## 24. Webpack 如何配置开发环境？

**答案：**

```javascript
// webpack.dev.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  }
});
```

---

## 25. Webpack 如何配置生产环境？

**答案：**

```javascript
// webpack.prod.js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
});
```

---

## 26. Webpack 如何配置 package.json 脚本？

**答案：**

```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "build:staging": "webpack --config webpack.staging.js"
  }
}
```

---

## 27. Webpack 如何使用环境变量配置？

**答案：**

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = (env) => {
  const isProduction = env.NODE_ENV === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV)
      })
    ]
  };
};
```

---

## 28. Webpack 如何配置 CSS Modules？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
                exportLocalsConvention: 'camelCase'
              }
            }
          }
        ]
      }
    ]
  }
};
```

---

## 29. Webpack 如何使用 CSS Modules？

**答案：**

```javascript
// App.js
import styles from './App.css';

function App() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hello World</h1>
    </div>
  );
}
```

---

## 30. Webpack 如何配置 SCSS Modules？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          },
          'sass-loader'
        ]
      }
    ]
  }
};
```

---

## 31. Webpack 如何提取 CSS？

**答案：**

```javascript
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ]
};
```

---

## 32. Webpack 如何配置图片优化？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // 小于 8KB 转为 base64
          }
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        }
      }
    ]
  }
};
```

---

## 33. Webpack 如何使用 image-minimizer-webpack-plugin？

**答案：**

```javascript
// 安装
npm install image-minimizer-webpack-plugin imagemin -D

// webpack.config.js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
        type: 'asset',
        use: [
          {
            loader: ImageMinimizerPlugin.loader,
            options: {
              minimizer: {
                implementation: ImageMinimizerPlugin.imageminMinify,
                options: {
                  plugins: [
                    ['gifsicle', { interlaced: true }],
                    ['jpegtran', { progressive: true }],
                    ['optipng', { optimizationLevel: 5 }],
                    [
                      'svgo',
                      {
                        plugins: [
                          {
                            name: 'preset-default',
                            params: {
                              overrides: {
                                removeViewBox: false
                              }
                            }
                          }
                        ]
                      }
                    ]
                  ]
                }
              }
            }
          }
        ]
      }
    ]
  }
};
```

---

## 34. Webpack 如何配置响应式图片？

**答案：**

```javascript
// 使用 responsive-loader
// 安装
npm install responsive-loader sharp -D

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: require('responsive-loader/sharp'),
              sizes: [300, 600, 1200],
              placeholder: true,
              placeholderSize: 50
            }
          }
        ]
      }
    ]
  }
};
```

---

## 35. Webpack 如何使用响应式图片？

**答案：**

```javascript
import src from './image.png?sizes[]=300,sizes[]=600,sizes[]=1200';

function Image() {
  return (
    <img
      srcSet={`${src.srcSet}`}
      src={src.src}
      alt="Responsive Image"
    />
  );
}
```

---

## 36. Webpack 如何配置字体文件？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
};
```

---

## 37. Webpack 如何在 CSS 中使用字体？

**答案：**

```css
/* styles.css */
@font-face {
  font-family: 'MyFont';
  src: url('./fonts/myfont.woff2') format('woff2'),
       url('./fonts/myfont.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: 'MyFont', sans-serif;
}
```

---

## 38. Webpack 如何配置字体子集化？

**答案：**

```javascript
// 使用 fontmin-webpack-plugin
// 安装
npm install fontmin-webpack-plugin -D

// webpack.config.js
const FontminPlugin = require('fontmin-webpack-plugin');

module.exports = {
  plugins: [
    new FontminPlugin({
      text: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      glyphs: ['你', '好', '世', '界']
    })
  ]
};
```

---

## 39. Webpack 如何使用 Web Font Loader？

**答案：**

```javascript
// 使用 webfontloader
// 安装
npm install webfontloader

// 在入口文件中
import WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: ['Roboto:400,700']
  },
  custom: {
    families: ['MyFont'],
    urls: ['/fonts/myfont.css']
  }
});
```

---

## 40. Webpack 如何配置文件系统缓存？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

---

## 41. Webpack 如何配置 Babel 缓存？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  }
};
```

---

## 42. Webpack 如何配置缓存加载器？

**答案：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'cache-loader',
        options: {
          cacheDirectory: path.resolve(__dirname, '.cache-loader')
        }
      }
    ]
  }
};
```

---

## 43. Webpack 如何配置持久化缓存？

**答案：**

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 天
    compression: 'gzip',
    hashAlgorithm: 'md4',
    idleTimeout: 60000,
    idleTimeoutForInitialStore: 5000
  }
};
```

---

## 44. Webpack 如何清除缓存？

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