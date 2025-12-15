<template>
  <table-line-height :value="lineHeightType" @change="setLineHeightType" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TableLineHeight } from '../../../components';
import { TableLineHeightEnum } from '../../../typing';

export default defineComponent({
  name: 'DefaultLineHeightControl',
  components: {
    TableLineHeight
  },
  props: {
    lineHeightType: {
      type: String as PropType<TableLineHeightEnum>
    },
    setLineHeightType: {
      type: Function as PropType<(lineHeightType: TableLineHeightEnum) => void>
    }
  }
});
</script>

<style lang="scss"></style>
