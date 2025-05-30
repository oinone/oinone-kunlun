<template>
  <detail-common-field :value="value" :is-empty="isRealEmpty" :empty-style="emptyStyle">
    <Upload :value="value" readonly />
  </detail-common-field>
</template>
<script lang="ts">
import { isEmpty } from 'lodash-es';
import { computed, defineComponent, PropType } from 'vue';
import Upload from '../../../components/upload/Upload.vue';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  name: 'ReadonlyUpload',
  components: { Upload, DetailCommonField },
  props: {
    value: {
      type: [String, Array] as PropType<string | string[]>
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const isRealEmpty = computed(() => {
      return isEmpty(props.value);
    });

    return {
      isRealEmpty
    };
  }
});
</script>
