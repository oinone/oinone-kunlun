<template>
  <oio-dropdown v-if="currentPartner" :trigger="['click']" placement="bottomCenter">
    <div class="k-layout-partner-switcher">
      <span>{{ currentPartner.name }}</span>
      <caret-down-outlined :style="{ fontSize: '12px', color: '#c3c4c6' }" />
    </div>
    <template #overlay>
      <a-menu class="k-layout-partner-switcher-overlay" @click="onSelect">
        <a-menu-item v-for="item in partnerList" :key="item.id" :title="item.name">{{ item.name }}</a-menu-item>
      </a-menu>
    </template>
  </oio-dropdown>
</template>
<script lang="ts">
import { CaretDownOutlined } from '@ant-design/icons-vue';
import { OioDropdown } from '@kunlun/vue-ui-antd';
import { Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { defineComponent, PropType } from 'vue';
import { PartnerItem } from './typing';

export default defineComponent({
  name: 'PartnerSwitcher',
  components: {
    AMenu,
    AMenuItem,
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
    const onSelect = (e: { key: string }) => {
      const { key } = e;
      const target = props.partnerList?.find((v) => v.id === key);
      if (target) {
        props.onChangePartner?.(target);
      }
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
  }

  &:hover {
    color: #606cee;
  }
}

.k-layout-partner-switcher-overlay {
  max-height: 500px !important;
}
</style>
