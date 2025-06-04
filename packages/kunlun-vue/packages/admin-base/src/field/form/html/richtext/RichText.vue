<template>
  <div class="form-rich-text" :class="className">
    <Toolbar :editor-id="editorId" :editor="editorRef" :default-config="toolbarConfig" />
    <Editor
      ref="editorNodeRef"
      :editor-id="editorId"
      :default-config="editorConfig"
      v-model="defaultHtml"
      @onCreated="handleCreated"
      @onFocus="focus"
      @onBlur="onBlur"
      @onChange="handleChange"
      :style="editorStyle"
    />
  </div>
</template>
<script lang="ts">
import { delay } from 'lodash-es';
import { BooleanHelper, CSSStyle } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { createResourceFile, getFileSignature, ZH_CN_CODE } from '@oinone/kunlun-vue-ui-common';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { IToolbarConfig, i18nChangeLanguage } from '@wangeditor/editor';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';

import { computed, defineComponent, onBeforeUnmount, ref, shallowRef, watch } from 'vue';

type InsertImgFnType = (url: string, alt?: string, href?: string) => void;
type InsertVideoFnType = (url: string, poster?: string) => void;

function customUploadFile(resultFiles: File[], insertFn: Function) {
  new MyUploadAdapter().upload(resultFiles[0]).then((res: any) => {
    insertFn?.(res);
  });
}

class MyUploadAdapter {
  private loader!: any;

  private xhr!: any;

  // Starts the upload process.
  public async upload(file: File) {
    const { formData, downloadUrl } = await this._initRequest(file);
    return new Promise((resolve, reject) => {
      this._initListeners(resolve, reject, file, downloadUrl);
      this._sendRequest(formData);
    });
  }

  // Aborts the upload process.
  private abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  // Initializes the XMLHttpRequest object using the URL passed to the constructor.
  private async _initRequest(file) {
    const xhr = new XMLHttpRequest();
    this.xhr = xhr;
    const { singleUploadData, downloadUrl } = await getFileSignature(file.name);
    const { uploadFormData, uploadUrl } = singleUploadData!;

    const formData = new FormData();

    uploadFormData &&
      Object.keys(uploadFormData).forEach((key) => {
        formData.append(key, uploadFormData[key]);
      });
    formData.append('file', file);
    xhr.open('POST', uploadUrl);
    return { formData, downloadUrl };
  }

  // Initializes XMLHttpRequest listeners.
  private _initListeners(resolve, reject, file, downloadUrl) {
    const { xhr } = this;
    // const { loader } = this;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', async (response) => {
      const fileObj = await createResourceFile(response, downloadUrl, file.size, file.name);
      resolve({
        default: fileObj.url
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          // loader.uploadTotal = evt.total;
          // loader.uploaded = evt.loaded;
        }
      });
    }
  }

  private _sendRequest(formData) {
    this.xhr.send(formData);
  }
}

