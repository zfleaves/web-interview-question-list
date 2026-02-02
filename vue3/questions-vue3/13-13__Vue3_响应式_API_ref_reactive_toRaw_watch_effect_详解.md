# 13. Vue3 响应式 API（ref、reactive、toRaw、watch、effect）详解

**答案：**

#### 一、ref

**基本用法：**

ref 用于创建一个响应式的引用对象，常用于包装基本数据类型。

```javascript
import { ref } from 'vue'

// 基本类型
const count = ref(0)
const message = ref('Hello')
const isVisible = ref(true)

// 访问和修改
console.log(count.value) // 0
count.value = 1

// 在模板中使用（自动解包）
<template>
  <div>{{ count }}</div>
  <button @click="count++">增加</button>
</template>
```

**原理实现：**

核心原理：使用 Proxy 包装对象，通过 .value 访问实际值。

```javascript
// 简化的 ref 实现
function ref(value) {
  return createRef(value, false)
}

function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue
  }
  
  return new RefImpl(rawValue, shallow)
}

class RefImpl {
  constructor(value, __v_isShallow) {
    this.__v_isShallow = __v_isShallow
    this.dep = undefined // 依赖收集器
    this.__v_isRef = true // 标识这是一个 ref
    this._rawValue = __v_isShallow ? value : toRaw(value)
    this._value = __v_isShallow ? value : toReactive(value)
  }
  
  get value() {
    // 收集依赖
    trackRefValue(this)
    return this._value
  }
  
  set value(newVal) {
    const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal)
    newVal = useDirectValue ? newVal : toRaw(newVal)
    
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = useDirectValue ? newVal : toReactive(newVal)
      // 触发更新
      triggerRefValue(this)
    }
  }
}
```

**使用场景：**

```javascript
// 1. 基本数据类型的响应式
const count = ref(0)
const message = ref('Hello')

// 2. 单个值的响应式
const user = ref({
  name: 'John',
  age: 20
})

// 3. DOM 元素引用
const inputRef = ref(null)

onMounted(() => {
  inputRef.value.focus()
})

// 4. 组件引用
const childRef = ref(null)
```

**注意事项：**

```javascript
// ❌ 错误：直接赋值 ref 对象
const count = ref(0)
const state = { count } // state.count 是 ref 对象，不是值

// ✅ 正确：在模板中自动解包
<template>
  <div>{{ count }}</div>
</template>

// ✅ 正确：在 JS 中使用 .value
console.log(count.value)
```

**为什么 ref 在模板中可以直接使用？**

在 Vue3 的模板编译过程中，编译器会自动识别 ref 对象并进行解包处理。

**原理实现：**

```javascript
// 1. 编译器在编译模板时会识别 ref
// 模板：{{ count }}
// 编译后：_toDisplayString(unref(count))

// 2. unref 函数的实现
function unref(ref) {
  return isRef(ref) ? ref.value : ref
}

// 3. 在渲染函数中自动解包
function render(_ctx, _cache) {
  return _toDisplayString(unref(_ctx.count))
}

// 4. 更详细的编译过程
// 模板：
// <div>{{ count }}</div>
// <button @click="count++">增加</button>

// 编译后的渲染函数（简化版）：
import { unref } from 'vue'

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, _toDisplayString(unref(_ctx.count)), 1 /* TEXT */),
    _createElementVNode("button", {
      onClick: ($event) => (_ctx.count.value++)
    }, "增加", 8 /* PROPS */, ["onClick"])
  ]))
}
```

**自动解包的规则：**

```javascript
// 1. 顶层属性自动解包
const count = ref(0)
<template>
  <div>{{ count }}</div>  <!-- 自动解包，等同于 count.value -->
</template>

// 2. 对象属性中的 ref 也会自动解包
const state = reactive({
  count: ref(0)
})
<template>
  <div>{{ state.count }}</div>  <!-- 自动解包 -->
</template>

// 3. 数组中的 ref 不会自动解包
const list = [ref(0), ref(1), ref(2)]
<template>
  <div>{{ list[0] }}</div>  <!-- ❌ 不会自动解包，需要 list[0].value -->
</template>

// 4. 解构后的 ref 不会自动解包
const state = reactive({
  count: ref(0)
})
const { count } = state
<template>
  <div>{{ count }}</div>  <!-- ❌ 不会自动解包，需要 count.value -->
</template>

// 5. 使用 toRefs 解构后可以自动解包
const state = reactive({
  count: ref(0)
})
const { count } = toRefs(state)
<template>
  <div>{{ count }}</div>  <!-- ✅ 可以自动解包 -->
</template>
```

**为什么数组中的 ref 不自动解包？**

```javascript
// Vue3 的设计决策：数组中的 ref 不自动解包
const list = [ref(0), ref(1), ref(2)]

// 原因：
// 1. 性能考虑：数组可能很大，自动解包会增加性能开销
// 2. 一致性：保持 JavaScript 的语义一致性
// 3. 明确性：让开发者明确知道这是一个 ref

// 解决方案：
// 1. 使用 .value
<template>
  <div>{{ list[0].value }}</div>
</template>

// 2. 使用 computed
const listValues = computed(() => list.map(item => item.value))
<template>
  <div>{{ listValues[0] }}</div>
</template>

// 3. 使用 reactive 包装
const state = reactive({
  list: [0, 1, 2]
})
<template>
  <div>{{ state.list[0] }}</div>
</template>
```

**事件处理中的 ref：**

```javascript
// 在事件处理中，ref 不会自动解包
const count = ref(0)

// ❌ 错误：count 不会自动解包
<template>
  <button @click="count++">增加</button>  <!-- 错误 -->
</template>

// ✅ 正确：使用 .value
<template>
  <button @click="count.value++">增加</button>
</template>

// ✅ 正确：使用方法
const increment = () => {
  count.value++
}
<template>
  <button @click="increment">增加</button>
</template>
```

**编译器的解包优化：**

```javascript
// Vue3 编译器会在编译时进行优化
// 1. 静态提升：静态内容会被提取，避免重复创建
// 2. 补丁标记：标记动态内容，只更新变化的部分
// 3. 块树：使用块树结构优化 Diff 算法

// 示例：
<template>
  <div>{{ count }}</div>
  <div>静态内容</div>
</template>

// 编译后的代码（简化）：
const _hoisted_1 = _createElementVNode("div", null, "静态内容", -1 /* HOISTED */)

function render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", null, [
    _createElementVNode("div", null, _toDisplayString(unref(_ctx.count)), 1 /* TEXT */),
    _hoisted_1
  ]))
}
```

**总结：**

ref 在模板中可以直接使用是因为：
1. **编译器自动解包**：编译器在编译模板时会识别 ref 并自动调用 `unref()` 函数
2. **顶层属性解包**：顶层的 ref 属性会自动解包
3. **对象属性解包**：reactive 对象中的 ref 属性也会自动解包
4. **数组不解包**：数组中的 ref 不会自动解包，需要使用 `.value`
5. **事件处理不解包**：在事件处理中 ref 不会自动解包，需要使用 `.value`

这种设计既保持了使用的便利性，又避免了不必要的性能开销。
