<template>
  <div>
    <div v-show="shop.shelfName" class="goods_page">
      <div class="classify_wrapper" ref="classifyWrapper">
        <ul>
          <li :key="index" v-for="(item, index) in goods" class="classify" :class="{'current': finalIndex === index}"
              @click="selectClassify(index, $event)" ref="classifyList">
            <span class="classify_content">
              {{ item.categoryName }}
            </span>
          </li>
        </ul>
      </div>
      <div class="goods_wrapper" ref="goodsWrapper">
        <ul>
          <li v-for="(classify, cIndex) in goods" :key="cIndex" :id="classify.categoryNo" ref="goodList">
            <h1 class="goods_wrapper-title"><span class="line"></span>{{ classify.categoryName }}</h1>
            <ul>
              <li v-for="(good, fIndex) in classify.clientGoodsVOList" :key="fIndex" class="good">
                <div class="icon">
                  <img :src="good.coverImage">
                </div>
                <div class="content">
                  <div class="title">
                    <h2 class="name">{{good.goodsName}}</h2>
                    <div class="price">
                      <span class="now" v-if="good.goodsSkuList.length === 1">￥{{good.goodsSkuList[0].price}}</span>
                      <span class="now" v-if="good.goodsSkuList.length > 1">￥{{good.price.toFixed(2)}}<span>起</span></span>
                    </div>
                  </div>
                  <div class="operator-wrapper">
                    <v-operator @add="addGood" @show="showSpec" :good="good" />
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <v-cart
        ref="cart"
        :selectedGoods="selectedGoods"
        :shop="shop"
      />
      <van-popup v-model="popupVisible" transition="popup-fade">
        <div  class="spec-wrapper">
          <div class="title">
            <span class="line"></span>
            {{good.goodsName}}
            <img :src="delImg" alt=""  @click.stop.prevent="closePopup">
          </div>
          <div class="content" ref="specContentWrapper">
            <div>
              <div v-for="(spec, index) in good.goodsSpecsList" :key="index" :id="spec.specNo" class="items">
                <div class="items_title">{{spec.specName}}</div>
                <div class="item">
                  <i v-for="(info, sindex) in spec.goodsInfoSpecsList" :key="sindex" :id="info.specInfoNo" class="option"  @click.stop.prevent="chooseSpec(info, spec, $event)" :class="{'current': !!info.checkedFlag}">{{info.specInfoName}}</i>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom">
            <span class="price">￥{{goodsSku.price}}</span>
            <span class="spec">（{{goodsSku.spec}}）</span>
            <i class="btn" v-show="goodsSku.count === 0" @click.stop.prevent="addCart" :class="{'disabled': goodsSku.disabled}">加入购物车</i>
            <span class="oper" v-show="goodsSku.count > 0">
                <transition name="move">
                  <i class="icon decrease" v-show="goodsSku.count > 0" @click.stop.prevent="decreaseCart">-</i>
                </transition>
                <div class="count" v-show="goodsSku.count > 0">{{goodsSku.count}}</div>
                <i class="icon add" @click.stop.prevent="addCart">+</i>
            </span>
          </div>
        </div>
      </van-popup>
    </div>
    <div v-if="noShelf" class="goods_none">
      <div class="msg">货架走丢了<br>小哥哥小姐姐快帮忙找回来~~~~~</div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'
import BScroll from 'better-scroll'
import Bus from '../../global/bus'
import urls from '../../global/apis'
import Operator from './Operator'
import Cart from './Cart'
import del from '../../assets/del.png'

