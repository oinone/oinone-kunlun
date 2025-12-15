<template>
  <div class="debug-json-view">
    <oio-button
      class="debug-json-view-btn"
      type="primary"
      size="small"
      icon="oinone-code-mode"
      @click="onShowJSONDialog"
      >JSON视图
    </oio-button>
    <oio-textarea :class="textClass" :value="text" @update:value="onUpdateText" />
    <a-modal
      v-if="showJSONDialog"
      v-model:open="showJSONDialog"
      width="100%"
      wrap-class-name="full-modal"
      :title="null"
      :footer="null"
      @cancel="onCancel"
    >
      <vue-json-pretty :data="debugJSONObject" v-bind="vueJsonPrettyConfig" />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { OioButton, OioTextarea } from '@oinone/kunlun-vue-ui-antd';
import { isArrayLikeObject, isObject, isString } from 'lodash-es';
import { defineComponent, ref } from 'vue';
import VueJsonPretty from 'vue-json-pretty';
import { DebugUtils } from '../debug-utils';

export default defineComponent({
  components: {
    OioButton,
    OioTextarea,
    VueJsonPretty
  },
  inheritAttrs: false,
  props: {
    text: {
      type: [String, Object, Array]
    },
    textClass: {
      type: String
    }
  },
  emits: ['update:text'],
  setup(props, { emit }) {
    const showJSONDialog = ref(false);
    const debugJSONObject = ref({});
    const buildDebugJSONObject = () => {
      if (isString(props.text) && (props.text.startsWith('{') || props.text.startsWith('['))) {
        return DebugUtils.toJSONObject(props.text);
      }
      if (isObject(props.text) || isArrayLikeObject(props.text)) {
        return props.text;
      }
      return null;
    };

    const vueJsonPrettyConfig = { showIcon: true, showLength: true, showLineNumber: true };

    function onShowJSONDialog() {
      debugJSONObject.value = buildDebugJSONObject();
      showJSONDialog.value = true;
    }

    function onCancel() {
      debugJSONObject.value = {};
      showJSONDialog.value = false;
    }

    const onUpdateText = (text: string) => {
      emit('update:text', text);
    };

    return { showJSONDialog, vueJsonPrettyConfig, debugJSONObject, onShowJSONDialog, onCancel, onUpdateText };
  }
});
</script>
<style lang="scss">
.debug-json-view {
  position: relative;

  &-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 99;
  }
}

.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
    overflow: auto;
  }

  .ant-modal-body {
    flex: 1;
  }
}
</style>
