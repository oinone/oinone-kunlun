<template>
  <gallery-common-field
    class="mobile-default-gallery-color-picker"
    :value="value"
    :justify-content="justifyContent"
    :empty-style="emptyStyle"
  >
    <oio-color-picker readonly :value="value" />
  </gallery-common-field>
</template>
<script lang="ts">
import { FlexRowJustify, OioColorPicker } from '@oinone/kunlun-vue-ui-mobile-vant';
import { isEmpty } from 'lodash-es';
import { computed, defineComponent, PropType, ref } from 'vue';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'DefaultColorPicker',
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    justifyContent: {
      type: String as PropType<FlexRowJustify>
    },
    emptyStyle: {
      type: String
    }
  },
  components: {
    GalleryCommonField,
    OioColorPicker
  },
  setup(props) {
    const visible = ref(false);
    const visibility = computed<boolean>({
      get() {
        if (isEmpty(props.value)) {
          return false;
        }
        return visible.value;
      },
      set(val) {
        visible.value = val;
      }
    });

    return {
      visible,
      visibility
    };
  }
});
</script>
