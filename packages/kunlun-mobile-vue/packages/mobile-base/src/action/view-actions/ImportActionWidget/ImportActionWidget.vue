<template>
  <div :class="`${DEFAULT_PREFIX}-action-item`">
    <oio-button
      :class="`${DEFAULT_PREFIX}-action-item`"
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
    title="导入"
  >
    <oio-spin :spinning="loading">
      <oio-form>
        <oio-form-item :label="translateValueByKey('导入模板')" :required="true" :validateStatus="validation1.status" :help="translateValueByKey(validation1.help)">
          <oio-select :title="translateValueByKey('导入模板')" :value="selectValue" :options="workbookList" @change="handleSelectChange"> </oio-select>
        </oio-form-item>
        <oio-form-item
          :label="translateValueByKey('上传文件')"
          :required="true"
          :validateStatus="validation2.status"
          :help="validation2.help"
        >
          <FileUpload
            :value="file && file.id ? [file] : null"
            accept=".xls,.xlsx"
            @change="getImportFile"
            :limit="1"
            :remove="remove"
          >
            <oio-button>{{ translateValueByKey('点击上传') }}</oio-button>
          </FileUpload>
        </oio-form-item>
      </oio-form>
    </oio-spin>
    <template #footer>
      <oio-button @click="downloadTemplate" type="primary">{{ translateValueByKey('下载模板') }}</oio-button>
      <oio-button @click="createImportTask" type="primary">{{ translateValueByKey('导入') }}</oio-button>
    </template>
  </oio-modal>
</template>

<script lang="ts">
import {
  DEFAULT_PREFIX,
  OioButton,
  OioForm,
  OioFormItem,
  OioSelect,
  OioModal,
  OioSpin
} from '@kunlun/vue-ui-mobile-vant';
import { defineComponent } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import { FileUpload } from '../../../components';

export default defineComponent({
  name: 'Action',
  components: {
    FileUpload,
    OioButton,
    OioForm,
    OioFormItem,
    OioSelect,
    OioModal,
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
    'downloadTemplate',
    'options',
    'handleSelectChange',
    'workbookList',
    'selectValue',
    'getImportFile',
    'validation1',
    'validation2',
    'loading',
    'remove',
    'file'
  ],
  setup() {
    return { DEFAULT_PREFIX, translateValueByKey };
  }
});
</script>
