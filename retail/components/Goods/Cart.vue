<template>
  <div>
    <div class="cart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo">
              <img :src="cartImg" alt="">
            </div>
            <div class="num" v-show="totalCount>0">{{totalCount}}</div>
          </div>
          <div class="price">
            <span v-show="totalCount>0" class="highlight">￥{{totalPrice.toFixed(2)}}</span>
            <span v-show="totalCount==0">未选购商品</span>
          </div>
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">去结算</div>
        </div>
      </div>
      <div class="ball-container">
        <div v-for="(ball, index) in balls" :key="index">
          <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="fold">
        <div class="cart-list" v-show="listShow">
          <div class="list-header">
            <span class="line"></span>
            <h1 class="title">已选商品</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li v-for="(good, i) in selectedGoods" :key="i">
                <div class="good" v-for="(goodsSku, j) in good.goodsSkuList" :key="j" v-show="goodsSku.count > 0" >
                  <span class="title">
                    <div class="name">{{good.goodsName}}</div>
                    <div class="spec">{{goodsSku.spec}}</div>
                  </span>
                  <span class="price">￥{{(goodsSku.price*goodsSku.count).toFixed(2)}}</span>
                  <div class="operator-wrapper">
                    <v-operator @add="addGood" :good="good" :goodsSku="goodsSku"></v-operator>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" @click="hideList" v-show="listShow"></div>
    </transition>
  </div>
</template>

<script>
import Bus from '../../global/bus'
import urls from '../../global/apis'
import BScroll from 'better-scroll'
import Operator from './Operator'
import cart from '../../assets/cart.png'

