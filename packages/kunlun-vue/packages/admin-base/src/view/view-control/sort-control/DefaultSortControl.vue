<template>
  <a-popover
    overlay-class-name="oio-popover default-view-control-popover"
    trigger="click"
    placement="bottomLeft"
    destroy-tooltip-on-hide
    :visible="state.visible"
    @visibleChange="onVisibleChange"
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
      <a-tooltip placement="bottom" class="oio-tooltip">
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
import { defineComponent, PropType, reactive } from 'vue';
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

    const onVisibleChange = (visible: boolean) => {
      state.visible = visible;
      if (visible) {
        props.onOpen?.();
      }
    };

    const onEnter = (sortList: ISort[]) => {
      props.onSortChange?.(sortList);
      state.visible = false;
    };

    return {
      state,

      onVisibleChange,
      onEnter
    };
  }
});
</script>

<style lang="scss"></style>
