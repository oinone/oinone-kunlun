<template>
  <a-popover
    overlay-class-name="oio-popover default-view-control-popover"
    trigger="click"
    placement="bottomRight"
    destroy-tooltip-on-hide
    :open="state.visible"
    @openChange="onVisibleChange"
  >
    <template #content>
      <sortable-group
        :list="sortList"
        :model-fields="fieldOptions"
        title="添加排序"
        sure-text="确定"
        @change="onEnter"
      ></sortable-group>
    </template>
    <div class="default-view-control-item default-view-control-sort">
      <a-tooltip placement="bottom" class="oio-tooltip" v-model:open="tooltipStatus">
        <template #title>
          <span>{{ $translate('排序') }}</span>
        </template>
        <oio-icon size="16" icon="oinone-order-outlined"></oio-icon>
      </a-tooltip>
    </div>
  </a-popover>
</template>
<script lang="ts">
import { ISort } from '@oinone/kunlun-service';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, PropType, reactive, ref } from 'vue';
import { SortableGroup, SortableGroupOption } from '../../../components';

export default defineComponent({
  name: 'DefaultSortControl',
  components: { SortableGroup, OioIcon },
  props: {
    sortList: {
      type: Array as PropType<ISort[]>,
      default: () => []
    },
    fieldOptions: {
      type: Array as PropType<SortableGroupOption[]>,
      default: () => []
    },
    onSortChange: {
      type: Function as PropType<(sortList: ISort[]) => void>
    },
    onOpen: {
      type: Function
    }
  },
  setup(props) {
    const state = reactive({
      visible: false
    });

    const tooltipStatus = ref(false);

    const onVisibleChange = (visible: boolean) => {
      state.visible = visible;
      if (visible) {
        tooltipStatus.value = false;
        props.onOpen?.();
      }
    };

    const onEnter = (sortList: ISort[]) => {
      props.onSortChange?.(sortList);
      state.visible = false;
    };

    return {
      state,
      tooltipStatus,

      onVisibleChange,
      onEnter
    };
  }
});
</script>

<style lang="scss"></style>
