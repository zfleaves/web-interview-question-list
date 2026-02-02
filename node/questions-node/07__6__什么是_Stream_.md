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