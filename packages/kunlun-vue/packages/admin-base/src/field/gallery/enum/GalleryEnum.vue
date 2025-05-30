<template>
  <gallery-common-field :justify-content="justifyContent" :value="displayNameListStr" :empty-style="emptyStyle">
    <Enum v-if="optionColor && displayNameList" :display-name-list="displayNameList" :option-color="optionColor" />
    <span v-else>{{ displayNameListStr }}</span>
  </gallery-common-field>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import GalleryCommonField from '../common/GalleryCommonField.vue';
import Enum from '../../detail/enum/Enum.vue';

export default defineComponent({
  props: {
    displayNameList: {
      type: Array as PropType<Record<string, string>[]>,
      default: () => []
    },
    displayNameListStr: {
      type: String
    },
    justifyContent: {
      type: String
    },
    emptyStyle: {
      type: String
    },
    optionColor: {
      type: Boolean
    }
  },
  components: { Enum, GalleryCommonField },
  inheritAttrs: false
});
</script>
