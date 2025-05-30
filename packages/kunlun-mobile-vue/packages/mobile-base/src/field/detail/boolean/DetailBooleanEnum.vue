<template>
  <detail-common-field :value="realValue" :is-empty="isEmpty" :empty-style="emptyStyle">
    <template #default>
      <div :title="label">
        {{ label }}
      </div>
    </template>
  </detail-common-field>
</template>
<script lang="ts">
import { BooleanHelper } from '@kunlun/shared';
import { isNil, toString } from 'lodash-es';
import { computed, defineComponent } from 'vue';
import { enumFetchLabelByValue } from '../../util';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField },
  props: {
    value: {
      type: [Boolean, String],
      default: undefined
    },
    options: {
      type: Array
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const realValue = computed(() => {
      return BooleanHelper.toBoolean(props.value);
    });

    const label = computed(() => {
      const value = realValue.value;
      if (isNil(value)) {
        return '';
      }
      return enumFetchLabelByValue(toString(value), props.options);
    });

    const isEmpty = computed(() => {
      return !!isNil(realValue.value);
    });

    return {
      realValue,
      label,
      isEmpty
    };
  }
});
</script>
