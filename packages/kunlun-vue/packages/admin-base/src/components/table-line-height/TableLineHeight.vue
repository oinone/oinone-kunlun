<template>
  <a-dropdown overlay-class-name="default-table-line-height-dropdown" trigger="click" placement="bottom">
    <div class="default-view-control-item default-table-line-height">
      <a-tooltip placement="top" class="oio-tooltip">
        <template #title>
          <span>{{ $translate('行高切换') }}</span>
        </template>
        <oio-icon size="16" :icon="icon"></oio-icon>
      </a-tooltip>
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item
          v-for="option in options"
          :class="[active === option.value && 'ant-dropdown-menu-item-active ']"
          :key="option.value"
          @click="onChange(option.value)"
        >
          <oio-icon size="16" :icon="option.icon"></oio-icon>
          <span>{{ option.label }}</span>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem, Tooltip as ATooltip } from 'ant-design-vue';
import { computed, defineComponent, PropType, ref } from 'vue';
import { TableLineHeightEnum } from '../../typing';

export default defineComponent({
  name: 'DefaultTableLineHeight',
  props: {
    value: {
      type: String as PropType<TableLineHeightEnum>
    }
  },
  emits: ['change', 'update:value'],
  components: {
    ADropdown,
    AMenu,
    AMenuItem,
    OioIcon,
    ATooltip
  },
  setup(props, { emit }) {
    const options = [
      { label: translateValueByKey('默认'), icon: 'oinone-a-defaultrowheight', value: TableLineHeightEnum.DEFAULT },
      { label: translateValueByKey('高'), icon: 'oinone-height-outlined', value: TableLineHeightEnum.LARGE },
      { label: translateValueByKey('中'), icon: 'oinone-medium-height-outlined', value: TableLineHeightEnum.MIDDLE },
      { label: translateValueByKey('低'), icon: 'oinone-low-height-outlined', value: TableLineHeightEnum.SMALL },
      { label: translateValueByKey('自适应'), icon: 'oinone-adaptive-outlined', value: TableLineHeightEnum.AUTO }
    ];

    const active = ref(props.value == null ? TableLineHeightEnum.DEFAULT : props.value);
    const icon = computed(() => options.find((item) => item.value === active.value)?.icon);

    const onChange = (value: TableLineHeightEnum) => {
      active.value = value;
      emit('update:value', value);
      emit('change', value);
    };

    return {
      options,
      icon,
      active,
      onChange
    };
  }
});
</script>

<style lang="scss">
.default-table-line-height-dropdown {
  .ant-dropdown-menu-item {
    margin: 4px;

    &.ant-dropdown-menu-item-active,
    &:not(.ant-dropdown-menu-item-disabled):hover {
      background: #f4f4f4;
      border-radius: var(--oio-border-radius);
    }
  }

  .ant-dropdown-menu-title-content {
    display: flex;
    align-items: center;
    column-gap: 8px;
    color: var(--oio-text-color-secondary);
  }
}
</style>
