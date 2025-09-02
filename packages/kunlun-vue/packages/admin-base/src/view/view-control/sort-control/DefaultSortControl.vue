<template>
  <a-popover overlay-class-name="oio-popover default-view-control-popover" trigger="click" placement="bottomLeft">
    <template #content>
      <sortable-group
        :list="sortList"
        :model-fields="modelFields"
        title="添加排序"
        sure-text="确定"
        @change="onSortChange"
      ></sortable-group>
    </template>
    <div class="default-view-control-item default-view-control-sort">
      <oio-icon size="16" icon="icon-a-defaultrowheight"> </oio-icon>
    </div>
  </a-popover>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { RuntimeModelField } from '@oinone/kunlun-engine';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { ISort } from '@oinone/kunlun-service';
import { SortableGroup } from '../../../components';

export default defineComponent({
  name: 'DefaultSortControl',
  components: { SortableGroup, OioIcon },
  props: {
    sortList: {
      type: Array as PropType<ISort[]>,
      default: () => []
    },
    modelFields: {
      type: Array as PropType<RuntimeModelField[]>,
      default: () => []
    },
    onSortChange: {
      type: Function as PropType<(sortList: ISort[]) => void>
    }
  }
});
</script>

<style lang="scss"></style>
