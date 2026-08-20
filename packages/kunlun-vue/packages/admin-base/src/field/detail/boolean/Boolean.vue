<template>
  <detail-common-field :value="realLabel" :wrapperToFieldAction="wrapperToFieldAction" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useBoolean } from '../../../basic/field/boolean';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  components: {
    DetailCommonField
  },
  props: {
    value: {
      type: Boolean,
      default: undefined,
      required: false
    },
    wrapperToFieldAction: {
      type: Function
    }
  },
  setup(props) {
    const { realLabel } = useBoolean(props);
    return {
      realLabel
    };
  }
});
</script>
