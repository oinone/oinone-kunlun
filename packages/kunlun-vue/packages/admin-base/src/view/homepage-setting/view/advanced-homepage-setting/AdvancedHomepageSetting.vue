<template>
  <div class="homepage-setting system-setting-page-view">
    <div class="oio-group oio-default-group homepage-setting-group">
      <div class="oio-group-title-wrapper homepage-setting-group-title-wrapper">
        <div class="homepage-setting-group-header">
          <div class="oio-group-title">{{ $translate(`高级首页配置`) }}</div>
          <div class="oio-group-header-switch">
            {{ $translate('支持高级首页配置') }}
            <OioSwitch
              v-model:checked="support"
              style="margin-left: var(--oio-margin)"
              :onChange="changeSupportAdvancedHomepageConfig"
            />
          </div>
        </div>
      </div>
      <a-divider style="height: 1px; background-color: #e8e8e8; margin-top: 0" />
    </div>
    <div class="flex-s-c wrap page-layout" v-show="support">
      <div class="homepage-setting-header">
        <div class="homepage-setting-search">
          <LazyLoadSelect
            v-model:value="vueSearchModule"
            :allow-clear="true"
            :placeholder="$translate('请选择应用')"
            :fetch-value="handleFetchModule"
            :query-one="handleModuleQueryOne"
            :change="onVueSearchModuleChange"
            relationFieldKey="value"
          />
          <a-select
            class="oio-select hompage-setting-enableStatus-select"
            dropdown-class-name="oio-expression-select-dropdown-global expression-input-operator-dropdown"
            :placeholder="$translate('全部/可用/不可用')"
            v-model:value="vueSearchEnableStatus"
            @change="onSearchEnabledStatusChange"
          >
            <a-select-option
              v-for="item in EnableStatusOptions"
              :value="item.value"
              :key="item.value"
              :title="$translate(item.label)"
              >{{ $translate(item.label) }}
            </a-select-option>
          </a-select>
        </div>
        <div class="hompepage-setting-add-new">
          <OioButton class="add-new" :onClick="handleAdd" type="primary">
            <template #icon>
              <OioIcon
                icon="oinone-add-circle"
                size="var(--oio-font-size-lg)"
                color="var(--oio-primary-color)"
              ></OioIcon>
            </template>
            <template #default>
              {{ $translate('添加配置规则') }}
            </template>
          </OioButton>
        </div>
      </div>
      <slot></slot>
    </div>
    <div class="flex-s-c">
      <oio-button class="margin-right" @click="goBack">{{ $translate('返回') }}</oio-button>
      <oio-button type="primary" @click="onSave">{{ $translate('确定') }}</oio-button>
    </div>
  </div>
</template>
<script lang="ts">
import { IModule } from '@oinone/kunlun-meta';
import { OioButton, OioIcon, OioSwitch } from '@oinone/kunlun-vue-ui-antd';
import { debounce } from 'lodash-es';
import { defineComponent, PropType, ref, watchEffect } from 'vue';
import LazyLoadSelect from '../../components/LazyLoadSelect.vue';
import { EnableStatusOptions, FetchValueOptions, FetchValueReturnType } from '../../typing';

export default defineComponent({
  name: 'AdvancedHomepageSetting',
  components: { OioButton, OioSwitch, OioIcon, LazyLoadSelect },
  props: {
    goBack: {
      type: Function as PropType<((...args: any[]) => void) | undefined>
    },
    onSaveHomepageSettingConfig: {
      type: Function as PropType<((...args: any[]) => void) | undefined>
    },
    changeSupportAdvancedHomepageConfig: {
      type: Function as PropType<((check: boolean) => void) | undefined>
    },
    supportAdvancedHomepageConfig: {
      type: Boolean,
      default: true
    },

    // 搜索过滤部分
    searchModule: {
      type: Object as PropType<IModule>
    },
    searchEnableStatus: {
      type: String
    },
    onSearchModuleChange: {
      type: Function as PropType<((module: any | undefined) => void) | undefined>
    },
    onSearchEnabledStatusChange: {
      type: Function as PropType<((enableStatus: boolean | undefined) => void) | undefined>
    },
    handleFetchModule: {
      type: Function as PropType<(options: FetchValueOptions) => Promise<FetchValueReturnType>>
    },
    handleModuleQueryOne: {
      type: Function as PropType<(id: string) => Promise<Record<string, unknown>>>
    },
    // end 搜索过滤部分

    handleAdd: {
      type: Function
    }
  },
  setup(props) {
    const support = ref<boolean>(props.supportAdvancedHomepageConfig);

    const vueSearchModule = ref<IModule | undefined>(props.searchModule);
    const onVueSearchModuleChange = (module: IModule | undefined) => {
      vueSearchModule.value = module;
      props.onSearchModuleChange?.(module);
    };
    const vueSearchEnableStatus = ref<string | undefined>(props.searchEnableStatus);

    watchEffect(() => (support.value = props.supportAdvancedHomepageConfig));

    const onSave = debounce(() => {
      props.onSaveHomepageSettingConfig?.();
    }, 400);
    return { support, vueSearchModule, vueSearchEnableStatus, EnableStatusOptions, onVueSearchModuleChange, onSave };
  }
});
</script>
