<template>
  <iframe
    class="oio-preview-html"
    ref="iframeRef"
    :style="style"
    :class="className"
    width="100%"
    border="none"
  ></iframe>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, PropType, ref } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    class: {
      type: [String, Array] as PropType<string | string[]>
    },
    style: {
      type: Object as PropType<CSSStyleDeclaration>,
      default: () => ({} as CSSStyleDeclaration)
    },
    html: {
      type: String
    }
  },
  setup(props) {
    const iframeRef = ref<HTMLIFrameElement>(null as any);
    onMounted(() => {
      nextTick(() => {
        iframeRef.value.src = 'about:blank';
        iframeRef.value.addEventListener('load', () => {
          initRichTextIframe(iframeRef.value.contentDocument!);
        });
      });
    });

    function initRichTextIframe(iframeDoc: Document) {
      if (!iframeDoc) {
        return;
      }
      const cssString = `
  body {
    margin: 0;
    padding: 0;
  }
  img {
    max-width: 100%;
  }
  blockquote {
    border-left: 8px solid #d0e5f2;
    padding: 10px 10px;
    margin: 10px 0;
    background-color: #f1f1f1;
  }

  code {
    font-family: monospace;
    background-color: #eee;
    padding: 3px;
    border-radius: 3px;
  }
  pre > code {
    display: block;
    padding: 10px;
  }

  table {
    border-collapse: collapse;
  }
  td, th {
    border: 1px solid #ccc;
    min-width: 50px;
    height: 20px;
  }
  th {
    background-color: #f1f1f1;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  input[type="checkbox"] {
    margin-right: 5px;
  }
`;

      const styleEl = iframeDoc.createElement('style');
      styleEl.type = 'text/css';

      if ((styleEl as any).styleSheet) {
        // IE
        (styleEl as any).styleSheet.cssText = cssString;
      } else {
        // Other browsers
        styleEl.appendChild(iframeDoc.createTextNode(cssString));
      }

      iframeDoc.head.appendChild(styleEl);
      if (iframeDoc.body) {
        let { html } = props;
        if (html) {
          // 解决iframe内附件默认打开在当前页面覆盖了当前页面html代码的问题
          html = html.replaceAll('data-w-e-type="attachment"', 'data-w-e-type="attachment" target="__blank"');
        }
        iframeDoc.body.innerHTML = html || '';
      }
    }

    const className = computed(() => props.class);

    return {
      iframeRef,
      className
    };
  }
});
</script>
<style>
.oio-preview-html {
  border: 0;
  width: 100%;
}
</style>
