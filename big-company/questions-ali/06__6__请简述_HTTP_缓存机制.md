# 6. 请简述 HTTP 缓存机制

**答案：**

**HTTP 缓存分类：**

**1. 强缓存（Cache-Control）**

```http
# 强制缓存 1 小时
Cache-Control: max-age=3600

# 强制缓存 1 天
Cache-Control: max-age=86400

# 不使用缓存
Cache-Control: no-cache
```

**2. 协商缓存（ETag、Last-Modified）**

```http
# ETag
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT

# 客户端请求
If-None-Match: "abc123"
If-Modified-Since: Wed, 21 Oct 2015 07:28:00 GMT

# 服务器响应
304 Not Modified
```

**3. 缓存策略对比**

| 策略 | 优点 | 缺点 |
|------|------|------|
| 强缓存 | 减少服务器请求，提高性能 | 更新不及时 |
| 协商缓存 | 数据实时更新 | 每次都需要请求服务器 |

**最佳实践：**

```http
# 静态资源：强缓存 + 协商缓存
# HTML 文件：短缓存
Cache-Control: max-age=0, must-revalidate

# CSS/JS/图片：长缓存 + 文件名哈希
Cache-Control: max-age=31536000, immutable

# API 响应：协商缓存
ETag: "abc123"
Cache-Control: max-age=0, must-revalidate
```

**阿里特色考点：**
- 阿里高频考察缓存策略的设计和选择
- 结合阿里业务（如电商商品详情页）说明缓存方案
- 考察对 CDN 缓存的理解和使用经验

---

## 算法题
