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
        :title="$translate('添加分组')"
        :sure-text="$translate('确定')"
        field-key="field"
        direction-key="direction"
        :list="groupList"
        :model-fields="fieldOptions"
        @change="onEnter"
      ></sortable-group>
    </template>
    <div class="default-view-control-item default-view-control-group">
      <a-tooltip placement="bottom" class="oio-tooltip" v-model:open="tooltipStatus">
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
import { GroupingField } from '@oinone/kunlun-engine';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { Popover as APopover, Tooltip as ATooltip } from 'ant-design-vue';
import { defineComponent, type PropType, reactive, ref } from 'vue';
import { SortableGroup, type SortableGroupOption } from '../../../components';

export default defineComponent({
  name: 'DefaultGroupControl',
  components: {
    SortableGroup,
    OioIcon,
    ATooltip,
    APopover
  },
  props: {
    groupList: {
      type: Array as PropType<GroupingField[]>,
      default: () => []
    },
    fieldOptions: {
      type: Array as PropType<SortableGroupOption[]>,
      default: () => []
    },
    onGroupChange: {
      type: Function as PropType<(groupList: GroupingField[]) => void>
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

    const onEnter = (groupList: GroupingField[]) => {
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
