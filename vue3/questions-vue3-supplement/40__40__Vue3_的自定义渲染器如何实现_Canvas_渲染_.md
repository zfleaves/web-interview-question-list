# 40. Vue3 的自定义渲染器如何实现 Canvas 渲染？

**答案：**

```javascript
import { createRenderer } from 'vue';

const nodeOps = {
  createElement(tag) {
    return {
      tag,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      children: []
    };
  },

  patchProp(el, key, prevValue, nextValue) {
    el[key] = nextValue;
  },

  insert(child, parent, anchor) {
    parent.children.push(child);
  },

  remove(child) {
    const index = parent.children.indexOf(child);
    if (index > -1) {
      parent.children.splice(index, 1);
    }
  },

  parentNode(node) {
    return node.parent;
  },

  nextSibling(node) {
    const parent = node.parent;
    const index = parent.children.indexOf(node);
    return parent.children[index + 1];
  }
};

const renderer = createRenderer(nodeOps);

// 使用
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const app = createApp({
  setup() {
    const rects = ref([
      { x: 10, y: 10, width: 50, height: 50, color: 'red' },
      { x: 70, y: 10, width: 50, height: 50, color: 'blue' }
    ]);

    return { rects };
  }
});

renderer.createApp(app).mount(canvas);
```

---