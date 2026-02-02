# 13. Vue3 的 Teleport 组件如何实现 Dropdown 下拉菜单？

**答案：**

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