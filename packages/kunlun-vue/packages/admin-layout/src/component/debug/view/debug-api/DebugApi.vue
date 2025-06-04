<template>
  <div class="oio-debug-api" v-if="activeDebugTab === 'debugApi'">
    <div class="oio-debug-api-wrapper">
      <oio-group class="oio-debug-request" title="接口调试" help="请通过浏览器控制台复制fetch格式请求粘贴至以下输入框">
        <oio-textarea class="oio-debug-textarea" v-model:value="requestData" />
        <template #titleToolbar>
          <div class="oio-debug-error-text" v-if="requestHint">{{ requestHint }}</div>
          <div class="oio-debug-level">
            <oio-tooltip-help>
              <template #title>
                <div class="oio-debug-level-label-help">
                  <span>日志级别</span>
                  <ul>
                    <li>默认调试: 1</li>
                    <li>权限调试: 2</li>
                    <li>Debug级别日志调试: 3</li>
                    <li>Trace级别日志调试: 4</li>
                  </ul>
                </div>
              </template>
            </oio-tooltip-help>
            <div class="oio-debug-level-label">日志级别</div>
            <oio-input-number v-model:value="logLevel" min="1" @blur="onLogLevelBlur" />
          </div>
          <oio-button type="primary" async @click="onRequest">发起请求</oio-button>
          <oio-button type="primary" @click="onReset">重置</oio-button>
        </template>
      </oio-group>
      <oio-group class="oio-debug-response" title="接口响应结果">
        <debug-json-view text-class="oio-debug-textarea" :text="responseData" />
        <template #titleToolbar>
          <oio-button v-if="isShowResponseInfo" type="primary" @click="onDownload">下载接口调试数据</oio-button>
        </template>
      </oio-group>
    </div>
    <debug-request-info-panel v-if="isShowResponseInfo" :request-info="requestInfo" />
    <debug-response-panel v-if="isShowResponseInfo" :request-info="requestInfo" />
  </div>
</template>
<script lang="ts">
import {
  OioButton,
  OioGroup,
  OioInputNumber,
  OioTextarea,
  OioTooltipHelp,
  uniqueKeyGenerator
} from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, PropType, Ref, ref } from 'vue';
import { DebugFetchRequest, DebugFetchResponse, DebugRequestInfo } from '../../typing';
import DebugJsonView from '../components/DebugJsonView.vue';
import DebugRequestInfoPanel from '../components/DebugRequestInfoPanel.vue';
import DebugResponsePanel from '../components/DebugResponsePanel.vue';
import { DebugUtils } from '../debug-utils';
import { useDebugRequestInfo } from '../useDebugRequestInfo';

function setData(val: Ref, newValue, defaultValue = '') {
  if (newValue === undefined) {
    return;
  }
  if (newValue === null) {
    val.value = defaultValue;
  } else {
    val.value = newValue;
  }
}

export default defineComponent({
  name: 'DebugApi',
  components: {
    DebugResponsePanel,
    DebugRequestInfoPanel,
    OioButton,
    OioGroup,
    OioInputNumber,
    OioTextarea,
    OioTooltipHelp,
    DebugJsonView
  },
  inheritAttrs: false,
  props: {
    activeDebugTab: {
      type: String
    },
    requestInfo: {
      type: Object as PropType<DebugRequestInfo>
    },
    responseData: {
      type: String
    },
    resolveRequestData: {
      type: Function as PropType<(data: string) => DebugFetchRequest | undefined>
    },
    request: {
      type: Function as PropType<(fetchObject: DebugFetchRequest) => DebugFetchResponse | undefined>
    },
    resetInfo: {
      type: Function
    }
  },
  setup(props) {
    const logLevel = ref(1);
    const requestData = ref('');
    const requestHint = ref('');

    const { isShowResponseInfo, isShowError } = useDebugRequestInfo(props);

    const getDownloadResponseData = () => {
      const requestInfo = props.requestInfo;
      if (!isShowResponseInfo.value || !props.responseData || !requestInfo) {
        return '';
      }
      try {
        return DebugUtils.toJSONString(DebugUtils.generatorDownloadRequestInfo(requestInfo, props.responseData));
      } catch (e) {
        return DebugUtils.toJSONString({
          ...props.requestInfo,
          responseData: props.responseData
        });
      }
    };

    const getDownloadFilename = () => {
      if (!isShowResponseInfo.value) {
        return '';
      }
      return `oinone_debug_${uniqueKeyGenerator()}.json`;
    };

    const clearLastedRequestInfo = () => {
      requestHint.value = '';
      props.resetInfo?.();
    };

    const onLogLevelBlur = () => {
      if (!logLevel.value || logLevel.value <= 1) {
        logLevel.value = 1;
      }
    };

    const onRequest = async () => {
      clearLastedRequestInfo();
      const body = requestData.value;
      if (!body) {
        requestHint.value = '请输入请求内容';
        return;
      }
      const fetchObject = await props.resolveRequestData?.(body);
      if (!fetchObject) {
        requestHint.value = '请求内容格式无法识别';
        return;
      }
      const fetchResponse = await props.request?.({
        ...fetchObject,
        level: logLevel.value || 1
      });
      if (!fetchResponse) {
        requestHint.value = '无法正确获取响应结果';
        return;
      }
      const { hint } = fetchResponse;

      setData(requestHint, hint);
      DebugUtils.getDebugStorage().responseData = props.responseData;
    };

    const onReset = () => {
      logLevel.value = 1;
      requestData.value = '';
      requestHint.value = '';
      props.resetInfo?.();
    };

    const onDownload = () => {
      DebugUtils.downloadJSON(getDownloadResponseData(), getDownloadFilename());
    };

    return {
      logLevel,
      requestData,
      requestHint,

      isShowResponseInfo,
      isShowError,

      onLogLevelBlur,
      onRequest,
      onReset,
      onDownload
    };
  }
});
</script>
<style lang="scss">
.oio-debug-api {
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  .oio-debug-api-wrapper {
    display: flex;
    column-gap: 16px;
    align-items: flex-start;

    & > div {
      flex: 1;
    }

    .oio-debug-response .oio-group-title-wrapper {
      height: 48px;
    }
  }

  .oio-debug-level {
    width: 140px;
    display: flex;
    align-items: center;
    column-gap: 8px;

    &-label {
      white-space: nowrap;
    }
  }
}
</style>
