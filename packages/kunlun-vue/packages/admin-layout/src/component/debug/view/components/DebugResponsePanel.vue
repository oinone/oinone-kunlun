<template>
  <div class="oio-debug-response-panel">
    <oio-tabs class="oio-debug-tabs" destroyInactiveTabPane>
      <oio-tab v-for="fun of requestInfo.functions" :tab="`${fun.namespace}#${fun.name}`" :key="fun.key">
        <oio-form>
          <oio-row :wrap="true">
            <oio-col flex="1">
              <oio-form-item label="请求类型">
                <span>{{ fun.method }}</span>
              </oio-form-item>
            </oio-col>
            <oio-col flex="1">
              <oio-form-item label="命名空间">
                <span>{{ fun.namespace }}</span>
              </oio-form-item>
            </oio-col>
            <oio-col flex="1">
              <oio-form-item label="方法名">
                <span>{{ fun.name }}</span>
              </oio-form-item>
            </oio-col>
          </oio-row>
          <oio-form-item label="响应结果">
            <debug-json-view :text="fun.responseData" text-class="oio-debug-textarea" />
          </oio-form-item>
        </oio-form>
      </oio-tab>
    </oio-tabs>
  </div>
</template>
<script lang="ts">
import { OioCol, OioForm, OioFormItem, OioRow, OioTab, OioTabs, OioTextarea } from '@kunlun/vue-ui-antd';
import { defineComponent, PropType } from 'vue';
import { DebugRequestInfo } from '../../typing';
import DebugJsonView from '../components/DebugJsonView.vue';

export default defineComponent({
  name: 'DebugResponsePanel',
  components: {
    OioCol,
    OioForm,
    OioFormItem,
    OioRow,
    OioTab,
    OioTabs,
    OioTextarea,
    DebugJsonView
  },
  inheritAttrs: false,
  props: {
    requestInfo: {
      type: Object as PropType<DebugRequestInfo>
    }
  },
  setup(props) {
    return {};
  }
});
</script>
<style lang="scss">
.oio-debug-response-panel {
  display: flex;
  flex-direction: column;
  row-gap: 24px;
}
</style>
