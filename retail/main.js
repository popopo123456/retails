// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueResource from 'vue-resource'
import { Popup, Toast } from 'vant'

import App from './app/App.vue'
import router from './router'
import { isInJcy, getBasePrefix, initMlink } from '../utils/utils'
import bridge from '../utils/bridge'
import storage from '../utils/storage'
import { get, isEmpty } from '../utils/lang'

import './app/index.less'

Vue.use(Popup)
Vue.use(VueResource, Toast)
Vue.config.productionTip = false

Vue.http.interceptors.push((request, next) => {
  // 在请求之前可以进行一些预处理和配置
  request.method = 'POST'
  
  const userData = storage.get('userData')
  const accessToken = get(userData, 'accessToken')
  if (!isEmpty(accessToken)) {
    request.headers.set('accessToken', accessToken)
  }

  // continue to next interceptor
  next((response) => {
    // alert(JSON.stringify(response))
    // 在响应之后传给then之前对response进行修改和逻辑判断。对于token时候已过期的判断，就添加在此处，页面中任何一次http请求都会先调用此处方法
    if (response.status >= 200 && response.status < 300) {
      if (response.body.code !== 0) {
        Toast(response.body.errmsg)
      }
      return response
    } else {
      Toast('请求异常')
      let error = new Error(response.statusText)
      error.res = response
      throw error
    }
  })
})

isInJcy(res => {
  if (res) {
    // 隐藏原生导航栏
    bridge.call('UI_JSNavigationBarControl', { hidden: true })
  } else {
    const basePrefix = getBasePrefix('retail')
    const main = document.getElementById('app')
    const downloadWrap = document.getElementById('downloadWrap')
    // 显示底部下载区域 padding
    main.style.paddingBottom = '1.6rem'
    // 下载按钮
    downloadWrap.style.display = 'flex'
    // 不在 app 里面，直接触发下载动作
    const schemeurl = `jcgroup-jcy://jcy.jc/go?action=JCInnerWebView&url=${basePrefix}`
    initMlink(schemeurl)
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
