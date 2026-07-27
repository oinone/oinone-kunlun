<template>
  <oio-dropdown v-if="currentPartner" :trigger="['click']" placement="bottomCenter">
    <div class="k-layout-partner-switcher">
      <span :title="currentPartner.name">{{ currentPartner.name }}</span>
      <caret-down-outlined :style="{ fontSize: '12px', color: '#c3c4c6' }" />
    </div>
    <template #overlay>
      <div class="k-layout-partner-switcher-overlay">
        <div
          v-for="item in partnerList"
          :key="item.id"
          class="k-layout-partner-switcher-item"
          :class="{ 'is-selected': item.id === currentPartner?.id }"
          :title="item.name"
          @click="onSelect(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </template>
  </oio-dropdown>
</template>
<script lang="ts">
import { CaretDownOutlined } from '@ant-design/icons-vue';
import { OioDropdown } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, type PropType } from 'vue';
import type { PartnerItem } from './typing';

export default defineComponent({
  name: 'PartnerSwitcher',
  components: {
    CaretDownOutlined,
    OioDropdown
  },
  inheritAttrs: false,
  props: {
    currentPartner: {
      type: Object as PropType<PartnerItem>
    },
    partnerList: {
      type: Array as PropType<PartnerItem[]>
    },
    onChangePartner: {
      type: Function as PropType<(item: PartnerItem) => void>
    }
  },
  setup(props) {
    const onSelect = (item: PartnerItem) => {
      if (item.id === props.currentPartner?.id) {
        return;
      }
      props.onChangePartner?.(item);
    };

    return {
      onSelect
    };
  }
});
</script>
<style lang="scss">
.k-layout-partner-switcher {
  display: flex;
  align-items: center;
  line-height: 48px;
  cursor: pointer;

  span {
    margin-left: 10px;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    color: #606cee;
  }
}

/* 自定义下拉列表，避免 ant-menu 选中左侧蓝条 */
.k-layout-partner-switcher-overlay {
  min-width: 140px;
  max-width: 280px;
  max-height: 500px;
  overflow-y: auto;
  padding: 4px 0;
  background: var(--oio-dropdown-background-color, #fff);
  border-radius: var(--oio-border-radius, 4px);
  box-shadow: var(--oio-dropdown-box-shadow, 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08));
}

.k-layout-partner-switcher-item {
  padding: 5px 12px;
  line-height: 22px;
  font-size: 14px;
  color: var(--oio-select-dropdown-color, rgba(0, 0, 0, 0.85));
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--oio-select-dropdown-hover-color, rgba(0, 0, 0, 0.85));
    background-color: var(--oio-select-dropdown-hover-background, #f5f5f5);
  }

  &.is-selected {
    color: var(--oio-select-dropdown-selected-color, #606cee);
    background-color: var(--oio-select-dropdown-selected, rgba(96, 108, 238, 0.1));
    font-weight: 500;
  }
}
</style>
