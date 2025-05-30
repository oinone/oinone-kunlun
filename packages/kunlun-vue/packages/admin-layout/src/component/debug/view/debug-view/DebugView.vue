<template>
  <div class="oio-debug-view" v-if="activeDebugTab === 'debugView'">
    <div class="oio-debug-view-wrapper">
      <oio-group v-if="isShowPageParameters" class="oio-debug-page-parameters" title="页面参数">
        <oio-form class="oio-debug-info-form">
          <oio-form-item
            v-for="parameter of resolvedPageParameters"
            :key="parameter.key"
            :label="parameter.label"
            :class="['oio-debug-page-parameters-item', parameter.isObject && 'oio-debug-page-parameters-object']"
          >
            <pre v-if="parameter.isObject">{{ parameter.value }}</pre>
            <span v-else>{{ parameter.value }}</span>
          </oio-form-item>
        </oio-form>
        <template #titleToolbar>
          <oio-button type="primary" size="small" async @click="onRefresh">刷新页面信息</oio-button>
        </template>
      </oio-group>
      <oio-group v-if="isShowViewAction" class="oio-debug-view-action" title="页面信息">
        <oio-form class="oio-debug-info-form">
          <oio-form>
            <oio-row>
              <oio-col v-for="parameters of resolvedViewAction" flex="1" :key="parameters.key">
                <oio-form-item v-for="parameter of parameters.value" :key="parameter.key" :label="parameter.label">
                  <span>{{ parameter.value }}</span>
                </oio-form-item>
              </oio-col>
            </oio-row>
          </oio-form>
        </oio-form>
      </oio-group>
    </div>
    <oio-tabs v-if="isShowViewAction" class="oio-debug-tabs" destroyInactiveTabPane>
      <oio-tab tab="DSL" key="1">
        <debug-json-view :text="resolvedDsl" text-class="oio-debug-textarea" />
      </oio-tab>
      <oio-tab tab="Layout" key="2">
        <debug-json-view :text="resolvedLayout" text-class="oio-debug-textarea" />
      </oio-tab>
      <oio-tab tab="Mask" key="3">
        <debug-json-view :text="resolvedMask" text-class="oio-debug-textarea" />
      </oio-tab>
    </oio-tabs>
    <oio-tabs v-if="isShowResolvedRuntimeContextPanel" class="oio-debug-tabs" destroyInactiveTabPane>
      <oio-tab v-for="panel of runtimeContextPanels" :tab="panel.title" :key="panel.key">
        <component v-if="panel.component" :is="panel.component" v-bind="constructPanelProps(panel)" />
        <debug-default-info v-else v-bind="panel" />
      </oio-tab>
    </oio-tabs>
  </div>
</template>
<script lang="ts">
import { RuntimeModule, RuntimeViewAction, ViewActionQueryParameter } from '@kunlun/engine';
import { TreeNode } from '@kunlun/shared';
import {
  OioButton,
  OioCol,
  OioForm,
  OioFormItem,
  OioGroup,
  OioRow,
  OioTab,
  OioTabs,
  OioTextarea
} from '@kunlun/vue-ui-antd';
import { get as getValue, isArray, isPlainObject } from 'lodash-es';
import { computed, defineComponent, PropType } from 'vue';
import { RuntimeMenu } from '../../../../typing';
import { DebugErrorPanel } from '../../typing';
import DebugDefaultInfo from '../components/DebugDefaultInfo.vue';
import DebugJsonView from '../components/DebugJsonView.vue';
import { DebugUtils } from '../debug-utils';

interface ParameterItem {
  key: string;
  label: string;
  value: string;
  isObject: boolean;
}

