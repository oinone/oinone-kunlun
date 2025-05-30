<template>
  <gallery-common-field :value="value" :is-empty="isRealEmpty" :empty-style="emptyStyle">
    <UploadImg :value="value" readonly />
  </gallery-common-field>
</template>
<script lang="ts">
import { isEmpty } from 'lodash-es';
import { computed, defineComponent, PropType } from 'vue';
import UploadImg from '../../../../components/upload/UploadImg.vue';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'ReadonlyUploadImg',
  components: { UploadImg, GalleryCommonField },
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
