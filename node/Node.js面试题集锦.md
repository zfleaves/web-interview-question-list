# Node.js 面试题集锦

## 1. 什么是 Node.js？

**答案：**

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，它允许开发者使用 JavaScript 语言在服务器端运行代码。

### Node.js 的特点

1. **事件驱动**：使用事件驱动的非阻塞 I/O 模型
2. **非阻塞 I/O**：异步编程，提高并发处理能力
3. **单线程**：主线程是单线程，但可以通过多进程利用多核 CPU
4. **跨平台**：可以在 Windows、macOS、Linux 上运行
5. **丰富的生态系统**：npm 是世界上最大的开源库生态系统

### 适用场景

- **高并发应用**：聊天应用、实时应用
- **API 服务**：RESTful API、GraphQL
- **实时应用**：WebSocket、Server-Sent Events
- **工具开发**：构建工具、CLI 工具

---

## 2. Node.js 的事件循环机制是什么？

**答案：**

Node.js 的事件循环是 Node.js 实现异步非阻塞 I/O 的核心机制。

### 事件循环的六个阶段

```javascript
┌───────────────────────────┐
┌─>│ timers                  │
│  setTimeout(), setInterval()│
└─────────────────────────────┘
┌───────────────────────────┐
│  pending callbacks        │
│  I/O callbacks            │
└─────────────────────────────┘
┌───────────────────────────┐
│  idle, prepare            │
│  internal use only        │
└─────────────────────────────┘
┌───────────────────────────┐
│  poll                    │
│  retrieve new I/O events  │
└─────────────────────────────┘
┌───────────────────────────┐
│  check                   │
│  setImmediate() callbacks │
└─────────────────────────────┘
┌───────────────────────────┐
│  close callbacks          │
│  socket.on('close')       │
└─────────────────────────────┘
```

### 宏任务和微任务

```javascript
console.log('1');

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4');

// 输出：1 4 3 2
```

### 实际示例

```javascript
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('end');

// 输出：
// start
// end
// nextTick
// promise
// timeout
// immediate
```

---

## 3. CommonJS 和 ES Module 的区别是什么？

**答案：**

### CommonJS

```javascript
// 导出
module.exports = {
  name: 'test',
  age: 18
};

// 或
exports.name = 'test';
exports.age = 18;

// 导入
const module = require('./module.js');
const { name, age } = require('./module.js');
```

### ES Module

```javascript
// 导出
export const name = 'test';
export const age = 18;

// 或
export default {
  name: 'test',
  age: 18
};

// 导入
import module from './module.js';
import { name, age } from './module.js';
```

### 区别

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 加载方式 | 运行时加载 | 编译时加载 |
| 输出 | 值的拷贝 | 值的引用 |
| 顶层 this | module.exports | undefined |
| 加载顺序 | 同步 | 异步 |
| 文件扩展名 | 可省略 | 必须指定 |
| 浏览器支持 | 需要打包 | 原生支持 |

---

## 4. 什么是中间件（Middleware）？

**答案：**

中间件是在 Web 应用程序中处理 HTTP 请求的一种机制，它可以在请求到达路由处理之前或者在响应发送给客户端之前执行一些处理。

### Express 中间件

```javascript
const express = require('express');
const app = express();

// 应用级中间件
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// 路由级中间件
app.get('/', (req, res, next) => {
  console.log('Request Type:', req.method);
  next();
}, (req, res) => {
  res.send('Hello World');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### 中间件的执行顺序

```javascript
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);

app.get('/', handler);

// 执行顺序：
// middleware1 -> middleware2 -> middleware3 -> handler
```

### 自定义中间件

```javascript
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
}

function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized');
  }
  next();
}

app.use(logger);
app.use('/protected', auth);
```

---

## 5. Koa 的洋葱模型是什么？

**答案：**

Koa 的洋葱模型是其核心设计之一，用于实现中间件的执行流程。中间件形成像洋葱一样层层包裹的结构，请求和响应在中间件之间层层传递。

### 洋葱模型示例

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
  console.log('1. 请求进入中间件 1');
  await next();
  console.log('1. 响应离开中间件 1');
});

app.use(async (ctx, next) => {
  console.log('2. 请求进入中间件 2');
  await next();
  console.log('2. 响应离开中间件 2');
});

app.use(async ctx => {
  console.log('3. 处理请求');
  ctx.body = 'Hello World';
});

app.listen(3000);

// 输出：
// 1. 请求进入中间件 1
// 2. 请求进入中间件 2
// 3. 处理请求
// 2. 响应离开中间件 2
// 1. 响应离开中间件 1
```

### 洋葱模型图示

