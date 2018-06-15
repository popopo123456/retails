<template>
  <div class="details">
    <van-swipe :autoplay="3000" class="item">
      <van-swipe-item>1</van-swipe-item>
      <van-swipe-item>2</van-swipe-item>
      <van-swipe-item>3</van-swipe-item>
      <van-swipe-item>4</van-swipe-item>
    </van-swipe>
    <h2>乐事无限青柠薯片</h2>
  </div>
</template>

<script>
import Vue from 'vue'
import { Swipe, SwipeItem } from 'vant'
Vue.use(Swipe).use(SwipeItem)

export default {
  name: 'v-details',
  created () {
    console.log('details page')
  }
}
</script>

<style lang="less" scoped>
.details {
  height: 400px;
  /*background: gray;*/
  .item {
    height: 400px;
    background: #e8e8e8;
  }
}
</style>