export default {
  name: 'v-cart',
  props: {
    shop: {
      type: Object
    },
    selectedGoods: {
      type: Array,
      default() {
        return [
          {
            price: 10,
            count: 1
          }
        ]
      }
    },
  },
  data() {
    return {
      balls: [
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        }
      ],
      dropBalls: [],
      fold: true,
      cartImg: cart,
    }
  },
  created() {
    Bus.$on('emptyCart', (e) => {
      this.empty()
    })
  },
  computed: {
    totalPrice() {
      let total = 0
      this.selectedGoods.forEach((good) => {
        good.goodsSkuList.forEach(sku => {
          total += sku.price * sku.count
        })
      })
      return total
    },
    totalCount() {
      let count = 0
      this.selectedGoods.forEach((good) => {
        count += good.count
      })
      return count
    },
    payClass() {
      if (this.totalPrice === 0) {
        return 'not-enough'
      } else {
        return 'enough'
      }
    },
    listShow() {
      if (!this.totalCount) {
        this.fold = true // eslint-disable-line
        return false
      }
      let show = !this.fold
      if (show) {
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$refs.listContent, { // eslint-disable-line
              click: true
            })
          } else {
            this.scroll.refresh()
          }
        })
      }
      return show
    },
    selectedGoodsSkuList() {
      let list = []
      this.selectedGoods.forEach(goods => {
        goods.goodsSkuList.forEach(goodsSku => {
          if (goodsSku.count > 0) {
            goodsSku.goodsName = goods.goodsName
            list.push(goodsSku)
          }
        })
      })
      return list
    }
  },
  methods: {
    drop(el) {
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i]
        if (!ball.show) {
          ball.show = true
          ball.el = el
          this.dropBalls.push(ball)
          return
        }
      }
    },
    toggleList() {
      if (!this.totalCount) {
        return
      }
      this.fold = !this.fold
    },
    hideList() {
      this.fold = true
    },
    empty() {
      this.selectedGoods.forEach((good) => {
        good.count = 0
        good.goodsSkuList.forEach(sku => {
          sku.count = 0
        })
      })
    },
    pay() {
      if (this.totalPrice === 0) {
        return
      }
      // 检验购物车，并去除已下架或者库存不足的商品
      let goodsList = []
      this.selectedGoods.forEach(goods => {
        goods.goodsSkuList.forEach(sku => {
          if (sku.count > 0) {
            goodsList.push({ 'skuNo': sku.skuNo, 'count': sku.count })
          }
        })
      })
      
      this.$http.post(urls.check, { 'shelfNo': this.shop.shelfNo, 'goodsList': goodsList }).then((response) => {
        if (response.data && response.data.code === 0) {
          // 根据返回量不足的sku商品，清除对应的sku商品
          response.data.data.forEach(skuNo => {
            this.selectedGoods.forEach(good => {
              good.goodsSkuList.forEach(sku => {
                if (sku.skuNo === skuNo) {
                  good.count -= sku.count
                  sku.count = 0
                }
              })
            })
          })

          this.$router.push('/pay')
          setTimeout(() => {
            Bus.$emit('getCartGoods', this.selectedGoods)
          }, 50)
        }
      })
    },
    addGood(target) {
      this.drop(target)
    },
    beforeDrop(el) {
      let count = this.balls.length
      while (count--) {
        let ball = this.balls[count]
        if (ball.show) {
          let rect = ball.el.getBoundingClientRect()
          let x = rect.left - 32
          let y = -(window.innerHeight - rect.top - 22)
          el.style.display = ''
          el.style.webkitTransform = `translate3d(0,${y}px,0)`
          el.style.transform = `translate3d(0,${y}px,0)`
          let inner = el.getElementsByClassName('inner-hook')[0]
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`
          inner.style.transform = `translate3d(${x}px,0,0)`
        }
      }
    },
    dropping(el, done) {
      /* eslint-disable no-unused-vars */
      let rf = el.offsetHeight
      this.$nextTick(() => {
        el.style.webkitTransform = 'translate3d(0,0,0)'
        el.style.transform = 'translate3d(0,0,0)'
        let inner = el.getElementsByClassName('inner-hook')[0]
        inner.style.webkitTransform = 'translate3d(0,0,0)'
        inner.style.transform = 'translate3d(0,0,0)'
        el.addEventListener('transitionend', done)
      })
    },
    afterDrop(el) {
      let ball = this.dropBalls.shift()
      if (ball) {
        ball.show = false
        el.style.display = 'none'
      }
    },
  },
  components: {
    'v-operator': Operator
  }
}
</script>

<style lang="less" scoped>
  .iphonex .cart {
    height: 150px;
    .content {
      .content-left {
        padding-bottom: 20px;
      }
      .content-right {
        .pay {
          padding-bottom: 20px;
        }
      }
    }
  }
  
  .cart {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 50;
    width: 100%;
    height: 110px;

    .content {
      display: flex;
      background: #4E4E4E;
      font-size: 0;
      color: rgba(255, 255, 255, 0.4);
      .content-left {
        flex: 1;
        .logo-wrapper {
          display: inline-block;
          vertical-align: top;
          position: relative;
          top: -20px;
          margin: 0 16px 0 22px;
          padding: 3px;
          width: 120px;
          height: 120px;
          box-sizing: border-box;
          box-shadow: 0 0 4px #8a8280;
          border-radius: 50%;
          background: #ffffff;
          .logo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            // background: #2b343c;
            display: flex;
            justify-content: center;
            align-items: center;

            img {
              width: 44px;
              height: 50px;
            }

            &.highlight {
              background: #FFDA09;
            }

            .icon-shopping_cart {
              font-size: 15px;
              color: #8a8280;
              &.highlight {
                color: #fff;
              }
            }
          }
          .num {
            position: absolute;
            top: 0;
            right: 0;
            min-width: 32px;
            max-width: 48px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            border-radius: 16px;
            font-size: 10px;
            font-weight: 700;
            color: #fff;
            background: rgb(240, 20, 20);
            box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.4);

          }
        }
        .price {
          display: inline-block;
          vertical-align: top;
          margin-top: 30px;
          line-height: 50px;
          padding-right: 12px;
          box-sizing: border-box;
          font-weight: 700;
          color: #fff;
          
          .highlight {
            font-weight: bold;
          }
          span {
            color: #fff;
            font-size: 16px;
            &.highlight {
              font-size: 20px;
            }
          }
        }
        .desc {
          display: inline-block;
          vertical-align: top;
          margin: 24px 0 0 24px;
          line-height: 48px;
          font-size: 15px;
        }
      }
      .content-right {
        /*flex: 0 0 105px;*/
        width: 290px;
        .pay {
          height: 110px;
          line-height: 110px;
          text-align: center;
          font-size: 18px;
          font-weight: 700;
          &.not-enough {
            background: #C6C8C9;
            color: #999999;
          }
          &.enough {
            background: #FFDA09;
            color: #222222;
          }
        }
      }
    }

    .ball-container {
      .ball {
        position: fixed;
        left: 32px;
        bottom: 20px;
        z-index: 200;
        transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41);
        .inner {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #FFDA09;
          transition: all 0.4s linear;
        }
      }
    }

    .cart-list {
      position: absolute;
      left: 0;
      top: 0;
      z-index: -1;
      width: 100%;
      transform: translate3d(0, -100%, 0);
      &.fold-enter-active, &.fold-leave-active {
        transition: all 0.5s;
      }

      &.fold-enter, &.fold-leave-active {
        transform: translate3d(0, 0, 0);
      }

      .list-header {
        height: 88px;
        line-height: 88px;
        padding: 0 9px;
        background: #F2F2F2;
        
        .line {
          float: left;
          width: 6px;
          height: 24px;
          border-radius: 3px;
          display: block;
          background-color: #FFDA09;
          margin: 30px 30px 0 0;
        }

        .title {
          float: left;
          font-size: 18px;
        }

        .empty {
          float: right;
          font-size: 15px;
          color: #606060;
        }
      }

      .list-content {
        padding: 0 9px;
        max-height: 400px;
        overflow: hidden;
        background: #fff;
        .good {
          position: relative;
          padding: 6px 0;
          box-sizing: border-box;
          display: table;
          width: 100%;

          &:after {
            display: block;
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            border-top: 0.01rem solid rgba(7, 17, 27, 0.1);
            content: ' '
          }

          .title {
            display: table-cell;
            width: 60%;

            .name {
              line-height: 50px;
              font-size: 15px;
            }

            .spec {
              color: #999999;
              font-size: 13px;
            }
          }

          .price {
            display: table-cell;
            font-size: 13px;
            font-weight: 700;
            color: rgb(240, 20, 20);
            vertical-align: middle;
          }

          .operator-wrapper {
            width: 30%;
            display: table-cell;
            text-align: right;
            vertical-align: middle;
          }
        }
      }

    }
  }

  .list-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 40;
    backdrop-filter: blur(10px);
    opacity: 1;
    background: rgba(7, 17, 27, 0.6);
    &.fade-enter-active, &.fade-leave-active {
      transition: all 0.5s;
    }

    &.fade-enter, &.fade-leave-active {
      opacity: 0;
      background: rgba(7, 17, 27, 0);
    }
  }
</style>
