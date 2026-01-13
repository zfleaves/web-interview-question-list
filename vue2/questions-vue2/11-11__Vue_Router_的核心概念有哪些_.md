# 11. Vue Router 的核心概念有哪些？

**答案：**

**1. 基础配置：**

```javascript
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue') // 懒加载
  },
  {
    path: '/user/:id',
    name: 'User',
    component: User,
    props: true // 路由参数作为 props 传递
  }
];

const router = new VueRouter({
  mode: 'history', // hash 或 history
  base: process.env.BASE_URL,
  routes
});

export default router;
```

**2. 动态路由匹配：**

```javascript
// 路由配置
{
  path: '/user/:id',
  component: User
}

// 访问
this.$route.params.id

// 多个参数
{
  path: '/user/:id/post/:postId',
  component: UserPost
}

// 可选参数
{
  path: '/user/:id?',
  component: User
}
```

**3. 嵌套路由：**

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      {
        path: '',
        component: UserHome
      },
      {
        path: 'profile',
        component: UserProfile
      },
      {
        path: 'posts',
        component: UserPosts
      }
    ]
  }
];

// User.vue
<template>
  <div>
    <router-view></router-view>
  </div>
</template>
```

**4. 编程式导航：**

```javascript
// 字符串
this.$router.push('/home');

// 对象
this.$router.push({ path: '/home' });

// 命名路由
this.$router.push({ name: 'user', params: { userId: 123 }});

// 带查询参数
this.$router.push({ path: '/user', query: { plan: 'private' }});

// 替换当前路由
this.$router.replace('/home');

// 前进/后退
this.$router.go(-1);
this.$router.back();
this.$router.forward();
```

**5. 命名视图：**

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      header: Header
    }
  }
];

// App.vue
<template>
  <div>
    <router-view name="header"></router-view>
    <div class="container">
      <router-view name="sidebar"></router-view>
      <router-view></router-view>
    </div>
  </div>
</template>
```

**6. 路由守卫：**

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 即将进入的目标路由
  // from: 当前导航正要离开的路由
  // next: 必须调用该方法来 resolve 这个钩子
  
  if (to.meta.requiresAuth) {
    if (isAuthenticated()) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  next();
});

// 全局后置钩子
router.afterEach((to, from) => {
  // 不接受 next 函数
  document.title = to.meta.title || 'Default Title';
});

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (checkPermission()) {
        next();
      } else {
        next('/403');
      }
    }
  }
];

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不能获取组件实例 `this`
    next(vm => {
      // 通过 `vm` 访问组件实例
    });
  },
  
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 可以访问组件实例 `this`
    this.name = to.params.name;
    next();
  },
  
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('确定要离开吗？');
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  }
};
```

**7. 路由元信息：**

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: 'Admin Panel'
    }
  }
];

// 在导航守卫中使用
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // ...
  }
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    next('/403');
  }
});
```

**8. 滚动行为：**

```javascript
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});
```