export default {
  name: 'v-goods',
  props: {
    shop: {
      type: Object
    }
  },
  components: {
    'v-operator': Operator,
    'v-cart': Cart
  },
  data () {
    return {
      goods: [],
      listHeight: [],
      scrollY: 0,
      popupVisible: false,
      good: {},
      goodsSku: {
        price: 0,
        count: 0,
        spec: '',
        disabled: false
      },
      noShelf: false,
      delImg: del,
      selectedIndex: 0,
      finalIndex: 0,
      isSelected: false,
    }
  },
  created () {
    this.$http.post(urls.goods, { 'shelfNo': this.shop.id }).then((response) => {
      if (response.data && response.data.code === 0) {
        this.goods = response.data.data
        this.handleGoods()
        this.$nextTick(() => {
          this._initScroll()
          this._calculateHeight()
        })
      }
    })

    Bus.$on('getShop', (shop) => {
      if (!shop.shelfName) {
        this.noShelf = true
      }
    })

    Bus.$on('reloadGoodsData', () => {
      this.$http.post(urls.goods, { 'shelfNo': this.shop.id }).then((response) => {
        if (response.data && response.data.code === 0) {
          this.goods = response.data.data
          this.handleGoods()
        }
      })
    })

    Bus.$on('reScroll', () => {
      this.classifyScroll.refresh()
      this.goodsScroll.refresh()
    })

    Bus.$on('changeGoods', goodsSku => {
      this.goods.map(category => {
        category.clientGoodsVOList.map(goods => {
          goods.goodsSkuList.forEach(sku => {
            if (sku.key === goodsSku.key) {
              sku = goodsSku
            }
          })
        })
      })
    })
  },
  computed: {
    currentIndex() {
      for (let i = 0; i < this.listHeight.length; i++) {
        let height1 = this.listHeight[i]
        let height2 = this.listHeight[i + 1]
        if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
          this._followScroll(i)
          return i
        }
      }
      return 0
    },
    selectedGoods() {
      let goods = []
      this.goods.forEach((classify) => {
        classify.clientGoodsVOList.forEach((good) => {
          if (good.count) {
            goods.push(good)
          }
        })
      })
      return goods
    },
  },
  methods: {
    handleGoods() {
      // 重新组装方便展示的数据结构
      this.goods.map(category => {
        category.clientGoodsVOList.map(goods => {
          let goodsSkuList = []
          // 组装描述属性
          Object.keys(goods.goodsSkuMap).map(keys => {
            // 拆分key并找到其对应的属性描述
            let specInfoList = []
            keys.split('##').map(key => {
              goods.goodsSpecsList.map(spec => {
                let info = spec.goodsInfoSpecsList.filter(info => info.specInfoNo === key)
                if (info.length > 0) specInfoList.push(info[0])
              })
            })
            goodsSkuList.push(Object.assign({}, goods.goodsSkuMap[keys], { 'key': keys, 'spec': specInfoList.map(v => v.specInfoName).join('+'), 'count': 0 }))
          })
          goods.goodsSkuList = goodsSkuList
        })
      })
    },
    selectClassify(index, event) {
      this.finalIndex = index
      if (!event._constructed) {
        return
      }
      let goodList = this.$refs.goodList
      let el = goodList[index]
      this.selectedIndex = index
      this.isSelected = true
      this.goodsScroll.scrollToElement(el, 300)
    },
    addGood (target) {
      this._drop(target)
    },
    decreaseCart (event) {
      this.goods.forEach(item => {
        item.clientGoodsVOList.forEach(good => {
          if (good.goodsNo === this.good.goodsNo) {
            good.goodsSkuList.forEach(sku => {
              // 当选中sku商品的数量大于0时，数量减一
              if (this.goodsSku.key === sku.key && sku.count > 0) {
                sku.count--
                good.count--
              }
            })
          }
        })
      })
    },
    addCart (event) {
      if (this.goodsSku.disabled) {
        return false
      }
      // 匹配商品列表中对应的SKU
      this.goods.forEach(item => {
        item.clientGoodsVOList.forEach(good => {
          if (good.goodsNo === this.good.goodsNo) {
            good.goodsSkuList.forEach(sku => {
              // 当选中sku商品的库存足够时，数量加一
              if ((this.goodsSku.key === sku.key)) {
                if (parseInt(sku.stock) <= sku.count) {
                  Toast('库存不足')
                  return
                }
                sku.count++
                if (!this.good.count) {
                  this.$set(this.good, 'count', 1)
                } else {
                  this.good.count++
                }
              }
            })
          }
        })
      })
    },
    showSpec (good) {
      // 显示选择规格弹窗
      this.popupVisible = true
      this.good = good
      // 设置默认选中规格
      // 依次判断good.goodsSkuList中的count的值,当发现第一个count存在且大于0的，则设置为默认选项
      // 假如全都不存在，则设置每类规格的第一个选项为默认选项
      let hasSelect = false // 已有添加指定规格的商品
      let specIds = []

      this.good.goodsSkuList.forEach(goodsSku => {
        // 当前规格商品已选数量为0或者已有前置选中商品，则跳出本次循环
        if (goodsSku.count === 0 || hasSelect) {
          return false
        }

        hasSelect = true
        this.goodsSku = goodsSku
        const nos = goodsSku.key.split('##')
        this.good.goodsSpecsList.forEach(spec => {
          spec.goodsInfoSpecsList.forEach(info => {
            if (nos.includes(info.specInfoNo)) {
              info.checkedFlag = true
            } else {
              info.checkedFlag = false
            }
          })
        })
      })

      if (!hasSelect) {
        this.good.goodsSpecsList.forEach(spec => {
          // 在无添加数量的商品时，所有选项归置为未选中
          spec.goodsInfoSpecsList.forEach(info => {
            info.checkedFlag = false
          })
          // 设置第一个选项为默认选中
          spec.goodsInfoSpecsList[0].checkedFlag = true
          specIds.push(spec.goodsInfoSpecsList[0].specInfoNo)
        })

        this.good.goodsSkuList.forEach(sku => {
          if (sku.key === specIds.join('##')) {
            this.goodsSku = sku
            if (parseInt(this.goodsSku.stock) === 0) {
              this.goodsSku.disabled = true
            } else {
              this.goodsSku.disabled = false
            }
          }
        })
      }
    },
    chooseSpec(info, spec, event) {
      spec.goodsInfoSpecsList.forEach(info => {
        info.checkedFlag = false
      })
      info.checkedFlag = true

      let noArr = []
      this.good.goodsSpecsList.map(spec => {
        spec.goodsInfoSpecsList.map(info => {
          if (info.checkedFlag) {
            noArr.push(info.specInfoNo)
          }
        })
      })

      this.goodsSku = this.good.goodsSkuList.filter(sku => noArr.join('##') === sku.key)[0]
      if (parseInt(this.goodsSku.stock) === 0) {
        this.goodsSku.disabled = true
      } else {
        this.goodsSku.disabled = false
      }
    },
    closePopup() {
      this.popupVisible = false
    },
    _drop (target) {
      // 体验优化,异步执行下落动画
      this.$nextTick(() => {
        this.$refs.cart.drop(target)
      })
    },
    _initScroll() {
      this.classifyScroll = new BScroll(this.$refs.classifyWrapper, {
        click: true
      })

      this.goodsScroll = new BScroll(this.$refs.goodsWrapper, {
        click: true,
        probeType: 3
      })

      this.specScroll = new BScroll(this.$refs.specContentWrapper, {
        click: true
      })

      this.goodsScroll.on('scroll', (pos) => {
        this.finalIndex = this.currentIndex
        // 判断滑动方向，避免下拉时分类高亮错误（如第一分类商品数量为1时，下拉使得第二分类高亮）
        if (pos.y <= 0) {
          this.scrollY = Math.abs(Math.round(pos.y))
        }
      })

      this.goodsScroll.on('scrollEnd', (pos) => {
        if (this.isSelected) {
          this.isSelected = false
          this.finalIndex = this.selectedIndex
        }
      })
    },
    _calculateHeight() {
      let goodList = this.$refs.goodList
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < goodList.length; i++) {
        let item = goodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    _followScroll(index) {
      let classifyList = this.$refs.classifyList
      let el = classifyList[index]
      this.classifyScroll.scrollToElement(el, 300, 0, -100)
    }
  },
}
</script>

