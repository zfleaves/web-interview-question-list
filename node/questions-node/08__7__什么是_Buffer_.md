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