<template>
  <a-popover
    overlay-class-name="oio-popover default-view-control-popover"
    trigger="click"
    placement="bottomRight"
    :visible="visible"
    @visible-change="onVisibleChange"
  >
    <template #content>
      <div class="default-card-col-control">
        <div class="default-card-col-control-input">
          <div class="default-card-col-control-title">{{ $translate('一行展示卡片数量') }}</div>
          <oio-input-number v-model:value="internalCols"></oio-input-number>
        </div>

        <div class="default-card-col-control-footer">
          <oio-button type="primary" @click="onSure">确定</oio-button>
          <oio-button @click="onCancel">取消</oio-button>
        </div>
      </div>
    </template>
    <div class="default-view-control-item default-card-col-control">
      <a-tooltip placement="bottom" class="oio-tooltip" v-model:visible="tooltipStatus">
        <template #title>
          <span>{{ $translate('行数量切换') }}</span>
        </template>
        <oio-icon size="16" icon="oinone-card-outlined" @click="visible = true"></oio-icon>
      </a-tooltip>
    </div>
  </a-popover>
</template>

<script lang="ts">
import { OioButton, OioIcon, OioInputNumber } from '@oinone/kunlun-vue-ui-antd';
import { Popover as APopover } from 'ant-design-vue';
import { toNumber } from 'lodash-es';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'DefaultCardColControl',
  components: { APopover, OioIcon, OioInputNumber, OioButton },
  props: {
    cols: {
      type: Number,
      default: 4
    },
    setCardCols: {
      type: Function as PropType<(cols: number) => void>
    }
  },
  setup(props) {
    const internalCols = ref<number>();
    const visible = ref(false);

    const tooltipStatus = ref(false);
    const onVisibleChange = (val) => {
      visible.value = val;
      if (val) {
        tooltipStatus.value = false;
        internalCols.value = props.cols;
      }
    };

    const onCancel = () => {
      visible.value = false;
    };

    const onSure = () => {
      if (!internalCols.value) {
        return;
      }
      const val = toNumber(internalCols.value);
      if (Number.isNaN(val)) {
        console.error('Invalid cols value.', internalCols.value);
        return;
      }
      props.setCardCols?.(val);
      onCancel();
    };

    return {
      internalCols,
      visible,
      tooltipStatus,
      onCancel,
      onVisibleChange,
      onSure
    };
  }
});
</script>

<style lang="scss">
.default-card-col-control {
  .default-card-col-control-input {
    padding: var(--oio-padding-md);
  }

  .default-card-col-control-title {
    margin-bottom: var(--oio-margin);
  }

  .default-card-col-control-footer {
    padding: var(--oio-padding-md);
    border-top: 1px solid var(--oio-border-color);

    .oio-button {
      margin-right: var(--oio-margin-md);
      line-height: var(--oio-line-height-sm);
      padding: 2px var(--oio-padding-sm);
      height: auto;
      text-align: center;

      &:last-child {
        margin-right: 0;
      }

      &.ant-btn > span {
        font-size: var(--oio-font-size-sm);
        line-height: unset;
      }
    }
  }
}
</style>
