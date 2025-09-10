<template>
  <div class="default-table-group-collapse">
    <span
      v-if="groupViewFooterExpandControl"
      class="default-table-group-collapse-item"
      @click="setAllGroupExpand(true)"
    >
      <oio-icon icon="oinone-double-down-outlined" size="16"></oio-icon>
      <span>{{ $translate('展开全部') }}</span>
    </span>
    <span v-if="groupViewFooterFoldControl" class="default-table-group-collapse-item" @click="setAllGroupExpand(false)">
      <oio-icon icon="oinone-double-up-outlined" size="16"></oio-icon>
      <span>{{ $translate('收起全部') }}</span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  name: 'DefaultTableGroupCollapse',
  props: {
    groupViewFooterExpandControl: {
      type: Boolean,
      default: false
    },
    groupViewFooterFoldControl: {
      type: Boolean,
      default: false
    },
    setAllGroupExpand: {
      type: Function,
      default: () => {
        return () => ({});
      }
    },
    justify: {
      type: String,
      default: 'left'
    }
  },
  components: {
    OioIcon
  },
  setup(props) {
    return {};
  }
});
</script>

<style lang="scss">
.default-table-group-collapse {
  flex: 1;
  text-align: left;
  display: flex;
  column-gap: var(--oio-row-gap);

  .default-table-group-collapse-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    .oio-icon {
      margin-right: var(--oio-margin-sm);
    }
  }
}
</style>
