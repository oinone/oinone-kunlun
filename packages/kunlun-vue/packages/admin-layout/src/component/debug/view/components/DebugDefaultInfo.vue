<template>
  <oio-form>
    <oio-form-item label="诊断内容">
      <span>{{ message }}</span>
    </oio-form-item>
    <oio-form-item label="诊断信息">
      <debug-json-view v-if="stackInfo" :text="stackInfo" text-class="oio-debug-textarea" />
      <span v-else>未返回诊断信息</span>
    </oio-form-item>
  </oio-form>
</template>
<script lang="ts">
import { OioForm, OioFormItem, OioTextarea } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';
import { DebugInfoProps } from '../../typing';
import DebugJsonView from '../components/DebugJsonView.vue';

export default defineComponent({
  name: 'DebugDefaultInfo',
  components: {
    OioForm,
    OioFormItem,
    OioTextarea,
    DebugJsonView
  },
  inheritAttrs: false,
  props: {
    ...DebugInfoProps
  },
});
</script>
