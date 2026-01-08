<template>
  <div class="oio-debug-request-info">
    <oio-group class="oio-debug-request-info" title="请求信息">
      <oio-form>
        <oio-row :wrap="true">
          <oio-col class="oio-debug-basic-info" flex="1">
            <oio-form-item label="URL">
              <span>{{ requestInfo.url }}</span>
            </oio-form-item>
            <oio-form-item label="请求方式">
              <span>{{ requestInfo.method }}</span>
            </oio-form-item>
            <oio-form-item label="完整请求耗时(毫秒)">
              <span>{{ requestInfo.allDuration }}</span>
            </oio-form-item>
            <oio-form-item label="连接耗时(毫秒)">
              <span>{{ requestInfo.connectDuration }}</span>
            </oio-form-item>
            <oio-form-item label="请求耗时(毫秒)">
              <span>{{ requestInfo.requestDuration }}</span>
            </oio-form-item>
            <oio-form-item label="响应耗时(毫秒)">
              <span>{{ requestInfo.responseDuration }}</span>
            </oio-form-item>
            <template v-if="isShowError">
              <oio-form-item class="oio-debug-error-text" label="异常编码">
                <span>{{ requestInfo.errorCode }}</span>
              </oio-form-item>
              <oio-form-item class="oio-debug-error-text" label="异常信息">
                <span>{{ requestInfo.errorMessage }}</span>
              </oio-form-item>
            </template>
            <template v-else>
              <oio-form-item label=" ">
                <span>无异常</span>
              </oio-form-item>
            </template>
          </oio-col>
          <oio-col flex="1">
            <oio-form-item label="请求头">
              <oio-textarea class="oio-debug-textarea" :value="requestInfo.header" />
            </oio-form-item>
          </oio-col>
        </oio-row>
      </oio-form>
    </oio-group>
    <oio-tabs destroyInactiveTabPane>
      <oio-tab v-for="gqlInfo of requestInfo.gqlInfos" :tab="gqlInfo.title" :key="gqlInfo.key">
        <oio-form>
          <oio-form-item label="GQL">
            <oio-textarea class="oio-debug-textarea" :value="gqlInfo.gql" />
          </oio-form-item>
          <oio-form-item label="Variables">
            <oio-textarea class="oio-debug-textarea" :value="gqlInfo.variables" />
          </oio-form-item>
        </oio-form>
        <oio-tabs v-if="gqlInfo.handledExceptions" class="oio-debug-tabs" destroyInactiveTabPane>
          <oio-tab v-for="panel of gqlInfo.handledExceptions" :tab="panel.title" :key="panel.key">
            <component v-if="panel.component" :is="panel.component" v-bind="constructPanelProps(panel)" />
            <debug-default-info v-else v-bind="panel" />
          </oio-tab>
        </oio-tabs>
      </oio-tab>
    </oio-tabs>
  </div>
</template>
<script lang="ts">
import { OioCol, OioForm, OioFormItem, OioGroup, OioRow, OioTab, OioTabs, OioTextarea } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, onMounted, PropType, ref } from 'vue';
import { DebugErrorPanel, DebugRequestGraphQLInfo, DebugRequestInfo } from '../../typing';
import { loadScript } from '../../util';
import { useDebugRequestInfo } from '../useDebugRequestInfo';
import DebugDefaultInfo from './DebugDefaultInfo.vue';

export default defineComponent({
  name: 'DebugRequestInfoPanel',
  components: {
    OioCol,
    OioForm,
    OioFormItem,
    OioGroup,
    OioRow,
    OioTab,
    OioTabs,
    OioTextarea,
    DebugDefaultInfo
  },
  inheritAttrs: false,
  props: {
    requestInfo: {
      type: Object as PropType<DebugRequestInfo>
    }
  },
  setup(props) {
    onMounted(async () => {
      try {
        await loadScript('https://unpkg.com/prettier@3.7.2/standalone.js', 'prettier-standalone');
        await loadScript('https://unpkg.com/prettier@3.7.2/plugins/graphql.js', 'prettier-plugins-graphql');
        props.requestInfo?.gqlInfos?.forEach((gqlInfo) => {
          formatGql(gqlInfo);
        });
      } catch (e) {
        console.warn('prettier load err ', e);
      }
    });

    async function formatGql(gqlInfo: DebugRequestGraphQLInfo) {
      try {
        const prettier = Reflect.get(window, 'prettier') as any;
        const prettierPlugins = Reflect.get(window, 'prettierPlugins') as any;
        if (prettier && prettierPlugins) {
          gqlInfo.gql = await prettier.format(gqlInfo.gql, {
            parser: 'graphql',
            plugins: prettierPlugins
          });
        }
      } catch (e) {
        console.error('gql format err', e);
      }
    }

    const constructPanelProps = (panel: DebugErrorPanel) => {
      const properties = { ...panel };
      delete properties.component;
      return properties;
    };

    return {
      ...useDebugRequestInfo(props),
      constructPanelProps
    };
  }
});
</script>
<style lang="scss">
.oio-debug-request-info {
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  .oio-form {
    .oio-debug-basic-info .oio-form-item.oio-form-item-horizontal > .ant-form-item-label {
      width: 190px;
      max-width: unset;
    }

    .oio-form-item.oio-form-item-horizontal > .ant-form-item-label {
      width: 80px;
      max-width: unset;
    }
  }

  .oio-debug-stack-info-textarea {
    min-height: 600px;
  }
}
</style>
