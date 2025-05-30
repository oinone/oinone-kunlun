<template>
  <a-tooltip v-if="value">
    <template #title>
      <span>{{ value }}</span>
    </template>
    <div class="default-table-color-picker">
      <oio-color-picker readonly :value="value" />
    </div>
  </a-tooltip>
</template>
<script lang="ts">
import { OioColorPicker } from '@kunlun/vue-ui-el';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultColorPicker',
  inheritAttrs: false,
  props: {
    value: {
      type: String
    }
  },
  components: {
    OioColorPicker,
    ATooltip
  },
  setup(props) {
    return {};
  }
});
</script>
<style lang="scss">
.default-table-color-picker {
  .oio-color-picker {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-color-picker__trigger {
      height: var(--oio-height);
      width: var(--oio-height);
      border-color: var(--oio-border-color);
    }
  }
}
</style>
