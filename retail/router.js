import Vue from 'vue'
import Router from 'vue-router'
import Bus from './global/bus.js'

// 模块
import Goods from './components/Goods'
import Shop from './components/Shop'
import Pay from './components/Pay'
import Result from './components/Pay/result'
import details from './components/o2o/details'

Vue.use(Router)

const routes = [
  {
    path: '/shop',
    component: Shop
  }, {
    path: '/shelf/:id',
    component: Goods,
    props: true
  }, {
    path: '/pay',
    component: Pay
  }, {
    path: '/result',
    component: Result
  }, {
    path: '/details',
    component: details
  },
  // 其他页面
  {
    path: '*',
    component: {
      render (h) {
        return h('div', {
          staticClass: 'flex flex-main-center',
          attrs: {
            style: 'width:100%;font-size:32px'
          }
        }, 'Page not found')
      }
    }
  }]

const router = new Router({
  // mode: 'history',
  linkActiveClass: 'active',
  routes
})

router.beforeEach((to, from, next) => {
  Bus.$emit('routeChange', {
    to: to,
    from: from,
    next: next
  })
  next()
})

export default router