<style lang="less" scoped>
.iphone .goods_page {
  top: 220px;
}

.iphonex .goods_page {
  top: 260px;
  bottom: 132px;
}

.goods_page {
  display: flex;
  flex: 1;
  position: absolute;
  top: 180px;
  bottom: 110px;
  width: 100%;
  overflow: hidden;
}

.goods_none {
  display: flex;
  flex: 1;
  position: absolute;
  top: 180px;
  bottom: 110px;
  width: 100%;
  overflow: hidden;

  .msg {
    text-align: center;
    width: 100%;
    margin-top: 300px;
    font-size: 15px;
  }
}

.classify_wrapper {
  width: 150px;
  background: #F5F5F5;
  overflow: hidden;

  .classify {
    display: table;
    height: 96px;

    &_content {
      display: table-cell;
      width: 110px;
      vertical-align: middle;
      font-size: 13px;
      position: relative;
      padding: 0 10px;
      text-align: center;

      &:after {
        display: block;
        position: absolute;
        width: 110px;
        left: 20px;
        bottom: 0;
        border-top: 0.01rem solid #E5E5E5;
        content: ' ';
      }
    }

    &.current {
      position: relative;
      z-index: 10;
      margin-top: -2px;
      background: #fff;
      font-weight: 700;

      .classify_content{
        // color: #FFDA09;
        font-weight: bold;

        &:after {
          border-top: 2px solid #4E4E4E;
        }
      }
    }
  }
}

