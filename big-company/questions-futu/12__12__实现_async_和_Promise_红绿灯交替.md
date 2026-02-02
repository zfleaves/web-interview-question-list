# 12. 实现 async 和 Promise 红绿灯交替

**答案：**

```javascript
// 定义灯的状态
const RED = 'red';
const GREEN = 'green';
const YELLOW = 'yellow';

// 当前灯的状态
let currentState = RED;

// 灯的容器
const lightContainer = document.getElementById('light-container');

// 更新灯的状态
function updateLight(state) {
  // 清除所有灯的亮状态
  lightContainer.querySelectorAll('.light').forEach(light => {
    light.classList.remove('active');
  });
  
  // 根据状态点亮对应的灯
  const lightElement = lightContainer.querySelector(`.${state}`);
  if (lightElement) {
    lightElement.classList.add('active');
  }
}

// 创建一个延迟的 Promise
function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

// 切换灯的状态
async function switchLight() {
  while (true) {
    updateLight(RED);
    await delay(3000); // 红灯亮 3 秒
    
    updateLight(GREEN);
    await delay(2000); // 绿灯亮 2 秒
    
    updateLight(YELLOW);
    await delay(1000); // 黄灯亮 1 秒
  }
}

// 初始化
switchLight();
```

**HTML 和 CSS：**

```html
<div id="light-container">
  <div class="light red"></div>
  <div class="light yellow"></div>
  <div class="light green"></div>
</div>

<style>
#light-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.light {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #333;
  transition: background-color 0.3s;
}

.light.active.red {
  background-color: red;
}

.light.active.yellow {
  background-color: yellow;
}

.light.active.green {
  background-color: green;
}
</style>
```

**扩展功能：**

```javascript
// 添加暂停和继续功能
let isPaused = false;

function togglePause() {
  isPaused = !isPaused;
}

async function switchLightWithPause() {
  while (true) {
    if (isPaused) {
      await delay(100);
      continue;
    }
    
    updateLight(RED);
    await delay(3000);
    
    updateLight(GREEN);
    await delay(2000);
    
    updateLight(YELLOW);
    await delay(1000);
  }
}

// 动态调整灯的亮灭时间
const lightConfig = {
  [RED]: 3000,
  [GREEN]: 2000,
  [YELLOW]: 1000
};

async function switchLightWithConfig() {
  while (true) {
    for (const [state, duration] of Object.entries(lightConfig)) {
      updateLight(state);
      await delay(duration);
    }
  }
}
```

**富途特色考点：**
- 富途高频考察 async/await 的使用
- 结合实际场景说明异步编程的应用
- 考察对 Promise 的理解

---
