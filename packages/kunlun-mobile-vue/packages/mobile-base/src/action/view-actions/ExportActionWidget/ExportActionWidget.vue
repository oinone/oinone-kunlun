<template>
  <div :class="`${DEFAULT_PREFIX}-action-item`">
    <oio-button
      :class="`${DEFAULT_PREFIX}-action-item`"
      :type="type"
      size="small"
      :data-action-name="action.name"
      @click="validateAndClick(action)"
    >
      {{ label }}
    </oio-button>
  </div>
  <oio-modal
    width="100%"
    :class="`${DEFAULT_PREFIX}-view-dialog`"
    :visible="visible"
    popup-mode
    @update:visible="change"
    :title="translateValueByKey('导出')"
  >
    <oio-spin :spinning="loading">
      <oio-form>
        <oio-form-item
          :label="translateValueByKey('导出模板')"
          :required="true"
          :validateStatus="validation1.status"
          :help="translateValueByKey(validation1.help)"
        >
          <oio-select
            :title="translateValueByKey('导出模板')"
            :value="selectValue"
            :options="workbookList"
            @change="handleSelectChange"
          >
          </oio-select>
        </oio-form-item>
      </oio-form>
    </oio-spin>
    <template #footer>
      <oio-button @click="createExportTask" type="primary">{{ translateValueByKey('导出') }}</oio-button>
      <oio-button @click="() => change(false)">{{ translateValueByKey('取消') }}</oio-button>
    </template>
  </oio-modal>
</template>

<script lang="ts">
import {
  DEFAULT_PREFIX,
  OioSelect,
  OioButton,
  OioForm,
  OioFormItem,
  OioModal,
  OioSpin
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { defineComponent } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';

export default defineComponent({
  name: 'Action',
  components: {
    OioSelect,
    OioModal,
    OioButton,
    OioForm,
    OioFormItem,
    OioSpin
  },
  inheritAttrs: false,
  props: [
    'action',
    'validateAndClick',
    'label',
    'visible',
    'change',
    'createImportTask',
    'options',
    'handleSelectChange',
    'workbookList',
    'selectValue',
    'createExportTask',
    'validation1',
    'loading'
  ],
  computed: {
    type() {
      let showInline = false;
      if (this.$parent && this.$parent.$parent) {
        showInline = this.$parent.$parent.$attrs['data-showLineType'] as boolean;
      }

      if (showInline) {
        return 'link';
      }

      return 'default';
    }
  },
  setup() {
    return { DEFAULT_PREFIX, translateValueByKey };
  }
});
</script>
