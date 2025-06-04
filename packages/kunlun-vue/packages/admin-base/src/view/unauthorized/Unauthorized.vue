<template>
  <div class="unauthorized-widget">
    <div><img :src="genStaticPath('无权限.png')" alt="" /></div>
    <div>{{ tips }}</div>
    <div>请联系管理员</div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, computed } from 'vue';
import { genStaticPath } from '@oinone/kunlun-engine';
import { emptyHomepageModelName } from '@oinone/kunlun-vue-admin-layout';

const props = defineProps<{ currentModel: string }>();
const tips = computed(() => (props.currentModel === emptyHomepageModelName ? '暂无首页' : '暂无访问权限'));
</script>
<style lang="scss">
.unauthorized-widget {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--oio-text-color-secondary);
  img {
    width: 200px;
    margin-bottom: 12px;
  }
}
</style>