.goods_wrapper {
  flex: 1;
  background-color: #ffffff;

  .line {
    width: 6px;
    height: 24px;
    border-radius: 3px;
    display: inline-block;
    background-color: #FFDA09;
    vertical-align: middle;
    margin-right: 20px;
  }

  &-title {
    padding-left: 7px;
    height: 96px;
    line-height: 96px;
    font-size: 13px;
    color: #222222;
    background: #ffffff;
    border-bottom: 0.01rem solid #E5E5E5;
  }

  .good {
    display: flex;
    margin: 20px;
    padding-bottom: 10px;
    position: relative;
    background-color: #ffffff;

    &:after {
      display: block;
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      border-top: 0.01rem solid #E5E5E5;
      content: ' ';
    }
    &:last-child {
      margin-bottom: 0;
      &:after {
        display: none
      }
    }

    .icon {
      overflow: hidden;
      width: 120px;
      height: 120px;
      margin-right: 10px;
      background-image: url('../../assets/default.png');
      background-size:120px 120px;
      img {
        width: 100%;
        height: 100%;
      }
    }

    .content {
      flex: 1;

      .title {
        width: 320px;

        .name {
          margin-bottom: 10px;
          font-size: 14px;
          height: 80px;
          line-height: 40px;
          overflow: hidden;
        }
        .price {
          .now {
            font-weight: bold;
            margin-right: 8px;
            font-size: 15px;
            color: #F12C20;
            span {
              color: #979797;
              font-size: 12px;
            }
          }
        }
      }
      .operator-wrapper {
        position: absolute;
        right: -15px;
        bottom: 0px;
      }
    }
  }
}

.spec-wrapper {
  width: 660px;

  .title {
    width: 480px;
    font-size: 15px;
    text-align: center;
    margin: 50px auto;

    img {
      position: absolute;
      top: 40px;
      right: 40px;
      width: 32px;
      height: 32px;
    }
  }

  .content {
    max-height: 400px;
    overflow: hidden;

    .items {
      margin-bottom: 50px;

      &_title {
        font-size: 13px;
        color: #313131;
        text-align: left;
        margin: 0 0 0 30px;
      }

      .item {
        display: flex;
        flex-wrap: wrap;

        .option {
          display: inline-block;
          background-color: #E5E5E5;
          min-width: 88px;
          padding: 0 10px;
          height: 64px;
          line-height: 64px;
          text-align: center;
          margin: 30px 0 0 30px;
          border-radius: 6px;

          &.current {
            background-color: #FFDA09;
          }
          &.disable {
            background-color: #F5F5F5;
          }
        }
      }
    }
  }
  .bottom {
    height: 100px;
    line-height: 100px;
    padding: 0 15px;
    border-top: 0.01rem solid #CBCBCB;
    position: relative;

    .price {
      font-size: 18px;
      font-weight: bold;
      color: #F12C20;
    }

    .spec {
      color: #353535;
    }

    .btn {
      display: block;
      float: right;
      margin-top: 16px;
      width: 172px;
      height: 66px;
      line-height: 66px;
      text-align: center;
      background:#FFDA09;
      border-radius: 6px;

      &.disabled {
        background-color: #F5F5F5;
        color: #979797;
      }
    }

    .oper {
      position: absolute;
      right: 30px;

      .icon {
        width: 48px;
        height: 48px;
        line-height: 48px;
        text-align: center;
        border-radius: 6px;
        background-color: #FFDA09;
        display: inline-block;
        font-size: 18px;
      }

      .count {
        display: inline-block;
        padding: 0 5px;
      }

      .decrease {
        background-color: #ffffff;
        border: 0.01rem solid #979797;
        width: 44px;
        height: 44px;
        line-height: 44px;
        transform: translate3d(0, 0, 0);

        &.move-enter-active, &.move-leave-active {
          transition: all 0.4s linear;
        }
        &.move-enter, &.move-leave-active {
          opacity: 0;
          transform: translate3d(24px, 0, 0);
        }
      }
    }
  }
}
</style>
