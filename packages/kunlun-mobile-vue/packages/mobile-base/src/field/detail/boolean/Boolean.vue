<template>
  <detail-common-field :value="realLabel" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DetailCommonField from '../common/DetailCommonField.vue';
import { useBoolean } from '../../../basic/field/boolean';

export default defineComponent({
  components: { DetailCommonField },
  props: {
    value: {
      type: Boolean,
      default: undefined,
      required: false
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
