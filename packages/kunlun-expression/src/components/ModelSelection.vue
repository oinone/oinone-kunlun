<template>
  <md-selection-sub class="model-selection" :show-search="showSearch" :search-placeholder="searchPlaceholder">
    <template #header v-if="$slots.header">
      <slot name="header" />
    </template>
    <template #default>
      <data-list-box
        :data-list="dataList"
        :pagination="pagination"
        :on-pagination-change="onPaginationChange"
        :show-remark="showRemark"
        @click-item="onClickItem"
      />
    </template>
    <template #footerBtn v-if="$slots.footer">
      <slot name="footer" />
    </template>
  </md-selection-sub>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import MdSelectionSub from './MdSelectionSub.vue';
import DataListBox from './DataListBox.vue';

export default defineComponent({
  components: { MdSelectionSub, DataListBox },
  props: ['dataList', 'pagination', 'onPaginationChange', 'showSearch', 'searchPlaceholder', 'showRemark'],
  emits: ['clickItem'],
  setup(props, context) {
    //
    const onClickItem = (item) => {
      context.emit('clickItem', item);
    };
    return {
      onClickItem
    };
  }
});
</script>
<style lang="scss">
.md-selection-sub-inner {
  .type-box--content {
    display: flex;
    flex-direction: column;
  }
}
</style>
