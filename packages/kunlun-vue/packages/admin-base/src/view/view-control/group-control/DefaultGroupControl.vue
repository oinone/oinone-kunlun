<template>
  <a-popover overlay-class-name="oio-popover default-view-control-popover" trigger="click" placement="bottomLeft">
    <template #content>
      <sortable-group
        title="添加分组"
        sure-text="确定"
        field-key="groupField"
        direction-key="groupDirection"
        :list="groupList"
        :model-fields="modelFields"
        @change="onGroupChange"
      ></sortable-group>
    </template>
    <div class="default-view-control-item default-view-control-group">
      <a-tooltip placement="bottom" class="oio-tooltip">
        <template #title>
          <span>{{ $translate('分组') }}</span>
        </template>
        <oio-icon size="16" icon="icon-group-outlined"> </oio-icon>
      </a-tooltip>
    </div>
  </a-popover>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Tooltip as ATooltip } from 'ant-design-vue';
import { RuntimeModelField } from '@oinone/kunlun-engine';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { IGroup } from '@oinone/kunlun-service';
import { SortableGroup } from '../../../components';

export default defineComponent({
  name: 'DefaultGroupControl',
  components: { SortableGroup, OioIcon, ATooltip },
  props: {
    groupList: {
      type: Array as PropType<IGroup[]>,
      default: () => []
    },
    modelFields: {
      type: Array as PropType<RuntimeModelField[]>,
      default: () => []
    },
    onGroupChange: {
      type: Function as PropType<(groupList: IGroup[]) => void>
    }
  }
});
</script>
