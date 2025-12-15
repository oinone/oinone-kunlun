<template>
  <div style="background: rgba(247, 181, 0, 0.1); padding: 9px 12px; border-radius: 4px; color: var(--oio-text-color)">
    {{ value }}
    <OioIcon
      icon="oinone-copy"
      size="12px"
      style="
        cursor: pointer;
        vertical-align: baseline;
        margin-left: 8px;
        background: rgba(247, 181, 0, 0.2);
        border-radius: 50%;
        padding: 4px;
      "
      color="#F7B500"
      @click="onCopy"
    ></OioIcon>
  </div>
</template>
<script lang="ts">
import { OioIcon, useCopy } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: String
    }
  },

  components: { OioIcon },
  inheritAttrs: false,
  setup(props) {
    const { browserCopyAndNotify } = useCopy();

    const onCopy = () => {
      browserCopyAndNotify(props.value || '');
    };

    return { onCopy };
  }
});
</script>
