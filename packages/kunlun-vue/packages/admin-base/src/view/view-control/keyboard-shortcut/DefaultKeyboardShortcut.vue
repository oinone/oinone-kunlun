<template>
  <div class="default-view-control-item default-view-control-keybard-shortcut">
    <a-popover
      trigger="click"
      placement="bottomRight"
      destroy-tooltip-on-hide
      :visible="visible"
      overlay-class-name="table-key-board-shortcut-popover oio-popover"
      @update:visible="onUpdateVisible"
    >
      <template #default>
        <a-tooltip placement="bottom" class="oio-tooltip">
          <template #title>
            <span>{{ $translate('快捷键') }}</span>
          </template>
          <oio-icon size="16" icon="oinone-shortcutkey-outlined"></oio-icon>
        </a-tooltip>
      </template>
      <template #content>
        <div class="table-keyboard-shortcut-inner">
          <div class="shortcut-title">{{ $translate('快捷键') }}</div>
          <div class="shortcut-content">
            <oio-row class="shortcut-header">
              <oio-col :span="12">
                <span class="shortcut-header-title">{{ $translate('操作') }}</span>
              </oio-col>
              <oio-col :span="12">
                <span class="shortcut-header-title">{{ $translate('快捷键') }}</span>
              </oio-col>
            </oio-row>

            <oio-row v-for="item in keyboardConfigs" :key="item.label" class="shortcut-item">
              <oio-col :span="12">
                <span class="shortcut-item-title">{{ $translate(item.label) }}</span>
              </oio-col>
              <oio-col :span="12">
                <div class="shortcut-key">
                  <div class="shortcut-key-item" v-for="(key, index) in item.keyCodes" :key="key">
                    <div class="shortcut-key-item-label">{{ key }}</div>
                    <div v-if="index !== item.keyCodes.length - 1">+</div>
                  </div>
                </div>
              </oio-col>
            </oio-row>
          </div>
          <div class="shortcut-footer-desc">
            <div>{{ $translate('1.以上可编辑单元格的快捷键，仅对表头带“编辑图标”的单元格生效') }}</div>
            <div>
              {{
                $translate(
                  '2.整行编辑完成后，单元格内所有可编辑数据将统一提交;若在编辑过程中按下Enter 键本行中已编辑但尚未提交的数据也会同步提交'
                )
              }}
            </div>
            <div>{{ $translate('3.若在编辑过程中按下 ESC 键，本行内已编辑但尚未提交的数据将被一井丢弃') }}</div>
          </div>
        </div>
      </template>
    </a-popover>
  </div>
</template>
<script lang="ts">
import { ButtonType, OioButton, OioCol, OioIcon, OioRow } from '@oinone/kunlun-vue-ui-antd';
import { Popover as APopover, Tooltip as ATooltip } from 'ant-design-vue';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    keyboardConfigs: {
      type: Array as PropType<{ label: string; keyCodes: string[] }[]>,
      default: () => []
    }
  },
  components: {
    APopover,
    OioButton,
    OioRow,
    OioCol,
    OioIcon,
    ATooltip
  },
  setup() {
    const visible = ref(false);

    const onUpdateVisible = (val: boolean) => {
      visible.value = val;
    };

    return {
      visible,
      onUpdateVisible,
      ButtonType
    };
  }
});
</script>

<style lang="scss">
.table-key-board-shortcut-popover {
  .ant-popover-inner-content {
    padding: 0;
  }

  .table-keyboard-shortcut-inner {
    width: 480px;
    box-sizing: border-box;

    .shortcut-title {
      padding: var(--oio-padding);
      box-sizing: border-box;
      border-bottom: 1px solid var(--oio-border-color);
      font-size: var(--oio-font-size-lg);
      color: #333333;
      font-weight: bold;
    }

    .shortcut-content {
      padding: var(--oio-padding);
      box-sizing: border-box;

      .shortcut-header {
        margin-bottom: var(--oio-margin);

        .shortcut-header-title {
          color: var(--oio-text-color);
        }
      }

      .shortcut-item {
        margin-bottom: var(--oio-margin);
        color: var(--oio-text-color-secondary);

        .shortcut-key {
          display: flex;
          align-items: center;

          .shortcut-key-item {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-right: 4px;

            .shortcut-key-item-label {
              padding: 4px 3px;
              border-radius: 2px;
              background-color: #f4f4f5;
            }
          }
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .shortcut-footer-desc {
      box-sizing: border-box;
      padding: var(--oio-padding-sm) var(--oio-padding) var(--oio-padding) var(--oio-padding);
      font-size: var(--oio-font-size-sm);
      color: var(--oio-disabled-color);
    }
  }
}
</style>
