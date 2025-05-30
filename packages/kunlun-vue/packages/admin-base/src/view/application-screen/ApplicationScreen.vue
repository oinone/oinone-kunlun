<template>
  <div class="application-screen-container">
    <div class="application-tabs">
      <div
        class="application-tab"
        :class="[active === index && 'active']"
        v-for="(item, index) in tabs"
        :key="item"
        @click="active = index"
      >
        {{ item }}
      </div>
    </div>

    <div v-show="active === 0">
      <slot name="galleryWidget"></slot>
    </div>
    <div v-show="active === 1">
      <slot name="appsBusinessScreen"></slot>
    </div>
    <div v-show="active === 2">
      <slot name="techVisualization"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
export default defineComponent({
  setup() {
    const active = ref(0);
    const tabs = [translateValueByKey('应用列表'), translateValueByKey('应用大屏'), translateValueByKey('技术可视化')];

    return { active, tabs };
  }
});
</script>
<style lang="scss">
.application-screen-container {
  .application-tabs {
    background: var(--oio-background);
    display: flex;
    justify-content: center;
    margin-bottom: var(--oio-margin);

    .application-tab {
      margin-right: 60px;
      padding: 16px 0;
      margin-right: 60px;
      font-family: PingFangSC-Medium;
      font-size: 16px;
      color: var(--oio-text-color);
      letter-spacing: 0.57px;
      font-weight: 500;
      position: relative;
      cursor: pointer;

      &:after {
        transition: left 0.15s cubic-bezier(0, 0, 0.2, 1), right 0.15s cubic-bezier(0, 0, 0.2, 1);
        content: '';
        position: absolute;
        left: 30px;
        right: 30px;
        bottom: 0;
        height: 2px;
        background: transparent;
      }

      &.active {
        color: var(--oio-primary-color);

        &:after {
          left: -8px;
          right: -8px;
          background: var(--oio-primary-color);
        }
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