export default defineComponent({
  components: { Toolbar, Editor },
  props: [
    'value',
    'field',
    'change',
    'defaultValue',
    'placeholder',
    'blur',
    'focus',
    'readonly',
    'disabled',
    'maxLength',
    'encode',
    'height'
  ],
  setup(props) {
    const editorId = `${DEFAULT_PREFIX}-richtext-${Math.random().toString().slice(-5)}`; // 【注意】编辑器 id ，要全局唯一
    const defaultHtml = ref('');
    const editorRef = shallowRef();
    const innerReadonly = computed(() => BooleanHelper.toBoolean(props.readonly));
    const innerDisabled = computed(() => BooleanHelper.toBoolean(props.disabled));
    let innerChange = false;

    const lang = Reflect.get(window, '__lang');
    if (lang !== ZH_CN_CODE) {
      i18nChangeLanguage('en');
    }

    const className = computed(() => {
      return { 'form-rich-text-disabled': innerDisabled.value, 'form-rich-text-readonly': innerReadonly.value };
    });

    const toolbarConfig: Partial<IToolbarConfig> = {
      // 插入哪些菜单
      insertKeys: {
        index: 0, // 自定义插入的位置
        keys: ['uploadAttachment'] // “上传附件”菜单
      }
    };
    const editorConfig = computed(() => {
      return {
        placeholder: props.placeholder || `${translateValueByKey('请输入内容')}...`,
        readOnly: innerDisabled.value || innerReadonly.value,
        // 在编辑器中，点击选中“附件”节点时，要弹出的菜单
        hoverbarKeys: {
          attachment: {
            menuKeys: ['downloadAttachment'] // “下载附件”菜单
          }
        },
        MENU_CONF: {
          fontName: {},
          head: {},
          fontSize: {
            fontSizeList: [
              { name: '10px', value: '10px' },
              { name: '12px', value: '12px' },
              { name: '14px', value: '14px' },
              { name: '18px', value: '18px' },
              { name: '24px', value: '24px' },
              { name: '32px', value: '32px' },
              { name: '48px', value: '48px' }
            ]
          },
          bold: {},
          italic: {},
          strikeThrough: {},
          underline: {},
          indent: {},
          lineHeight: {},
          foreColor: {},
          backColor: {},
          justify: {},
          list: {},
          todo: {},
          link: {},
          quote: {},
          splitLine: {},
          emoticon: {},
          image: {},
          table: {},
          code: {},
          undo: {},
          redo: {},
          uploadImage: {
            // 单个文件的最大体积限制，默认为 2M
            maxFileSize: 10 * 1024 * 1024, // 10M
            // 最多可上传几个文件，默认为 100
            maxNumberOfFiles: 100,
            // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
            allowedFileTypes: ['image/*'],
            // 自定义上传
            async customUpload(file: File, insertFn: InsertImgFnType) {
              customUploadFile([file], (res: any) => insertFn(res.default));
            }
          },
          uploadVideo: {
            // 单个文件的最大体积限制，默认为 10M
            maxFileSize: 100 * 1024 * 1024, // 100M
            // 最多可上传几个文件，默认为 5
            maxNumberOfFiles: 50,
            // 选择文件时的类型限制，默认为 ['video/*'] 。如不想限制，则设置为 []
            allowedFileTypes: ['video/*'],
            // 自定义上传
            async customUpload(file: File, insertFn: InsertVideoFnType) {
              customUploadFile([file], (res: any) => insertFn(res.default));
            }
          },
          uploadAttachment: {
            // 单个文件的最大体积限制，默认为 10M
            maxFileSize: 100 * 1024 * 1024, // 100M
            // 最多可上传几个文件，默认为 5
            maxNumberOfFiles: 50,
            // 选择文件时的类型限制。如不想限制，则设置为 []
            // allowedFileTypes: [],
            // 自定义上传
            async customUpload(file: File, insertFn: Function) {
              customUploadFile([file], (res: any) => insertFn(file.name, res.default));
            }
          }
        },
        EXTEND_CONF: {}
      };
    });

    watch(
      () => props.value,
      () => {
        setTimeout(() => {
          if (props.value) {
            if (!innerChange) {
              props.focus?.();
            }
            if (!innerChange && (props.value || props.defaultValue)) {
              if (props.encode) {
                defaultHtml.value = decodeURI(props.value || props.defaultValue);
              } else {
                defaultHtml.value = props.value || props.defaultValue;
              }
            } else {
              innerChange = false;
            }
            if (!props.value) {
              defaultHtml.value = '';
            }
          }
        }, 100);
      },
      { immediate: true }
    );

    const handleCreated = (editor) => {
      editorRef.value = editor;
    };

    const onBlur = () => {
      props.blur?.();
      delay(() => {
        innerChange = false;
      }, 110);
    };

    const editorStyle = computed(() => {
      const style = {} as CSSStyle;
      style.height = props.height || '400px';
      style.overflowY = 'hidden';
      return style;
    });

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      editorRef.value.destroy?.();
    });

    const handleChange = (editor) => {
      const html = editor.getHtml?.();
      if (html === '') {
        props.change?.('');
        return;
      }

      if (html !== props.value) {
        innerChange = true;
      }
      props.change?.(html);
    };

    const editorNodeRef = ref(null as any);
    watch(
      () => props.placeholder,
      () => {
        if (editorNodeRef.value) {
          // 解决wangeditor在设计器不能动态修改placeholder的问题
          const placeholderEl = editorNodeRef.value.$el.querySelector('.w-e-text-placeholder');
          if (placeholderEl) {
            placeholderEl.innerHTML = props.placeholder;
          }
        }
      }
    );

    return {
      handleCreated,
      handleChange,
      onBlur,
      editorId,
      defaultHtml,
      editorRef,
      editorNodeRef,
      toolbarConfig,
      editorConfig,
      innerReadonly,
      innerDisabled,
      className,
      editorStyle
    };
  }
});
</script>
