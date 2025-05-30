<template>
  <detail-common-field :value="realValue" :empty-style="emptyStyle">
    <template #default>
      <div v-html="realValue" />
    </template>
  </detail-common-field>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  components: { DetailCommonField },
  props: {
    value: {
      type: String
    },
    encode: {
      type: Boolean
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const realValue = computed(() => {
      if (props.encode && props.value) {
        return decodeURI(props.value);
      }
      return props.value;
    });
    return {
      realValue
    };
  }
});
</script>
