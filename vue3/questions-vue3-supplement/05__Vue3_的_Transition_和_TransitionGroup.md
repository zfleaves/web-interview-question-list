# Vue3 的 Transition 和 TransitionGroup

**答案：**

## Transition 基本用法

```vue
<template>
  <Transition name="fade">
    <div v-if="show">Hello</div>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

## 使用 JavaScript 钩子

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
    <div v-if="show">Hello</div>
  </Transition>
</template>

<script setup>
const beforeEnter = (el) => {
  el.style.opacity = 0;
};

const enter = (el, done) => {
  el.offsetHeight; // 触发重绘
  el.style.transition = 'opacity 0.3s';
  el.style.opacity = 1;
  done();
};

const afterEnter = (el) => {
  el.style.transition = '';
};
</script>
```

## 使用 GSAP

```vue
<template>
  <Transition @enter="enter" @leave="leave">
    <div v-if="show">Hello</div>
  </Transition>
</template>

<script setup>
import gsap from 'gsap';

const enter = (el, done) => {
  gsap.fromTo(el, { x: -100 }, { x: 0, duration: 0.5, onComplete: done });
};

const leave = (el, done) => {
  gsap.to(el, { x: 100, duration: 0.5, onComplete: done });
};
</script>
```

## TransitionGroup

```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active, .list-leave-active {
  transition: all 0.3s;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
```

---