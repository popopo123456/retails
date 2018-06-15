<template>
  <div class="result-page">
    <i class="icon">
      <img :src="successImg" alt="">
    </i>
    <div class="msg">支付成功</div>
    <div class="time">{{second}}秒后自动返回首页</div>
    <div class="price">¥{{parseFloat(price).toFixed(2)}}</div>
    <div class="btns">
      <span class="btn btn-primary" @click.stop.prevent="goHome">继续购买</span>
      <span class="btn btn-default" @click.stop.prevent="viewOrder">查看订单详情</span>
    </div>
  </div>
</template>

<script>
import Bus from '../../global/bus'
import bridge from '../../../utils/bridge'
import success from '../../assets/success.png'

export default {
  name: 'v-pay-result',
  props: {
    shop: {
      type: Object
    }
  },
  data () {
    return {
      successImg: success,
      second: 5,
      timer: '',
      price: 0,
      orderNo: this.$route.query.order_no
    }
  },
  created () {
  },
  activated() {
    // alert(`price${this.$route.query.order_amount}`)
    this.price = this.$route.query.order_amount
    this.orderNo = this.$route.query.order_no
    if (this.timer !== '') {
      clearInterval(this.timer)
    }
    this.second = 5
    this.timer = setInterval(() => {
      this.second--
      if (this.second === 0) {
        clearInterval(this.timer)
        this.emitScroll()
        this.$router.replace(`/shelf/${this.shop.shelfNo}`)
      }
    }, 1000)
  },
  methods: {
    emitScroll() {
      // 用于解决返回首屏，滚动插件无法滚动问题
      setTimeout(() => {
        Bus.$emit('reScroll')
      }, 200)
    },
    goHome() {
      this.$router.replace(`/shelf/${this.shop.shelfNo}`)
      this.emitScroll()
    },
    viewOrder() {
      // window.location.href = `jcgroup-jcy://jcy.jc/go?action=JCY_Order_DX_Order_Detail&orderNo=${this.orderNo}`
      bridge.call('base_schemeUrl', {
        url: `jcgroup-jcy://jcy.jc/go?action=JCY_Order_DX_Order_Detail&orderNo=${this.orderNo}`
      })
      // bridge.call('base_openIdsOrderDetail', { 'orderNo': this.orderNo })
      this.$router.replace(`/shelf/${this.shop.shelfNo}`)
      this.emitScroll()
    }
  }
}
</script>

<style lang="less" scoped>
.iphone .icon {
  top: 420px;
}

.iphonex .icon {
  top: 460px;
}

.result-page {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  overflow: hidden;
  background-color:  rgb(245, 245, 245);
  text-align: center;

  .icon {
    width: 200px;
    height: 200px;
    line-height: 200px;
    display: inline-block;
    margin-top: 300px;
    background-color: rgb(31, 185, 34);
    border-radius: 50%;

    img {
      vertical-align: middle;
      text-align: center;
      width: 106px;
      height: 76px;
      overflow: hidden;
    }
  }

  .msg {
    margin-top: 50px;
    line-height: 56px;
    height: 56px; 
    font-size: 20px;
    font-family:PingFangSC-Regular;
    color:rgba(0,0,0,1);
  }

  .time {
    margin-top: 20px;
    height: 40px; 
    font-size: 14px;
    font-family:PingFangSC-Regular;
    color: rgba(136,136,136,1);
    line-height: 40px;
  }

  .price {
    margin-top: 30px;
    height: 74px; 
    font-size: 32px;
    font-family: DINAlternate-Bold;
    color: rgba(0,0,0,1);
    line-height: 74px;
  }

  .btns {
    padding: 30px 30px 0;
    
    .btn {
      display: block;
      height: 84px;
      line-height: 84px;
      border: 0.01rem solid #FFDA09;
      background:#FFDA09;
      border-radius: 10px;
      font-size: 18px;
      color: #353535;

      &.btn-default {
        margin-top: 30px;
        border: 0.01rem solid #eeeeee;
        background: #FFFFFF;
      }
    }

  }
}
</style>
