<template>
  <div class="default-table-footer-operator">
    <div class="default-table-footer-operator-add-one" v-if="enableAddRow" @click.stop="onAddRow">
      <oio-icon size="14" icon="icon-plus-outlined" color="var(--oio-primary-color)"></oio-icon>
      {{ $translate('添加一行 ') }}
    </div>

    <!-- 快速填报 -->
    <element-tag widget="QuickFill" v-if="enableQuickFill"></element-tag>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import Element from '../../tags/Element.vue';

export default defineComponent({
  props: {
    enableAddRow: {
      type: Boolean,
      default: false
    },
    enableQuickFill: {
      type: Boolean,
      default: false
    },
    onAddRow: {
      type: Function,
      required: true
    }
  },
  components: {
    OioIcon,
    ElementTag: Element
  }
});
</script>

<style lang="scss">
.default-table-footer-operator {
  text-align: left;
  position: relative;
  width: 100%;
  color: var(--oio-primary-color);
  top: calc(var(--oio-row-gap) / 2 * -1);
  display: flex;
  column-gap: var(--oio-row-gap);

  .default-table-footer-operator-add-one {
    cursor: pointer;
    display: flex;
    align-items: center;
    column-gap: 4px;
  }
}
</style>
