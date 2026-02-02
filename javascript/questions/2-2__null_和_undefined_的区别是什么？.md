# 2. null 和 undefined 的区别是什么？

**答案：**

**区别：**

```javascript
// 1. 含义不同
undefined: 变量声明但未赋值
null: 表示"空"或"无"的对象

// 2. 类型不同
typeof undefined; // "undefined"
typeof null; // "object"

// 3. 转换为数字
Number(undefined); // NaN
Number(null); // 0

// 4. 相等性比较
undefined == null; // true
undefined === null; // false
```

**最佳实践：**

```javascript
// 1. 判断变量是否为空
function isEmpty(value) {
  return value === null || value === undefined;
}

// 2. 可选链操作符
const user = {
  profile: {
    name: 'John'
  }
};

// ❌ 错误方式
const age = user.profile.age; // undefined，如果 profile 不存在会报错

// ✅ 正确方式
const age = user.profile?.age; // undefined

// 3. 空值合并运算符
const name = user.name ?? 'Guest'; // 如果 name 为 null 或 undefined，使用 'Guest'

// 4. 默认参数
function greet(name = 'Guest') {
  console.log(`Hello, ${name}!`);
}

greet(); // "Hello, Guest!"
greet(null); // "Hello, null!" (null 不是 undefined)
greet(undefined); // "Hello, Guest!"
```

**场景题：**

```javascript
// 场景 1：API 响应处理
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  
  // 如果用户不存在，返回 null
  return user || null;
}

// 使用
const user = await fetchUser(1);
if (user !== null) {
  console.log(user.name);
}

// 场景 2：配置对象
function createConfig(options = {}) {
  return {
    timeout: options.timeout ?? 5000,
    retries: options.retries ?? 3,
    // null 表示禁用该功能
    enableCache: options.enableCache ?? true
  };
}

createConfig({ enableCache: null }); // enableCache 为 null（禁用）
createConfig({}); // enableCache 为 true（默认）

// 场景 3：表单验证
function validateForm(data) {
  const errors = {};
  
  if (data.email === null || data.email === undefined) {
    errors.email = 'Email is required';
  }
  
  if (data.age === null || data.age === undefined) {
    errors.age = 'Age is required';
  }
  
  return Object.keys(errors).length === 0 ? null : errors;
}
```

---