<template>
  <div class="oio-empty-view-container">
    <img :src="genStaticPath('empty-view.png')" alt="" />
    <div class="oio-empty-view-container-tips">{{ $translate('未找到当前视图') }}</div>
  </div>
</template>
<script lang="ts" setup>
import { genStaticPath } from '@oinone/kunlun-engine';
</script>
<style lang="scss">
.oio-empty-view-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--oio-background);
  img {
    width: 200px;
  }

  &-tips {
    font-family: PingFangSC-Regular;
    margin-top: 12px;
    color: var(--oio-text-color-secondary);
  }
}
</style>
