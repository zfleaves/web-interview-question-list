# Vue3 的 Teleport 组件详解

**答案：**

## Teleport 简介

Teleport 是 Vue3 的一个内置组件，用于将组件渲染到 DOM 的其他位置。

## 基本用法

```vue
<template>
  <div>
    <h3>Inside Component</h3>
    <Teleport to="body">
      <div class="modal">Modal Content</div>
    </Teleport>
  </div>
</template>
```

## 传送到指定元素

```vue
<template>
  <Teleport to="#modal-container">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>
```

## 条件禁用

```vue
<template>
  <Teleport to="body" :disabled="isInline">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const isInline = ref(false);
</script>
```

## 实现 Modal 弹窗

```vue
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <slot />
          <button @click="closeModal">Close</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  showModal: Boolean
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
```

## 实现 Toast 提示

```vue
<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue';

const toasts = ref([]);

const showToast = (message, type = 'info') => {
  const id = Date.now();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, 3000);
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast {
  padding: 10px 20px;
  margin-bottom: 10px;
  border-radius: 4px;
  color: white;
}
</style>
```

## 实现 Dropdown 下拉菜单

```vue
<template>
  <div class="dropdown">
    <button @click="toggleDropdown">
      {{ selected }}
    </button>
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isOpen" class="dropdown-menu" :style="menuStyle">
          <div
            v-for="option in options"
            :key="option"
            @click="selectOption(option)"
          >
            {{ option }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const isOpen = ref(false);
const selected = ref('Select');
const options = ['Option 1', 'Option 2', 'Option 3'];

const menuStyle = computed(() => ({
  position: 'absolute',
  top: '100px',
  left: '100px'
}));

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  selected.value = option;
  isOpen.value = false;
};
</script>
```

---