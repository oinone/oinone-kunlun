<template>
  <a-select
    class="oio-select"
    dropdown-class-name="oio-select-dropdown"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :value="value"
    @change="change"
    @focus="focus"
    @blur="blur"
  >
    <a-select-option v-for="item in options" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
  </a-select>
</template>
<script lang="ts">
import { Select as ASelect } from 'ant-design-vue';
import { defineComponent } from 'vue';
import { OioCommonProps } from '../../../../basic';

export default defineComponent({
  components: {
    ASelect,
    ASelectOption: ASelect.Option
  },
  props: {
    ...OioCommonProps,
    options: {
      type: Array,
      required: true,
      default: () => []
    },
    placeholder: {
      type: String
    },
    allowClear: {
      type: Boolean
    },
    value: {
      type: Boolean
    }
  }
});
</script>