export default defineComponent({
  name: 'DebugView',
  components: {
    OioButton,
    OioForm,
    OioFormItem,
    OioGroup,
    OioRow,
    OioCol,
    OioTabs,
    OioTab,
    OioTextarea,
    DebugDefaultInfo,
    DebugJsonView
  },
  inheritAttrs: false,
  props: {
    activeDebugTab: {
      type: String
    },
    pageParameters: {
      type: Object as PropType<ViewActionQueryParameter | null>
    },
    viewAction: {
      type: Object as PropType<RuntimeViewAction | null>
    },
    module: {
      type: Object as PropType<RuntimeModule | null>
    },
    menus: {
      type: Object as PropType<TreeNode<RuntimeMenu>[] | null>
    },
    runtimeContextPanels: {
      type: Array as PropType<DebugErrorPanel[]>
    },
    onRefresh: {
      type: Function
    }
  },
  setup(props) {
    const isShowPageParameters = computed(() => {
      return !!props.pageParameters;
    });

    const isShowViewAction = computed(() => {
      return !!props.viewAction;
    });

    const isShowModule = computed(() => {
      return !!props.module;
    });

    const isShowMenus = computed(() => {
      return !!props.menus?.length;
    });

    const isShowResolvedRuntimeContextPanel = computed(() => {
      return !!props.runtimeContextPanels?.length;
    });

    const convertLabelByKey = (key: string | [string, string]): Omit<ParameterItem, 'value' | 'isObject'> => {
      if (isArray(key)) {
        return {
          key: key[0],
          label: `${key[1]}:`
        };
      }
      return {
        key,
        label: `${key}:`
      };
    };

    const convertParameterItem = (data: Record<string, unknown>, key: string | [string, string]): ParameterItem => {
      let value;
      if (isArray(key)) {
        value = `${getValue(data, key[0]) ?? ''}`;
      } else {
        value = `${getValue(data, key) ?? ''}`;
      }
      return {
        ...convertLabelByKey(key),
        value,
        isObject: false
      };
    };

    const convertParameterItems = (data, ...keys: (string | [string, string])[]): ParameterItem[] => {
      return keys.map((key) => convertParameterItem(data, key));
    };

    const beautifyJSON = (data: unknown) => {
      if (typeof data === 'string') {
        try {
          return DebugUtils.toJSONString(JSON.parse(data));
        } catch (ignored) {}
        return data;
      }
      return DebugUtils.toJSONString(data);
    };

    const resolvedPageParameters = computed(() => {
      if (!props.pageParameters) {
        return [];
      }
      const parameters: ParameterItem[] = [];
      for (const key in props.pageParameters) {
        let value = decodeURIComponent(props.pageParameters[key]! as string);
        if (value == null) {
          continue;
        }
        let isObject = false;
        try {
          const jsonData = JSON.parse(value);
          if (isPlainObject(jsonData) || Array.isArray(jsonData)) {
            value = beautifyJSON(jsonData);
            isObject = true;
          }
        } catch (ignored) {}
        parameters.push({
          ...convertLabelByKey(key),
          value,
          isObject
        });
      }
      return parameters;
    });

    const resolvedViewAction = computed(() => {
      if (!props.viewAction) {
        return [[], [], []].map((value, index) => ({ key: `${index + 1}`, value }));
      }
      return [
        convertParameterItems(
          props.viewAction,
          'id',
          'model',
          'name',
          'title',
          'displayName',
          'contextType',
          'target',
          'domain',
          'filter'
        ),
        convertParameterItems(
          props.viewAction,
          'module',
          'moduleName',
          'resModule',
          'resModuleName',
          ['resView.id', 'resViewId'],
          ['resView.model', 'resViewModel'],
          ['resView.name', 'resViewName'],
          ['resView.type', 'resViewType']
        ),
        convertParameterItems(props.viewAction, ['mask', 'maskName'], ['resView.baseLayoutName', 'layoutName'])
      ].map((value, index) => ({ key: `${index + 1}`, value }));
    });

    const resolvedDsl = computed(() => {
      const dsl = props.viewAction?.resView?.dsl;
      if (dsl) {
        return beautifyJSON(dsl);
      }
      return undefined;
    });

    const resolvedLayout = computed(() => {
      const layout = props.viewAction?.resView?.layout;
      if (layout) {
        return beautifyJSON(layout);
      }
      return undefined;
    });

    const resolvedMask = computed(() => {
      return props.viewAction?.resMaskDefinition?.template;
    });

    const constructPanelProps = (panel: DebugErrorPanel) => {
      const properties = { ...panel };
      delete properties.component;
      return properties;
    };

    return {
      isShowPageParameters,
      isShowViewAction,
      isShowModule,
      isShowMenus,
      isShowResolvedRuntimeContextPanel,

      resolvedPageParameters,
      resolvedViewAction,
      resolvedDsl,
      resolvedLayout,
      resolvedMask,
      constructPanelProps
    };
  }
});
</script>
<style lang="scss">
.oio-debug-view {
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  .oio-debug-view-wrapper {
    display: flex;
    column-gap: 16px;
    align-items: flex-start;

    & > div {
      flex: 1;
    }

    .oio-debug-view-action,
    .oio-debug-page-parameters {
      .oio-group-title-wrapper {
        height: 48px;
      }
      .oio-group-content {
        height: 440px;
        overflow-y: auto;
      }
    }
    .oio-debug-view-action {
      flex: 3;
    }
    .oio-debug-page-parameters {
      max-width: 500px;
      &-item {
        .ant-form-item-control-input-content {
          word-break: break-all;
        }
      }
      &-object > .ant-form-item-control {
        padding-top: 5px;
      }
    }
  }

  .oio-debug-info-form.oio-form .oio-form-item.oio-form-item-horizontal > .ant-form-item-label {
    width: 120px;
    max-width: unset;
  }
}
</style>
