<template>
  <div class="form-rich-text form-expression-rich-text">
    <Toolbar :editor-id="editorId" :editor="editorRef" :default-config="toolbarConfig" :mode="mode" />
    <Editor
      :editor-id="editorId"
      :default-config="editorConfig"
      :mode="mode"
      v-model="defaultHtml"
      @onCreated="handleCreated"
      @onDestroyed="handleDestroyed"
      @onChange="handleChange"
      style="height: 500px; overflow-y: hidden"
    />
  </div>
</template>
<script lang="ts">
import { computed, onBeforeUnmount, PropType, ref, shallowRef, watch } from 'vue';
import { ZH_CN_CODE } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { i18nChangeLanguage } from '@wangeditor/editor';
import {
  IVariableContextItem,
  ExpressionElementClass,
  OioWangEditExpressionModalMenuConf,
  EXPRESSION_MODAL_CLASS_NAME,
  EXPRESSION_MODAL_PANEL_CLASS_NAME
} from '@kunlun/vue-expression';
import '@wangeditor/editor/dist/css/style.css';
import { uniqueKeyGenerator } from '@kunlun/shared';

const EDITOR_DEFAULT_HTML = '<p><br></p>';
const EDITOR_EXP_MODAL_CLASS = 'exp-modal-in-body';
export default {
  components: { Editor, Toolbar },
  props: {
    contextItems: Array as PropType<IVariableContextItem[]>,
    change: Function,
    value: String
  },
  setup(props) {
    const editorId = `${ExpressionElementClass}-${Math.random().toString().slice(-5)}`; //【注意】编辑器 id ，要全局唯一

    const defaultHtml = ref('');
    const isChangedByUser = ref(false);
    const editorRef = shallowRef();

    const lang = Reflect.get(window, '__lang');
    if (lang !== ZH_CN_CODE) {
      i18nChangeLanguage('en');
    }

    const toolbarConfig = {
      insertKeys: {
        index: 28, //
        keys: [OioWangEditExpressionModalMenuConf.key]
      },
      // FIXME: 全屏显示有些bug
      excludeKeys: ['fullScreen', 'uploadImage', 'insertVideo'],
      modalAppendToBody: true
    };
    const editorConfig = computed(() => {
      return {
        placeholder: `${translateValueByKey('请输入内容')}...`,
        EXTEND_CONF: { contextItems: props.contextItems }
      };
    });
    watch(
      () => props.contextItems,
      (newVal) => {
        if (!newVal) return;
        const editor = editorRef.value;
        if (editor == null) return;
        const config = editor.getConfig();
        if (config.EXTEND_CONF) {
          config.EXTEND_CONF['contextItems'] = newVal;
        }
      },
      { deep: true, immediate: true }
    );

    watch(
      () => props.value,
      () => {
        if (props.value) {
          defaultHtml.value = props.value;
        }
      },
      { immediate: true }
    );

    const expressionModalClassList = [] as string[];

    const handleCreated = (editor) => {
      editorRef.value = editor;

      editor.on('modalOrPanelShow', (modalOrPanel) => {
        if (modalOrPanel.type !== 'modal') return;
        const { $elem } = modalOrPanel;
        const [htmlEle] = $elem as HTMLElement[];
        if (htmlEle) {
          const classNames: string[] = [EDITOR_EXP_MODAL_CLASS];
          const randomClassName = [EDITOR_EXP_MODAL_CLASS, uniqueKeyGenerator(8)].join('_');
          expressionModalClassList.push(randomClassName);
          classNames.push(randomClassName);
          if ([...htmlEle.children].find((a) => a.className.includes(EXPRESSION_MODAL_PANEL_CLASS_NAME))) {
            classNames.push(EXPRESSION_MODAL_CLASS_NAME);
          }
          htmlEle.className = [htmlEle.className, ...classNames].join(' ');
        }
      });
    };

    const handleDestroyed = (editor) => {
      if (!expressionModalClassList.length) {
        return;
      }
      const domList = document.querySelectorAll(expressionModalClassList.map((a) => `.${a}`).join(', '));
      domList.forEach((dom) => {
        dom.remove();
      });
    };

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      editorRef.value.destroy?.();
    });

    const handleChange = (editor) => {
      const html = editor.getHtml?.();
      if (html === EDITOR_DEFAULT_HTML) {
        props.change?.('');
        return;
      }
      isChangedByUser.value = true;
      props.change?.(html);
    };

    return {
      editorId,
      mode: 'simple',
      defaultHtml,
      toolbarConfig,
      editorConfig,
      editorRef,
      handleCreated,
      handleDestroyed,
      handleChange
    };
  }
};
</script>
<style lang="scss">
.exp-modal-in-body.w-e-modal {
  z-index: 9999;
  left: unset !important;
  right: 10px !important;
  bottom: 10px;
}
</style>
