<template>
  <a-popover
    overlay-class-name="oio-popover default-view-control-popover"
    trigger="click"
    placement="bottomRight"
    destroy-tooltip-on-hide
    :visible="state.visible"
    @visibleChange="onVisibleChange"
  >
    <template #content>
      <sortable-group
        title="添加分组"
        sure-text="确定"
        field-key="groupField"
        direction-key="groupDirection"
        :list="groupList"
        :model-fields="fieldOptions"
        @change="onEnter"
      ></sortable-group>
    </template>
    <div class="default-view-control-item default-view-control-group">
      <a-tooltip placement="bottom" class="oio-tooltip" v-model:visible="tooltipStatus">
        <template #title>
          <span>{{ $translate('分组') }}</span>
        </template>
        <oio-icon v-if="groupList.length" size="16" icon="oinone-ungroup-outlined"></oio-icon>
        <oio-icon v-else size="16" icon="oinone-group-outlined"></oio-icon>
      </a-tooltip>
    </div>
  </a-popover>
</template>

<script lang="ts">
import { IGroup } from '@oinone/kunlun-service';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { defineComponent, PropType, reactive, ref } from 'vue';
import { SortableGroup, SortableGroupOption } from '../../../components';

export default defineComponent({
  name: 'DefaultGroupControl',
  components: { SortableGroup, OioIcon, ATooltip },
  props: {
    groupList: {
      type: Array as PropType<IGroup[]>,
      default: () => []
    },
    fieldOptions: {
      type: Array as PropType<SortableGroupOption[]>,
      default: () => []
    },
    onGroupChange: {
      type: Function as PropType<(groupList: IGroup[]) => void>
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

    const onEnter = (groupList: IGroup[]) => {
      props.onGroupChange?.(groupList);
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
