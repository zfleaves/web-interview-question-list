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