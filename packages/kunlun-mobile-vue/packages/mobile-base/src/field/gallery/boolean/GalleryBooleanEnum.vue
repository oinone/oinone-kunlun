<template>
  <gallery-common-field
    :value="realValue"
    :is-empty="isEmpty"
    :justify-content="justifyContent"
    :empty-style="emptyStyle"
  >
    <template #default>
      <div :title="label">
        {{ label }}
      </div>
    </template>
  </gallery-common-field>
</template>
<script lang="ts">
import { BooleanHelper } from '@kunlun/shared';
import { isNil, toString } from 'lodash-es';
import { computed, defineComponent } from 'vue';
import { enumFetchLabelByValue } from '../../util';
import GalleryCommonField from '../common/GalleryCommonField.vue';

export default defineComponent({
  components: { GalleryCommonField },
  props: {
    value: {
      type: [Boolean, String],
      default: undefined
    },
    options: {
      type: Array
    },
    justifyContent: {
      type: String
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
