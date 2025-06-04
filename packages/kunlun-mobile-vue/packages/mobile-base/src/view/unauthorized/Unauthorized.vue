<template>
  <div class="mobile-unauthorized-widget">
    <div><img :src="genStaticPath('mobile-unauthorized.png')" alt="" /></div>
    <div class="title" style="margin-bottom: 8px">您没有访问权限！</div>
    <div class="sub-title">对不起，您没有访问权限</div>
    <div class="sub-title">请不要进行非法操作！</div>
    <div class="sub-title" style="margin-top: 20px">401错误！</div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, computed } from 'vue';
import { genStaticPath } from '@oinone/kunlun-engine';
</script>
<style lang="scss">
.mobile-unauthorized-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--oio-text-color-secondary);
  img {
    width: 400px;
    margin-bottom: 24px;
  }

  .title {
    font-size: 34px;
    color: #141f33;
    text-align: center;
    line-height: 48px;
    font-weight: 500;
  }

  .sub-title {
    font-family: PingFangSC-Regular;
    font-size: 28px;
    color: rgba(0, 0, 0, 0.25);
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
  }
}
</style>
