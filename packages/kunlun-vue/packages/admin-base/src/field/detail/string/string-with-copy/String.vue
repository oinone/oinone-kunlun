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
import { defineComponent } from 'vue';
import { OioIcon, OioNotification } from '@oinone/kunlun-vue-ui-antd';

export default defineComponent({
  props: {
    value: {
      type: String
    }
  },

  components: { OioIcon },
  inheritAttrs: false,
  setup(props) {
    const onCopy = () => {
      // 创建一个临时的textarea元素
      let textarea = document.createElement('textarea');
      textarea.value = props.value!;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);

      // 选中textarea的文本
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      // 复制文本
      document.execCommand('copy');

      // 移除临时的textarea元素
      document.body.removeChild(textarea);

      OioNotification.success('复制', '复制成功');

      textarea = null as any;
    };

    return { onCopy };
  }
});
</script>
