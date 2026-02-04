# 1. 请简述 uniapp 多端打包原理 条件编译原理

**答案：**

**uniapp 多端打包原理：**

uniapp 的多端打包原理是通过一套代码，根据不同的目标平台生成对应平台的包。核心思想是"一次开发，多端运行"。

**uniapp 架构：**

```
┌─────────────────────────────────────────┐
│           开发者代码 (Vue.js)            │
│      (.vue, .js, .ts, .css, .json)      │
└───────────────┬─────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│         uniapp 编译器                    │
│    - 条件编译                            │
│    - 语法转换                            │
│    - API 兼容处理                        │
└───────┬───────┬───────┬─────────────────┘
        ↓       ↓       ↓
┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
│  H5    │ │小程序   │ │  App   │ │ 快应用  │
│        │ │        │ │        │ │         │
├────────┤ ├────────┤ ├────────┤ ├─────────┤
│浏览器  │ │微信    │ │iOS     │ │小米     │
│        │ │支付宝  │ │Android │ │华为     │
│        │ │百度    │ │        │ │         │
│        │ │字节    │ │        │ │         │
└────────┘ └────────┘ └────────┘ └─────────┘
```

**打包流程详解：**

```javascript
// 1. 源代码解析
function parseSource(source) {
  return {
    template: parseTemplate(source.template),
    script: parseScript(source.script),
    style: parseStyle(source.style),
    json: parseConfig(source.json)
  };
}

// 2. 条件编译处理
function conditionalCompile(ast, platform) {
  // 移除不匹配平台的代码块
  ast = removePlatformSpecificCode(ast, platform);
  
  // 转换平台特定语法
  ast = transformPlatformSyntax(ast, platform);
  
  // 处理平台 API 差异
  ast = handlePlatformAPI(ast, platform);
  
  return ast;
}

// 3. 代码转换
function transformCode(ast, platform) {
  switch (platform) {
    case 'mp-weixin':
      return transformToWeixin(ast);
    case 'mp-alipay':
      return transformToAlipay(ast);
    case 'h5':
      return transformToH5(ast);
    case 'app':
      return transformToApp(ast);
  }
}

// 4. 生成目标代码
function generateCode(transformedAst, platform) {
  const generators = {
    'mp-weixin': generateWeixinCode,
    'mp-alipay': generateAlipayCode,
    'h5': generateH5Code,
    'app': generateAppCode
  };
  
  return generators[platform](transformedAst);
}
```

**条件编译原理：**

条件编译是 uniapp 的核心特性，允许开发者根据不同平台编写特定代码。

**条件编译语法：**

```javascript
// 1. 平台判断语法
// #ifdef 平台名称
// 平台特定的代码
// #endif

// #ifndef 平台名称
// 非该平台执行的代码
// #endif

// 示例
// #ifdef MP-WEIXIN
console.log('这是微信小程序');
// #endif

// #ifdef H5
console.log('这是 H5 应用');
// #endif

// #ifdef MP-WEIXIN || MP-ALIPAY
console.log('这是微信或支付宝小程序');
// #endif

// 2. API 条件编译
// 微信小程序
uni.request({
  url: 'https://api.example.com',
  success: (res) => {
    // #ifdef MP-WEIXIN
    console.log('微信小程序请求成功');
    // #endif
  }
});

// 3. 样式条件编译
/* #ifdef MP-WEIXIN */
.container {
  padding-top: 44px; /* 适配微信小程序导航栏 */
}
/* #endif */

/* #ifdef H5 */
.container {
  padding-top: 0;
}
/* #endif */
```

**条件编译底层实现：**

```javascript
// 条件编译解析器
class ConditionalCompiler {
  constructor(platform) {
    this.platform = platform;
    this.platforms = {
      'MP-WEIXIN': 'mp-weixin',
      'MP-ALIPAY': 'mp-alipay',
      'MP-BAIDU': 'mp-baidu',
      'MP-TOUTIAO': 'mp-toutiao',
      'H5': 'h5',
      'APP-PLUS': 'app'
    };
  }
  
  // 编译代码
  compile(code) {
    // 移除注释
    code = this.removeComments(code);
    
    // 处理条件编译
    code = this.processConditionals(code);
    
    // 移除空行
    code = this.removeEmptyLines(code);
    
    return code;
  }
  
  // 处理条件编译
  processConditionals(code) {
    const ifdefPattern = /\/\/\s*#ifdef\s+([A-Z-]+)/g;
    const endifPattern = /\/\/\s*#endif/g;
    const ifndefPattern = /\/\/\s*#ifndef\s+([A-Z-]+)/g;
    
    let result = '';
    let stack = [];
    let lines = code.split('\n');
    let skip = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // #ifdef
      const ifdefMatch = line.match(ifdefPattern);
      if (ifdefMatch) {
        const platforms = ifdefMatch[1].split('||').map(p => p.trim());
        const shouldInclude = platforms.some(p => 
          this.platforms[p] === this.platform
        );
        stack.push(shouldInclude);
        skip = !this.shouldInclude(stack);
        continue;
      }
      
      // #ifndef
      const ifndefMatch = line.match(ifndefPattern);
      if (ifndefMatch) {
        const platforms = ifndefMatch[1].split('||').map(p => p.trim());
        const shouldInclude = !platforms.some(p => 
          this.platforms[p] === this.platform
        );
        stack.push(shouldInclude);
        skip = !this.shouldInclude(stack);
        continue;
      }
      
      // #endif
      if (line.match(endifPattern)) {
        stack.pop();
        skip = !this.shouldInclude(stack);
        continue;
      }
      
      // 普通代码行
      if (!skip) {
        result += line + '\n';
      }
    }
    
    return result;
  }
  
  // 判断是否应该包含代码
  shouldInclude(stack) {
    return stack.every(condition => condition);
  }
  
  // 移除注释
  removeComments(code) {
    return code.replace(/\/\/.*$/gm, '');
  }
  
  // 移除空行
  removeEmptyLines(code) {
    return code.replace(/^\s*[\r\n]/gm, '');
  }
}

// 使用示例
const compiler = new ConditionalCompiler('mp-weixin');
const sourceCode = `
// #ifdef MP-WEIXIN
console.log('微信小程序代码');
// #endif

