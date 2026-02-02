# 25. Vue3 的 Transition 如何使用 JavaScript 钩子？

**答案：**

```vue
<template>
  <Transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <div v-if="show">Content</div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';

const show = ref(true);

const beforeEnter = (el) => {
  el.style.opacity = 0;
};

const enter = (el, done) => {
  el.offsetHeight; // 触发重排
  el.style.transition = 'opacity 0.3s';
  el.style.opacity = 1;
  setTimeout(done, 300);
};

const afterEnter = (el) => {
  console.log('enter done');
};

const beforeLeave = (el) => {
  el.style.opacity = 1;
};

const leave = (el, done) => {
  el.style.transition = 'opacity 0.3s';
  el.style.opacity = 0;
  setTimeout(done, 300);
};

const afterLeave = (el) => {
  console.log('leave done');
};
</script>
```

---