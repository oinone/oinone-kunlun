<template>
  <a-popover
    overlay-class-name="expression-common-popover"
    placement="bottomLeft"
    :trigger="readonly ? 'null' : 'click'"
    v-model:open="visiblePopover"
  >
    <template #default>
      <span
        class="ant-input-wrapper ant-input-group form-resource-date-format"
        :class="[readonly && 'form-resource-date-format-readonly']"
      >
        <div class="ant-input-affix-wrapper">
          <div class="ant-input-inner" @click.stop="visiblePopover = false">
            <template v-for="(opt, index) in selectedValue">
              <control-tag class="variable-item variable-tag" :closable="!readonly" @close="onRemoveOption(index)">
                <a-select
                  class="oio-select"
                  popup-class-name="oio-select-dropdown form-resource-date-format-child-select"
                  :disabled="readonly"
                  :style="{
                    width: opt.width
                  }"
                  :placeholder="opt.displayName"
                  v-model:value="opt.code"
                  @change="visiblePopover = false"
                >
                  <a-select-option v-for="item in opt.options" :key="item.code" :value="item.code">
                    {{ item.displayName }}
                  </a-select-option>
                </a-select>
              </control-tag>

              <format-concat :opt="opt" :readonly="readonly"></format-concat>
            </template>
          </div>
        </div>

        <span class="ant-input-group-addon" v-if="!readonly">
          <oio-icon icon="oinone-variable-x" color="var(--oio-text-color)" size="16"></oio-icon>
        </span>
      </span>
    </template>

    <template #content>
      <div class="form-resource-date-format-options">
        <template v-for="item in options" :key="item.code">
          <div
            class="form-resource-date-format-item"
            v-if="!existingValue.includes(item.id)"
            @click="onChangeOption(item)"
          >
            {{ item.displayName }}
          </div>
        </template>
      </div>
    </template>
  </a-popover>
</template>
<script lang="ts">
import { CloseCircleFilled } from '@ant-design/icons-vue';
import { OioIcon, ResourceDateTimeOption } from '@oinone/kunlun-vue-ui-antd';
import {
  Popover as APopover,
  Select as ASelect,
  SelectOption as ASelectOption,
  Tooltip as ATooltip
} from 'ant-design-vue';
import { computed, defineComponent, type PropType, ref } from 'vue';
import ControlTag from './ControlTag.vue';
import FormatConcat from './FormatConcat.vue';

export default defineComponent({
  components: {
    CloseCircleFilled,
    ASelect,
    ASelectOption,
    ATooltip,
    APopover,
    ControlTag,
    OioIcon,
    FormatConcat
  },

  props: {
    options: {
      type: Array as PropType<ResourceDateTimeOption[]>,
      default: () => []
    },
    value: {
      type: Object as PropType<{ value: ResourceDateTimeOption[] }>,
      default: () => ({})
    },
    onChangeOption: {
      type: Function,
      required: true
    },
    onRemoveOption: {
      type: Function,
      required: true
    },
    readonly: {
      type: Boolean
    }
  },

  setup(props) {
    const visiblePopover = ref(false);
    const selectedValue = computed(() => (props.value ? props.value.value || [] : []));

    const existingValue = computed(() => {
      return selectedValue.value.map((v) => v.id);
    });

    return { selectedValue, visiblePopover, existingValue };
  }
});
</script>
<style lang="scss">
.form-resource-date-format-options {
  .form-resource-date-format-item {
    padding: 0 var(--oio-padding);
    line-height: var(--oio-height);
    cursor: pointer;

    &:hover {
      background: rgba(var(--oio-primary-color-rgb), 0.1);
      color: var(--oio-primary-color);
    }
  }
}

.form-resource-date-format-child-select {
  width: 100px !important;
}

.form-resource-date-format {
  font-feature-settings: 'tnum';
  border-collapse: separate;
  border-spacing: 0;
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.85);
  display: table;
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5715;
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  width: 100%;

  .ant-input-affix-wrapper {
    background-color: #fff;
    background-image: none;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.85);
    display: inline-flex;
    font-size: 14px;
    line-height: 1.5715;
    min-width: 0;
    padding: 4px 11px;
    position: relative;
    transition: all 0.3s;
    width: 100%;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  .ant-input-group-addon {
    display: table-cell;
    vertical-align: middle;
    white-space: nowrap;
    width: 1px;
    background-color: #fafafa;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
    font-weight: 400;
    padding: 0 11px;
    position: relative;
    text-align: center;
    transition: all 0.3s;
    border-left: 0;
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  &.form-resource-date-format-readonly {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
    }

    &.ant-input-wrapper .ant-input-affix-wrapper {
      border: none;
      padding: 0;

      .oio-select .ant-select-arrow {
        display: none;
      }
    }
  }

  .oio-select.ant-select {
    width: 50px;
  }

  .oio-select.ant-select .ant-select-selector:hover,
  .oio-select.ant-select:not(.ant-select-customize-input) .ant-select-selector:hover {
    background-color: transparent;
    border: none;
  }

  .control-tag-inner {
    height: calc(var(--oio-height) * 0.8);
    line-height: calc(var(--oio-height) * 0.8);
    border-radius: 4px;
  }

  .oio-select.ant-select .ant-select-selector,
  .oio-select.ant-select:not(.ant-select-customize-input) .ant-select-selector {
    border: none;
    background: transparent;
    height: calc(var(--oio-height) * 0.5);

    .ant-select-selection-item {
      padding: 0;
      height: calc(var(--oio-height) * 0.5);
      line-height: calc(var(--oio-height) * 0.5);
      color: var(--oio-primary-color);
    }

    .ant-select-selection-search {
      display: none;
    }
  }

  .oio-select .ant-select-arrow {
    right: 0;
  }

  .form-resource-date-format-concat {
    border: 0;
    outline: none;
    width: 18px;
  }
}
</style>