// #ifdef H5
console.log('H5 代码');
// #endif

console.log('通用代码');
`;

const compiled = compiler.compile(sourceCode);
console.log(compiled);
// 输出：
// console.log('微信小程序代码');
// console.log('通用代码');
```

**多端平台差异处理：**

```javascript
// 平台 API 映射
const platformAPIMappings = {
  'mp-weixin': {
    request: 'wx.request',
    storage: 'wx.getStorageSync',
    navigation: 'wx.navigateTo'
  },
  'mp-alipay': {
    request: 'my.request',
    storage: 'my.getStorageSync',
    navigation: 'my.navigateTo'
  },
  'h5': {
    request: 'fetch',
    storage: 'localStorage.getItem',
    navigation: 'window.location.href'
  }
};

// API 转换
function transformAPI(code, platform) {
  const mappings = platformAPIMappings[platform];
  
  for (const [uniAPI, platformAPI] of Object.entries(mappings)) {
    const regex = new RegExp(`uni\\.${uniAPI}`, 'g');
    code = code.replace(regex, platformAPI);
  }
  
  return code;
}

// 示例
const code = `
uni.request({ url: '/api/data' });
uni.getStorageSync('token');
uni.navigateTo({ url: '/pages/detail' });
`;

const weixinCode = transformAPI(code, 'mp-weixin');
console.log(weixinCode);
// 输出：
// wx.request({ url: '/api/data' });
// wx.getStorageSync('token');
// wx.navigateTo({ url: '/pages/detail' });
```

**组件转换示例：**

```javascript
// uniapp 组件转换
function transformComponents(ast, platform) {
  // 不同平台的组件映射
  const componentMap = {
    'mp-weixin': {
      'view': 'view',
      'text': 'text',
      'image': 'image',
      'navigator': 'navigator'
    },
    'h5': {
      'view': 'div',
      'text': 'span',
      'image': 'img',
      'navigator': 'a'
    }
  };
  
  const mappings = componentMap[platform] || {};
  
  // 遍历 AST 替换组件标签
  return replaceComponentTags(ast, mappings);
}

// 样式单位转换
function transformStyleUnits(style, platform) {
  if (platform === 'h5') {
    // H5 平台将 rpx 转换为 rem
    return style.replace(/(\d+)rpx/g, (match, value) => {
      return `${value / 100}rem`;
    });
  } else {
    // 小程平台保留 rpx
    return style;
  }
}
```

**实际项目中的条件编译应用：**

```javascript
// 支付场景示例
function pay(orderInfo) {
  // #ifdef MP-WEIXIN
  wx.requestPayment({
    ...orderInfo,
    success: (res) => {
      console.log('微信支付成功');
    }
  });
  // #endif
  
  // #ifdef MP-ALIPAY
  my.tradePay({
    ...orderInfo,
    success: (res) => {
      console.log('支付宝支付成功');
    }
  });
  // #endif
  
  // #ifdef H5
  window.location.href = `https://pay.example.com?order=${orderInfo.orderId}`;
  // #endif
}

// 登录场景示例
function login() {
  // #ifdef MP-WEIXIN
  wx.login({
    success: (res) => {
      getOpenId(res.code);
    }
  });
  // #endif
  
  // #ifdef MP-ALIPAY
  my.getAuthCode({
    scopes: 'auth_user',
    success: (res) => {
      getOpenId(res.authCode);
    }
  });
  // #endif
  
  // #ifdef H5
  window.location.href = `https://login.example.com?redirect=${encodeURIComponent(window.location.href)}`;
  // #endif
}

// 分享场景示例
function share(content) {
  // #ifdef MP-WEIXIN
  wx.showShareMenu({
    withShareTicket: true
  });
  // #endif
  
  // #ifdef H5
  if (navigator.share) {
    navigator.share({
      title: content.title,
      text: content.text,
      url: content.url
    });
  } else {
    alert('请使用分享链接: ' + content.url);
  }
  // #endif
}
```

**高途特色考点：**
- 高途高频考察小程序打包原理和多端架构设计
- 结合实际项目说明条件编译的应用场景（支付、登录、分享等）
- 考察对平台差异处理和 API 兼容性的理解
- 考察对性能优化和包大小控制的经验
- 可能会问如何处理复杂的多端业务逻辑

---
