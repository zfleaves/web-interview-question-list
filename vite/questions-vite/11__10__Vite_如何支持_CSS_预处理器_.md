## 10. Vite 如何支持 CSS 预处理器？

**答案：**

### CSS 预处理器支持

Vite 支持多种 CSS 预处理器，包括 SCSS、SASS、LESS、Stylus 等。

### 安装依赖

```bash
# SCSS/SASS
npm install -D sass

# LESS
npm install -D less

# Stylus
npm install -D stylus
```

### 配置

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
        api: 'modern-compiler'
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      },
      stylus: {
        additionalData: `@import "@/styles/variables.styl"`
      }
    }
  }
};
```

### 使用

```vue
<!-- App.vue -->
<style lang="scss">
.container {
  color: $primary-color;
}
</style>
```

### CSS Modules

```vue
<!-- App.vue -->
<template>
  <div :class="$style.container">
    Hello World
  </div>
</template>

<style module>
.container {
  color: red;
}
</style>
```

### PostCSS

```javascript
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    'postcss-pxtorem': {
      rootValue: 16,
      propList: ['*']
    }
  }
};
```

---