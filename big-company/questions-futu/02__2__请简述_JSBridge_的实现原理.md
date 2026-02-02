# 2. 请简述 JSBridge 的实现原理

**答案：**

**JSBridge 是 Native 代码与 JS 代码的通信桥梁。**

**实现原理：**

```
H5触发 url scheme -> Native 捕获 url scheme -> 原生分析,执行 -> 原生调用h5
```

**示例：**

```javascript
// H5 调用 Native
iframe.src = 'weixin://dl/scan?k1=v1&k2=v2&callback=invoke_scan_callback';

// 定义回调函数
window.invoke_scan_callback = function(result) {
  console.log('扫描结果:', result);
};
```

**Schema 协议：**
- 前端和客户端通讯的约定
- 格式：`scheme://host?params`

**富途特色考点：**
- 富途高频考察混合开发中 Native 与 H5 通信
- 结合实际项目说明 JSBridge 的应用场景
- 考察对移动端开发的理解

---
