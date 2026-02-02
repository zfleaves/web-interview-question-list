# 2. 如何实现一个前端构建工具（类似 Webpack）？

**答案：**

```javascript
// 简化版 Webpack
class MiniWebpack {
  constructor(options) {
    this.entry = options.entry;
    this.output = options.output;
    this.modules = [];
  }
  
  // 解析文件
  parse(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    
    // 解析依赖
    const dependencies = [];
    const ast = parser.parse(content, {
      sourceType: 'module',
    });
    
    traverse(ast, {
      ImportDeclaration({ node }) {
        dependencies.push(node.source.value);
      },
    });
    
    // 转换代码
    const { code } = babel.transformFromAst(ast, null, {
      presets: ['@babel/preset-env'],
    });
    
    return {
      filename,
      dependencies,
      code,
    };
  }
  
  // 构建依赖图
  buildDependencyGraph(entry) {
    const entryModule = this.parse(entry);
    const queue = [entryModule];
    
    for (const module of queue) {
      const dirname = path.dirname(module.filename);
      
      module.dependencies.forEach(relativePath => {
        const absolutePath = path.join(dirname, relativePath);
        const child = this.parse(absolutePath);
        this.modules.push(child);
        queue.push(child);
      });
    }
  }
  
  // 生成代码
  generate() {
    const modulesStr = this.modules
      .map(module => {
        return `${JSON.stringify(module.filename)}: function(module, exports, require) {
          ${module.code}
        }`;
      })
      .join(',\n');
    
    return `
      (function(modules) {
        const installedModules = {};
        
        function require(filename) {
          if (installedModules[filename]) {
            return installedModules[filename].exports;
          }
          
          const module = installedModules[filename] = {
            exports: {},
          };
          
          modules[filename](module, module.exports, require);
          
          return module.exports;
        }
        
        require('${this.entry}');
      })({
        ${modulesStr}
      });
    `;
  }
  
  // 运行
  run() {
    this.buildDependencyGraph(this.entry);
    const code = this.generate();
    
    fs.writeFileSync(this.output.path, code);
  }
}
```

---

## 算法题
