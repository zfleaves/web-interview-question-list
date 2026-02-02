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