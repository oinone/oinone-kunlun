<template>
  <gallery-common-field :justify-content="justifyContent" :value="realLabel" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { translate } from '@kunlun/engine';
import GalleryCommonField from '../common/GalleryCommonField.vue';
import { useBoolean } from '../../../basic/field/boolean';

export default defineComponent({
  components: { GalleryCommonField },
  props: {
    value: {
      type: Boolean,
      default: undefined,
      required: false
    },
    justifyContent: {
      type: String
    },
    emptyStyle: {
      type: String
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
