<template>
  <div class="default-view-control-icon">
    <div class="default-view-control-icon-inner">
      <TableSortField :fields="sortList" :onSortChange="onSortChange" />
      <TableLineHeight :value="lineHeightType" @change="onLineHeightTypeChange" />
      <oio-full-screen :value="fullScreen" @change="switchFullScreen" />
      <TableKeyboardShortcut />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TableSortField, TableLineHeight, OioFullScreen, TableKeyboardShortcut } from '../../components';

export default defineComponent({
  name: 'TableControlIcon',
  components: {
    TableSortField,
    TableLineHeight,
    OioFullScreen,
    TableKeyboardShortcut
  },
  props: [
    'sortList',
    'allFields',
    'onSortChange',
    'lineHeightType',
    'onLineHeightTypeChange',
    'fullScreen',
    'switchFullScreen'
  ],
  // inheritAttrs: false,
  setup(props) {
    return {};
  }
});
</script>

<style lang="scss">
.default-view-control-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  background-color: red;
  top: 0px;
  left: 0px;
  .default-view-control-icon-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
