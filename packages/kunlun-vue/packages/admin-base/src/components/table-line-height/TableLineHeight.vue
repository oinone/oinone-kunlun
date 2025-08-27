<template>
  <a-dropdown overlay-class-name="default-table-line-height-dropdown" trigger="click" placement="bottom">
    <div class="default-table-line-height">
      <oio-icon size="16" :icon="icon"></oio-icon>
    </div>
    <template #overlay>
      <a-menu>
        <a-menu-item
          v-for="option in options"
          :class="[active === option.value && 'ant-dropdown-menu-item-active ']"
          :key="option.icon"
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
import { computed, defineComponent, PropType, ref } from 'vue';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { TableLineHeightEnum } from '../../typing';

export default defineComponent({
  name: 'DefaultTableLineHeight',
  props: {
    value: {
      type: String as PropType<TableLineHeightEnum>,
      default: TableLineHeightEnum.AUTO
    }
  },
  emits: ['change', 'update:value'],
  components: {
    ADropdown,
    AMenu,
    AMenuItem,
    OioIcon
  },
  setup(props, { emit }) {
    const options = [
      { label: translateValueByKey('高'), icon: 'oinone-gao', value: TableLineHeightEnum.LARGE },
      { label: translateValueByKey('中'), icon: 'oinone-zhong', value: TableLineHeightEnum.MIDDLE },
      { label: translateValueByKey('低'), icon: 'oinone-di', value: TableLineHeightEnum.SMALL },
      { label: translateValueByKey('自适应'), icon: 'oinone-zishiying', value: TableLineHeightEnum.AUTO }
    ];

    const active = ref(props.value);
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
.default-table-line-height {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--oio-border-radius);
  border: 1px solid var(--oio-border-color);
  height: var(--oio-pagination-item-height);
  width: var(--oio-pagination-item-width);
  cursor: pointer;
}

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
