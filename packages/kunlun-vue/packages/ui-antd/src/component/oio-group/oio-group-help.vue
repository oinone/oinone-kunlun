<template>
  <div class="oio-group-help">
    <a-tooltip
      :destroyTooltipOnHide="true"
      :color="helpBgColor"
      :autoAdjustOverflow="helpAdjustOverflow"
      :placement="helpPlacement"
    >
      <template #title>{{ help }}</template>
      <oio-icon :icon="helpIcon" :color="helpIconColor" :size="helpIconSize" />
    </a-tooltip>
  </div>
</template>
<script lang="ts">
import { OioGroupHelpProps, OioIcon } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'OioGroupHelp',
  inheritAttrs: false,
  components: {
    OioIcon
  },
  props: {
    ...OioGroupHelpProps
  }
});
</script>
