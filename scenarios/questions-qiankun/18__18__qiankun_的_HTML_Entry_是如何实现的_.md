# 18. qiankun 的 HTML Entry 是如何实现的？

**答案：**

HTML Entry 是 qiankun 的核心特性，通过以下步骤实现：

### 1. 获取 HTML 内容

```javascript
async function importEntry(entry) {
  const { template, execScripts, assetPublicPath } = await importHTML(entry);

  return {
    template,
    assetPublicPath,
    execScripts
  };
}
```

### 2. 解析 HTML

```javascript
export async function importHTML(url) {
  const html = await fetch(url).then(res => res.text());

  // 创建 DOM 解析器
  const div = document.createElement('div');
  div.innerHTML = html;

  // 提取资源
  const scripts = Array.from(div.querySelectorAll('script'));
  const styles = Array.from(div.querySelectorAll('link[rel="stylesheet"]'));

  return {
    template: html,
    scripts: scripts.map(script => script.src),
    styles: styles.map(style => style.href)
  };
}
```

### 3. 加载资源

```javascript
async function execScripts(scripts) {
  for (const script of scripts) {
    await loadScript(script);
  }
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### 4. 执行生命周期

```javascript
const { template, execScripts } = await importEntry('//localhost:3001');

// 渲染模板
container.innerHTML = template;

// 执行脚本，获取生命周期
const lifeCycles = await execScripts();

// 调用生命周期
await lifeCycles.bootstrap(props);
await lifeCycles.mount(props);
```

---