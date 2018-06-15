<template>
  <header class="nav-bar" v-show="isShow">
    <div class="nav-bar_left" @click.stop.prevent="back">
      <i class="iconfont nav-bar_arrow">&#xe779;</i>
    </div>
    <div class="title">
      <span v-show="!isHome">{{title}}</span>
      <img :src="titleImg" alt="" v-show="isHome">
    </div>
    <div class="name"><img :src="addressImg" alt="">{{shop.shelfName}}</div>
  </header>
</template>

<script>
import Bus from '../global/bus'
import bridge from '../../utils/bridge'
import logo from '../assets/logo.png'
import address from '../assets/address.png'

export default {
  name: 'v-header',
  data () {
    return {
      title: '',
      shop: {
        shelfName: ''
      },
      isHome: false,
      isShow: true,
      titleImg: logo,
      addressImg: address,
    }
  },
  created () {
  },
  mounted() {
    Bus.$on('routeChange', (e) => {
      this.changeTitle(e.to)
    })
    Bus.$on('getShop', (shop) => {
      this.shop = shop
      this.changeTitle(this.$route)
    })
  },
  methods: {
    back() {
      if (this.isHome) {
        bridge.call('UI_closeWebView')
      } else {
        this.$router.history.go(-1)
      }
    },
    changeTitle(route) {
      const PathName = route.path.split('/')[1]
      switch (PathName) {
        case 'pay':
          this.title = '确认下单'
          this.isHome = false
          this.isShow = true
          break
        case 'result':
          this.title = ''
          this.isHome = false
          this.isShow = false
          break
        default:
          this.title = ''
          this.isHome = true
          this.isShow = true
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>
.iphone .nav-bar {
  padding-top: 20px;
}

.iphonex .nav-bar {
  padding-top: 40px;
}

.nav-bar {
  height: 100px;
  line-height: 100px;
  position: relative;
  -webkit-user-select: none;
  user-select: none;
  text-align: center;
  background-color: #FFDA09;
  border-bottom: 0.01rem solid #FFDA09;

  .title {
    height: 98px;
    span {
      font-size: 20px;
      font-weight: bold;
      line-height: 48px;
      vertical-align: middle;
    }
    img {
      height: 60px;
      vertical-align: middle;
    }
  }

  .name {
    height: 80px;
    line-height: 80px;
    text-align: left;
    border-bottom: 0.01rem solid #F0F0F0;
    background-color: #FFFFFF;

    img {
      width: 20px;
      height: 24px;
      vertical-align: middle;
      margin: -6px 10px 0 30px;
    }
  }

  &_left,
  &_right {
    bottom: 0;
    font-size: 14px;
    position: absolute;
  }

  &_left {
    left: 20px;
  }

  .iconfont {
    color: #0F050D;
    vertical-align: middle;
    font-size: 24px;
  }

  &_arrow {
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
  }
}
</style>
