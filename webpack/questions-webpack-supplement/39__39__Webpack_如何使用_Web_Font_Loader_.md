# 39. Webpack 如何使用 Web Font Loader？

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