<template>
  <div :class="`${DEFAULT_PREFIX}-empty-view-container`">
    <img :src="genStaticPath('empty-view.png')" alt="" />
    <div :class="`${DEFAULT_PREFIX}-empty-view-container-tips`">{{ $translate('未找到当前视图') }}</div>
  </div>
</template>
<script lang="ts">
import { genStaticPath } from '@oinone/kunlun-engine';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { defineComponent } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  setup() {
    return { genStaticPath, DEFAULT_PREFIX };
  }
});
</script>
<style lang="scss">
.oio-m-empty-view-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: var(--oio-background);
  padding: 80px;
  img {
    width: 100px;
  }

  &-tips {
    font-family: PingFangSC-Regular;
    margin-top: 12px;
    color: var(--oio-text-color-secondary);
  }
}
</style>
