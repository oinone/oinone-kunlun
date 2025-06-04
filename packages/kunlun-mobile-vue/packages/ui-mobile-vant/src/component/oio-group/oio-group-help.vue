<template>
  <div :class="`${DEFAULT_PREFIX}-group-help`">
    <div
      :destroyTooltipOnHide="true"
      :color="helpBgColor"
      :autoAdjustOverflow="helpAdjustOverflow"
      :placement="helpPlacement"
    >
      {{ help }}
      <oio-icon :icon="helpIcon" :color="helpIconColor" :size="helpIconSize" />
    </div>
  </div>
</template>
<script lang="ts">
import { OioGroupHelpProps, OioIcon } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioGroupHelp',
  inheritAttrs: false,
  components: {
    OioIcon
  },
  props: {
    ...OioGroupHelpProps
  },
  setup() {
    return { DEFAULT_PREFIX };
  }
});
</script>
