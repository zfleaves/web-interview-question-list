## 9.  什么是 Content-Type？常见的 Content-Type 有哪些？

**答案：**

### Content-Type 简介

Content-Type 是 HTTP 响应头中的一个字段，用于告诉客户端（浏览器）服务器返回的数据是什么格式。

### 常见的 Content-Type

#### 1. 文本类型

```javascript
Content-Type: text/html; charset=utf-8
Content-Type: text/plain; charset=utf-8
Content-Type: text/css; charset=utf-8
Content-Type: text/javascript; charset=utf-8
```

#### 2. 应用类型

```javascript
// JSON
Content-Type: application/json

// XML
Content-Type: application/xml

// 表单数据（URL 编码）
Content-Type: application/x-www-form-urlencoded

// 表单数据（多部分）
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

// PDF
Content-Type: application/pdf

// 压缩文件
Content-Type: application/zip
Content-Type: application/gzip
```

#### 3. 图片类型

```javascript
Content-Type: image/jpeg
Content-Type: image/png
Content-Type: image/gif
Content-Type: image/svg+xml
Content-Type: image/webp
```

#### 4. 音频类型

```javascript
Content-Type: audio/mpeg
Content-Type: audio/wav
Content-Type: audio/ogg
```

#### 5. 视频类型

```javascript
Content-Type: video/mp4
Content-Type: video/webm
Content-Type: video/ogg
```

#### 6. 字体类型

```javascript
Content-Type: font/woff
Content-Type: font/woff2
Content-Type: font/ttf
Content-Type: font/eot
```

### POST 请求的 Content-Type

#### 1. application/x-www-form-urlencoded

```javascript
// 请求头
Content-Type: application/x-www-form-urlencoded

// 请求体
name=test&age=18

// 发送方式
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    name: 'test',
    age: 18
  })
});
```

#### 2. application/json

```javascript
// 请求头
Content-Type: application/json

// 请求体
{
  "name": "test",
  "age": 18
}

// 发送方式
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'test',
    age: 18
  })
});
```

#### 3. multipart/form-data

```javascript
// 请求头
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

// 请求体
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="name"

test
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="age"

18
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="test.jpg"
Content-Type: image/jpeg

[二进制数据]
------WebKitFormBoundary7MA4YWxkTrZu0gW--

// 发送方式
const formData = new FormData();
formData.append('name', 'test');
formData.append('age', 18);
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### Content-Type 与 Accept

```javascript
// 请求头：Accept - 客户端告诉服务器自己能接受什么格式
Accept: application/json, text/plain, */*

// 响应头：Content-Type - 服务器告诉客户端返回的是什么格式
Content-Type: application/json
```

### Content-Type 与字符编码

```javascript
// 显式指定字符编码
Content-Type: text/html; charset=utf-8

// 默认字符编码
// text/html: ISO-8859-1
// application/json: UTF-8
```

### Content-Type 与文件上传

```javascript
// 单文件上传
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData
});

// 多文件上传
const formData = new FormData();
Array.from(fileInput.files).forEach(file => {
  formData.append('files', file);
});

fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

---