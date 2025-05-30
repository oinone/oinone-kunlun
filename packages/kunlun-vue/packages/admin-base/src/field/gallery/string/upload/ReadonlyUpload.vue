<template>
  <gallery-common-field :value="value" :is-empty="isRealEmpty" :empty-style="emptyStyle">
    <Upload :value="value" readonly :cdnKey="cdnKey" :privateLink="privateLink" />
  </gallery-common-field>
</template>
<script lang="ts">
import { isEmpty } from 'lodash-es';
import { computed, defineComponent, PropType } from 'vue';
import Upload from '../../../../components/upload/Upload.vue';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'ReadonlyUpload',
  components: { Upload, GalleryCommonField },
  props: {
    value: {
      type: [String, Array] as PropType<string | string[]>
    },
    emptyStyle: {
      type: String
    },
    cdnKey: {
      type: String
    },
    privateLink: {
      type: Boolean,
      default: undefined
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
