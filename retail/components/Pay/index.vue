<template>
  <div class="pay_page"  ref="payPage">
    <div>
      <div class="list">
        <div class="title"><span class="line"></span>商品列表</div>
        <div class="goods">
          <div v-for="(good, index) in cartGoods" :key="index" >
            <div class="good" v-for="(sku, sindex) in good.goodsSkuList" :key="sindex" v-show="sku.count > 0" >
              <div class="icon">
                <img :src="good.coverImage" alt="">
              </div>
              <div class="name">
                <div class="v">{{good.goodsName}}</div>
                <div class="spec">{{sku.spec}}</div>
              </div>
              <div class="other">
                <div class="price">￥{{sku.price}}</div>
                <div class="num">x {{sku.count}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="list">
        <div class="title">
          <span class="line"></span>订单统计
        </div>
        <div class="wrapper">
          <div class="item">
            <span class="label">商品总额</span>
            <span class="price"><span>￥{{totalPrice.toFixed(2)}}</span></span>
          </div>
          <div class="item">
            <span class="label"></span>
            <span class="price">实付：<span>￥{{totalPrice.toFixed(2)}}</span></span>
          </div>
        </div>
      </div>
      <div class="block"></div>
    </div>
    <div class="cart">
      <div class="content">
        <div class="content-left">
          实付：<span class="price">￥{{totalPrice.toFixed(2)}}</span>
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">立即付款</div>
        </div>
      </div>
    </div>
    <van-popup
      v-model="popupVisible"
      transition="popup-fade">
      <div class="msg-wrapper">
        <div class=""></div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import { Toast } from 'vant'
import BScroll from 'better-scroll'
import bridge from '../../../utils/bridge'
import storage from '../../../utils/storage'
import { isEmpty } from '../../../utils/lang'
import Bus from '../../global/bus'
import urls from '../../global/apis'

export default {
  name: 'v-pay',
  props: {
    shop: {
      type: Object
    },
  },
  data () {
    return {
      cartGoods: [],
      canPay: true,
      popupVisible: false
    }
  },
  created () {
    this.$nextTick(() => {
      this._initScroll()
    })
    Bus.$on('getCartGoods', (e) => {
      this.cartGoods = e
    })
  },
  computed: {
    totalPrice() {
      let total = 0
      this.cartGoods.forEach((good) => {
        good.goodsSkuList.forEach(sku => {
          total += sku.price * sku.count
        })
      })
      return total
    },
    payClass() {
      if (this.canPay) {
        return ''
      } else {
        return 'not-pay'
      }
    },
  },
  methods: {
    _initScroll() {
      this.pageScroll = new BScroll(this.$refs.payPage, {
        click: true,
      })
    },
    _payEnd() {
      Bus.$emit('emptyCart')
      Bus.$emit('reloadGoodsData')
      // 用于解决返回首屏，滚动插件无法滚动问题
      setTimeout(() => {
        Bus.$emit('reScroll')
      }, 200)
    },
    _doPay() {
      let goodsList = []
      this.cartGoods.forEach(goods => {
        goods.goodsSkuList.forEach(sku => {
          if (sku.count > 0) {
            goodsList.push({ 'skuNo': sku.skuNo, 'count': sku.count })
          }
        })
      })
      // 生成订单
      this.$http.post(urls.confirm, { 'shelfNo': this.shop.shelfNo, 'goodsList': goodsList }).then((response) => {
        if (isEmpty(response.data.data)) {
          Toast('下单失败')
          this.canPay = true
          return false
        }

        if (response.data && response.data.code === 0) {
          let orderNo = response.data.data.orderNo
          let orderAmount = response.data.data.orderAmount

          if (isEmpty(orderNo)) {
            // 当订单商品不足时，提示“购物车里部分商品已经失效，重新下单”
            Toast({ 'message': '购物车里部分商品已经失效，重新下单', 'duration': 3000 })
            setTimeout(() => {
              this.canPay = true
              this._payEnd()
              this.$router.replace(`/shelf/${this.shop.shelfNo}`)
            }, 3000)
            return false
          }

          // 起调支付
          bridge.call('base_payInner', {
            'tradeNo': orderNo,
            'amount': orderAmount * 100,
            'channel': ['PayChannelJCB'],
            'title': '无人货架订单',
            'billTimeOut': new Date().getTime() + 30 * 60 * 1000
          }, res => {
            this.canPay = true
            switch (res.code) {
              case '0000':
                // 清空购物车并跳转至成功页面
                this._payEnd()
                this.$router.replace(`/result?order_no=${orderNo}&order_amount=${orderAmount}`)
                break
              case '1000':
                // 支付失败
                break
              case '2000':
                // window.location.href = `jcgroup-jcy://jcy.jc/go?action=JCY_Order_DX_Order_Detail&orderNo=${this.orderNo}`
                // 取消支付，唤起订单详情页，页且清空购物车并返回店铺首
                bridge.call('base_schemeUrl', {
                  url: `jcgroup-jcy://jcy.jc/go?action=JCY_Order_DX_Order_Detail&orderNo=${orderNo}`
                })
                // bridge.call('base_openIdsOrderDetail', { 'orderNo': orderNo })
                this._payEnd()
                this.$router.replace(`/shelf/${this.shop.shelfNo}`)
                break
              default:
                break
            }
          })
        }
      })
    },
    pay() {
      if (!this.canPay) {
        return false
      }
      this.canPay = false
      // 判断有无登录
      bridge.call('base_userData', {}, res => {
        if (res && res.data && res.data.accessToken !== '') {
          storage.set('userData', res.data)
          this._doPay()
        } else {
          bridge.call('base_login', {}, res => {
            if (res.code === '0000') {
              storage.set('userData', res.data)
              this._doPay()
            }
            this.canPay = true
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.iphone .pay_page {
  top: 240px;
}

.iphonex .pay_page {
  top: 260px;
  bottom: 132px;
}

.iphonex .cart {
  height: 150px;

  .content-left {
    padding-bottom: 40px;
  }
  .content-right {
    .pay {
      padding-bottom: 40px;
    }
  }
}

.pay_page {
  position: absolute;
  top: 180px;
  bottom: 110px;
  width: 100%;
  overflow: hidden;
  background-color: #F5F5F5;

  .list {
    overflow: hidden;
    background-color: #FFFFFF;
    margin-top: 20px;

    .title {
      height: 100px;
      line-height: 100px;
      border-bottom: 0.01rem solid #E5E5E5;
      font-size: 18px;
      padding-left: 15px;

      .line {
        width: 6px;
        height: 24px;
        border-radius: 3px;
        display: inline-block;
        background-color: #FFDA09;
        vertical-align: middle;
        margin-right: 20px;
      }
    }

    .goods {
      margin: 0 30px;
      
      .good {
        padding: 15px 0;
        border-bottom: 0.01rem solid #F5F5F5;
        overflow: hidden;

        .icon {
          float: left;
          width: 120px;
          height: 120px;
          overflow: hidden;
          margin-right: 40px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .name {
          float: left;
          max-width: 500px;

          .v {
            font-size: 15px;
            margin-bottom: 10px;
          }

          .spec {
            color: #999999;
            font-size: 13px;
          }
        }

        .other{
          float: right;
          text-align: right;

          .price {
            color: #F12C20;
            font-size: 15px;
            font-weight: bold;
          }
          .num {
            margin-top: 30px;
            color: #353535;
            font-size: 13px;
          }
        }
      }
    }

    .wrapper {
      margin: 0 30px;
      .item {
        height: 100px;
        line-height: 100px;
        display: flex;
        justify-content: space-between;
        border-bottom: 0.01rem solid #E5E5E5;

        .label {
          font-size: 15px;
        }

        .price {
          font-size: 15px;
          span {
            font-weight: bold;
            color: #F12C20;
            font-size: 15px;
          }
        }

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  .block {
    width: 100%;
    height: 160px;
  }
}

.cart {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 50;
  width: 100%;
  height: 110px;
  line-height: 110px;

  .content {
    display: flex;
    background: #4E4E4E;
    .content-left {
      flex: 1;
      margin-left: 30px;
      color: #ffffff;
      font-size: 15px;

      .price {
        font-size: 18px;
        font-weight: bold;
      }
    }
    .content-right {
      width: 290px;
      .pay {
        height: 110px;
        line-height: 110px;
        text-align: center;
        font-size: 18px;
        font-weight: 700;
        background: #FFDA09;
        color: #353535;

        &.not-pay {
            background: #C6C8C9;
            color: #999999;
          }
      }
    }
  }
}

</style>
