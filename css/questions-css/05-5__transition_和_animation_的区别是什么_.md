# 5. transition 和 animation 的区别是什么？

**答案：**

**区别对比：**

```css
/* transition：过渡效果 */
.box {
  width: 100px;
  height: 100px;
  background: blue;
  transition: all 0.3s ease;
}

.box:hover {
  width: 200px;
  background: red;
}

/* animation：动画效果 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.box {
  animation: slideIn 0.5s ease-in-out;
}

/* 区别：
   1. transition：需要触发（如 hover）
   2. animation：可以自动执行
   3. transition：只能定义开始和结束状态
   4. animation：可以定义多个关键帧
*/
```

**场景题：**

```css
/* 场景 1：按钮悬停效果 */
.button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  transition: all 0.3s ease;
}

.button:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* 场景 2：加载动画 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 场景 3：淡入淡出 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* 场景 4：滑动效果 */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.5s ease-out;
}
```