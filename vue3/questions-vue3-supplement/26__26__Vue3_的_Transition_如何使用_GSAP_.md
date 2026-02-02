# 26. Vue3 的 Transition 如何使用 GSAP？

**答案：**

```vue
<template>
  <Transition
    @enter="onEnter"
    @leave="onLeave"
  >
    <div v-if="show">Content</div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import gsap from 'gsap';

const show = ref(true);

const onEnter = (el, done) => {
  gsap.fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, onComplete: done });
};

const onLeave = (el, done) => {
  gsap.to(el, { opacity: 0, y: -20, duration: 0.3, onComplete: done });
};
</script>
```

---