<template>
  <div class="operator">
    <div v-if="!myGoodsSku">
      <div v-if="specCount === 1 && stockCount > 0">
        <transition name="move">
          <div class="icon-wrapper decrease" @click.stop.prevent="decreaseCart" v-show="good.count > 0"><i class="icon">-</i></div>
        </transition>
        <div class="count" v-show="good.count > 0">{{good.count}}</div>
        <div class="icon-wrapper add"  @click.stop.prevent="addCart"><i class="icon">+</i></div>
      </div>
      <div v-if="specCount > 1 && stockCount > 0">
        <i class="choose" @click.stop.prevent="showSpec">选规格</i>
        <div class="num" v-if="good.count > 0">{{good.count}}</div>
      </div>
      <i class="none" v-if="stockCount <= 0">售罄</i>
    </div>
    <div v-if="myGoodsSku">
        <transition name="move">
          <div class="icon-wrapper decrease" v-if="myGoodsSku.count > 0" @click.stop.prevent="decreaseCart"><i class="icon" >-</i></div>
        </transition>
        <div class="count" v-if="myGoodsSku.count > 0">{{myGoodsSku.count}}</div>
        <div class="icon-wrapper add" @click.stop.prevent="addCart"><i class="icon">+</i></div>
    </div>
  </div>
</template>

<script>
import { Toast } from 'vant'

export default {
  name: 'v-operator',
  props: {
    good: {
      type: Object
    },
    goodsSku: {
      type: Object
    }
  },
  data() {
    return {
      myGood: this.good,
      myGoodsSku: this.goodsSku,
    }
  },
  created() {
  },
  methods: {
    addCart (event) {
      if (!event._constructed) {
        return false
      }

      if (this.myGoodsSku) {
        if (this.myGoodsSku.count >= parseInt(this.myGoodsSku.stock)) {
          Toast({ 'message': '库存不足' })
          return
        }
        this.myGoodsSku.count++
      } else {
        if (this.myGood.goodsSkuList[0].count >= parseInt(this.myGood.goodsSkuList[0].stock)) {
          Toast({ 'message': '库存不足' })
          return
        }
        this.myGood.goodsSkuList[0].count++
      }

      if (!this.myGood.count) {
        this.$set(this.good, 'count', 1)
      } else {
        this.myGood.count++
      }
      // 有多个规格的商品
      this.$emit('add', event.target)
    },
    decreaseCart (event) {
      if (!event._constructed) {
        return
      }
      if (this.myGoodsSku) {
        this.myGoodsSku.count--
      } else {
        this.myGood.goodsSkuList[0].count--
      }
      this.myGood.count--
    },
    showSpec(event) {
      if (!event._constructed) {
        return false
      }
      this.$emit('show', this.myGood)
    }
  },
  computed: {
    specCount() {
      return Object.keys(this.myGood.goodsSkuMap).length
    },
    stockCount() {
      let count = 0
      Object.values(this.myGood.goodsSkuMap).forEach(value => {
        count = count + parseInt(value.stock)
      })
      return count
    },
  },
  watch: {
    goodsSku(val) {
      this.myGoodsSku = val
    },
    good(val) {
      this.myGood = val
    }
  }
}
</script>

<style lang="less" scoped>
.operator {
  // height: 78px;
  // line-height: 78px;

  .icon-wrapper {
    display: inline-block;
    padding: 7.5px;
  }

  .icon {
    width: 44px;
    height: 44px;
    line-height: 40px;
    text-align: center;
    border-radius: 6px;
    display: inline-block;
    font-size: 18px;
  }

  .add {
    .icon {
      border: 0.01rem solid #FFDA09;
      background-color: #FFDA09;
    }
  }
  .decrease {
    .icon {
      background-color: #ffffff;
      border: 0.01rem solid #979797;
    }
    transform: translate3d(0, 0, 0);

    &.move-enter-active, &.move-leave-active {
      transition: all 0.4s linear;
    }
    &.move-enter, &.move-leave-active {
      opacity: 0;
      transform: translate3d(24px, 0, 0);
    }
  }
  .count {
    display: inline-block;
    // padding: 0 10px;
    line-height: 46px;
    text-align: center;
    font-size: 14px;
    min-width: 20px;
    vertical-align: top;
    margin-top: 18px;
  }

  .choose {
    width: 98px;
    height: 48px;
    line-height: 48px;
    background:rgba(255,218,9,1);
    box-shadow: -2px 2px 2px 0px rgba(255,218,9,1);
    border-radius: 6px;
    font-size: 13px;
    text-align: center;
    display: inline-block;
    margin: 0 15px 20px 0;
  }

  .num {
    position: absolute;
    top: -12px;
    right: -8px;
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
  }

  .none {
    width: 98px;
    height: 48px;
    line-height: 48px;
    background:rgba(245,245,245,1);
    border-radius: 6px;
    text-align: center;
    display: inline-block;
    margin: 0 15px 20px 0;
  }
}
</style>