```
┌─────────────────────────────────────────┐
│         中间件 1                         │
│  ┌───────────────────────────────────┐  │
│  │         中间件 2                   │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │         中间件 3             │  │  │
│  │  │         处理请求             │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 6. 什么是 Stream？

**答案：**

Stream 是 Node.js 中处理流式数据的抽象接口，它允许你以流的方式处理数据，而不是一次性加载整个数据到内存中。

### Stream 的类型

1. **Readable**：可读流
2. **Writable**：可写流
3. **Duplex**：双工流（可读可写）
4. **Transform**：转换流（可读可写，可以修改数据）

### 示例

```javascript
const fs = require('fs');

// 读取流
const readStream = fs.createReadStream('input.txt');

// 写入流
const writeStream = fs.createWriteStream('output.txt');

// 管道
readStream.pipe(writeStream);

// 转换流
const { Transform } = require('stream');

const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

readStream
  .pipe(upperCaseTransform)
  .pipe(writeStream);
```

### 应用场景

- **文件处理**：大文件读写
- **网络传输**：HTTP 请求/响应
- **数据压缩**：gzip 压缩
- **数据转换**：数据格式转换

---

## 7. 什么是 Buffer？

**答案：**

Buffer 是 Node.js 中用于处理二进制数据的类，它类似于数组，但存储的是原始的二进制数据。

### 创建 Buffer

```javascript
// 创建指定大小的 Buffer
const buf1 = Buffer.alloc(10);

// 从数组创建
const buf2 = Buffer.from([1, 2, 3, 4]);

// 从字符串创建
const buf3 = Buffer.from('Hello World');

// 创建并填充
const buf4 = Buffer.alloc(5, 'a');
```

### Buffer 操作

```javascript
const buf = Buffer.from('Hello World');

// 读取
console.log(buf.toString()); // Hello World

// 写入
buf.write('Node.js');

// 长度
console.log(buf.length); // 11

// 切片
const slice = buf.slice(0, 5);
console.log(slice.toString()); // Node.j

// 拼接
const buf1 = Buffer.from('Hello ');
const buf2 = Buffer.from('World');
const buf3 = Buffer.concat([buf1, buf2]);
console.log(buf3.toString()); // Hello World
```

### 应用场景

- **文件操作**：读写二进制文件
- **网络通信**：处理网络数据
- **加密解密**：处理加密数据
- **图像处理**：处理图像数据

---

## 8. 什么是 EventEmitter？

**答案：**

EventEmitter 是 Node.js 中实现事件驱动编程的核心类，它提供了发布-订阅模式的实现。

### 基本用法

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// 监听事件
myEmitter.on('event', () => {
  console.log('事件触发');
});

// 触发事件
myEmitter.emit('event');

// 带参数的事件
myEmitter.on('data', (data) => {
  console.log('收到数据:', data);
});

myEmitter.emit('data', { name: 'test' });

// 只触发一次
myEmitter.once('once-event', () => {
  console.log('只触发一次');
});

myEmitter.emit('once-event');
myEmitter.emit('once-event'); // 不会触发
```

### 移除监听器

```javascript
const handler = () => {
  console.log('事件触发');
};

myEmitter.on('event', handler);
myEmitter.removeListener('event', handler);
```

### 错误处理

```javascript
myEmitter.on('error', (err) => {
  console.error('发生错误:', err);
});

myEmitter.emit('error', new Error('Something went wrong'));
```

---

## 9. 什么是 Cluster？

**答案：**

Cluster 是 Node.js 的内置模块，用于创建多进程应用，充分利用多核 CPU。

### 基本 Cluster

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
    cluster.fork(); // 重新启动工作进程
  });
} else {
  // 工作进程可以共享同一个端口
  const http = require('http');
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`工作进程 ${process.pid}`);
  }).listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}
```

### 优点

- **提高性能**：充分利用多核 CPU
- **提高可靠性**：一个进程崩溃不会影响其他进程
- **负载均衡**：自动分配请求到不同进程

---

## 10. 如何实现文件上传？

**答案：**

### 使用 Multer

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 单文件上传
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('没有文件上传');
  }
  res.send('文件上传成功');
});

// 多文件上传
app.post('/uploads', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('没有文件上传');
  }
  res.send(`${req.files.length} 个文件上传成功`);
});

app.listen(3000);
```

### 前端上传

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="file">
  <button type="submit">上传</button>
</form>

<script>
// 使用 FormData 上传
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/upload', {
  method: 'POST',
  body: formData
})
  .then(response => response.text())
  .then(data => console.log(data));
</script>
```

---

## 总结

Node.js 是前端开发的重要组成部分，重点掌握：

1. **事件循环**：宏任务和微任务的执行顺序
2. **模块系统**：CommonJS 和 ES Module 的区别
3. **中间件**：Express 和 Koa 的中间件机制
4. **Stream**：流式数据处理
5. **Buffer**：二进制数据处理
6. **EventEmitter**：事件驱动编程
7. **Cluster**：多进程应用
8. **文件操作**：文件上传下载