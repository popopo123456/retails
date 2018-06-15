<template>
  <div id="app" :class="{'iphone': isIphone, 'iphonex': isIphoneX}">
    <v-header />
    <keep-alive>
      <router-view :shop="shop" />
    </keep-alive>
  </div>
</template>

<script>
import urls from '../global/apis'
import Bus from '../global/bus'
import { browser, isInJcy } from '../../utils/utils'
import Header from '../components/Header.vue'

export default {
  name: 'App',
  data() {
    return {
      shop: {
        id: this.$route.params.id
      },
      isIphone: false,
      isIphoneX: false
    }
  },
  created () {
    this.$http.post(urls.shop, { 'shelfNo': this.shop.id }).then((response) => {
      if (response.data && response.data.code === 0) {
        this.shop = Object.assign({}, this.shop, response.data.data)
      }
      Bus.$emit('getShop', this.shop)
    })

    // 获取IHPONE型号,用于匹配在隐藏原生导航栏时，不同型号的iphone顶部Header栏与手机状态栏高度差，以及适配iphoneX固定底部的圆角的高度
    isInJcy(res => {
      if (res) {
        if (browser.versions.iphone) {
          this.isIphone = true
          if (browser.versions.iphoneX) {
            this.isIphoneX = true
          }
        }
      }
    })
  },
  components: {
    'v-header': Header
  }
}
</script>

<style lang="less">
#app {
  font-family: 'PingFangSC-Regular','Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
