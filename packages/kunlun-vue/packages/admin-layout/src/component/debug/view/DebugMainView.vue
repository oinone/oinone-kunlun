<template>
  <div class="oio-debug-main-view">
    <div class="oio-debug-main-view-toolbar">
      <a-tooltip title="包含页面调试数据和接口调试数据">
        <oio-button type="primary" @click="onDownload">下载全部调试数据</oio-button>
      </a-tooltip>
      <oio-button type="primary" @click="onImport">导入调试数据</oio-button>
      <input id="import-debug-info" type="file" style="display: none" accept=".json,application/json" />
    </div>
    <oio-tabs :activeKey="activeDebugTab" @update:active-key="changeActiveDebugTab">
      <oio-tab tab="页面调试" key="debugView" force-render>
        <slot name="debugView" />
      </oio-tab>
      <oio-tab tab="接口调试" key="debugApi" force-render>
        <slot name="debugApi" />
      </oio-tab>
    </oio-tabs>
  </div>
</template>
<script lang="ts">
import { RuntimeContext } from '@kunlun/engine';
import {
  CleanableEvent,
  OioButton,
  OioTab,
  OioTabs,
  Optional,
  uniqueKeyGenerator,
  useCleanableEvent
} from '@kunlun/vue-ui-antd';
import { defineComponent, onMounted, onUnmounted, PropType } from 'vue';
import 'vue-json-pretty/lib/styles.css';
import { DebugResponseData } from '../typing';
import { DebugUtils } from './debug-utils';

export default defineComponent({
  name: 'DebugMainView',
  components: {
    OioButton,
    OioTabs,
    OioTab
  },
  inheritAttrs: false,
  props: {
    activeDebugTab: {
      type: String
    },
    changeActiveDebugTab: {
      type: Function
    },
    responseAnalysis: {
      type: Function as PropType<(responseBody: DebugResponseData | DebugResponseData[]) => Promise<string>>
    }
  },
  setup(props) {
    let importChangeEvent: CleanableEvent | undefined;

    const getDownloadResponseData = () => {
      const { pageParameters, viewAction, requestInfo, responseData, runtimeContext } = DebugUtils.getDebugStorage();
      try {
        return DebugUtils.toJSONString({
          ...DebugUtils.generatorDownloadRequestInfo(requestInfo, responseData),
          pageParameters,
          viewAction,
          runtimeContext: Optional.ofNullable(runtimeContext)
            .map<RuntimeContext | string>((v) => DebugUtils.simplifyRuntimeContext(v))
            .orElse('no runtime context')
        });
      } catch (e) {
        return DebugUtils.toJSONString({
          ...requestInfo,
          responseData,
          pageParameters,
          viewAction,
          runtimeContext: Optional.ofNullable(runtimeContext)
            .map<RuntimeContext | string>((v) => DebugUtils.simplifyRuntimeContext(v))
            .orElse('no runtime context')
        });
      }
    };

    const getDownloadFilename = () => {
      return `oinone_all_debug_${uniqueKeyGenerator()}.json`;
    };

    const onDownload = () => {
      DebugUtils.downloadJSON(getDownloadResponseData(), getDownloadFilename());
    };

    const onImport = () => {
      importChangeEvent?.el?.click();
    };

    onMounted(() => {
      const reader = new FileReader();

      const fileInput = document.getElementById('import-debug-info');
      if (!fileInput) {
        return;
      }

      importChangeEvent = useCleanableEvent(fileInput, 'change', (e: any) => {
        const file = e.target?.files[0];
        if (!file) {
          return;
        }
        e.target.value = null;

        reader.onload = async (e) => {
          const content = e.target?.result;
          if (!content) {
            return;
          }
          try {
            const storage = DebugUtils.getDebugStorage();
            const data = JSON.parse(content as string);
            const { responseData, pageParameters, viewAction, runtimeContext, errors } = data;
            if (!responseData && !pageParameters && !viewAction && !runtimeContext && errors) {
              await props.responseAnalysis?.(data);
              storage.forceUpdate();
            } else {
              storage.requestInfo = data;
              if (responseData && typeof responseData === 'string') {
                storage.responseData = responseData;
              }
              if (pageParameters && typeof pageParameters !== 'string') {
                storage.pageParameters = pageParameters;
              }
              if (viewAction && typeof viewAction !== 'string') {
                storage.viewAction = viewAction;
              }
              if (runtimeContext && typeof runtimeContext !== 'string') {
                storage.runtimeContext = runtimeContext;
              }
              storage.forceUpdate();
            }
          } catch (e) {
            console.error('Error parse JSON.', e);
          }
        };

        reader.readAsText(file);
      });
    });

    onUnmounted(() => {
      importChangeEvent?.remove();
    });

    return {
      onDownload,
      onImport
    };
  }
});
</script>
<style lang="scss">
$textareaMinHeight: 300px;
$responseDataMinHeight: 372px;
$tabMinHeight: 404px;
$errorTabMinHeight: 404px;

.oio-debug-main-view {
  padding: 24px;
  min-width: 1280px;
  min-height: 100vh;
  background-color: #f3f7fa;
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  &-toolbar {
    text-align: right;

    .oio-button:not(:last-child) {
      margin-right: var(--oio-margin);
    }
  }

  .oio-debug-error-text {
    color: red;
  }

  .oio-debug-textarea {
    min-height: $textareaMinHeight;
  }

  .oio-debug-tabs {
    .oio-tab-content {
      min-height: $tabMinHeight;
    }
  }

  .vjs-tree {
    max-height: 500px;
    overflow-y: auto;
  }

  .oio-debug-error-tabs {
    .oio-tab-content {
      height: $tabMinHeight;
      overflow-y: auto;
    }
  }
}
</style>
