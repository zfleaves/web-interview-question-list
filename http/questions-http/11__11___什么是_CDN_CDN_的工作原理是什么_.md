## 11.  什么是 CDN？CDN 的工作原理是什么？

**答案：**

### CDN 简介

CDN（Content Delivery Network，内容分发网络）是一种分布式网络架构，通过将内容缓存到离用户最近的边缘节点，提高访问速度和可用性。

### CDN 的工作原理

```
用户请求 --> 边缘节点（缓存）
              |
              |-- 命中 --> 直接返回
              |
              |-- 未命中 --> 源站
                              |
                              |-- 返回内容
                              |
                              v
                        边缘节点缓存
                              |
                              v
                        返回给用户
```

### CDN 的优势

1. **提高访问速度**：内容缓存到离用户最近的节点
2. **减轻源站压力**：大部分请求由边缘节点处理
3. **提高可用性**：分布式架构，单点故障不影响整体服务
4. **节省带宽成本**：边缘节点缓存减少源站带宽消耗
5. **提高安全性**：可以防御 DDoS 攻击

### CDN 的应用场景

1. **静态资源**：图片、CSS、JS、字体等
2. **视频流媒体**：点播、直播
3. **软件下载**：安装包、更新包
4. **API 接口**：加速 API 请求

### CDN 配置

```javascript
// 前端配置
// webpack.config.js
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/'
  }
};

// vite.config.js
export default {
  base: 'https://cdn.example.com/'
};
```

### CDN 缓存策略

```nginx
# nginx 配置
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  add_header Access-Control-Allow-Origin "*";
}
```

### CDN 常见问题

#### 1. 缓存更新问题

**问题：** 文件更新后，CDN 缓存未更新，用户访问的还是旧版本

**解决方案：**

```javascript
// 文件名 hash
output: {
  filename: '[name].[contenthash:8].js'
}

// 查询参数
<script src="https://cdn.example.com/app.js?v=123456"></script>
```

#### 2. 跨域问题

**问题：** CDN 资源跨域访问失败

**解决方案：**

```nginx
# CDN 配置 CORS
add_header Access-Control-Allow-Origin "*";
add_header Access-Control-Allow-Methods "GET, OPTIONS";
add_header Access-Control-Allow-Headers "*";
```

#### 3. HTTPS 证书问题

**问题：** CDN 节点的 HTTPS 证书过期或不匹配

**解决方案：**

```javascript
// 使用 CDN 提供的 HTTPS
// 自定义域名需要配置 SSL 证书
```

### 常见 CDN 服务商

| 服务商 | 特点 | 适用场景 |
|--------|------|----------|
| Cloudflare | 免费，全球节点 | 个人项目、小型网站 |
| AWS CloudFront | 与 AWS 集成 | AWS 用户 |
| 阿里云 CDN | 国内节点多，价格低 | 国内项目 |
| 腾讯云 CDN | 国内节点多，价格低 | 国内项目 |
| 七牛云 | 存储 + CDN | 需要存储的项目 |

---