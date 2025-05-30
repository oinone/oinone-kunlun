<template>
  <default-action
    :action="action"
    :type="type"
    :biz-style="bizStyle"
    :label="label"
    :help="help"
    :icon="icon"
    :invisible="invisible"
    :inline="inline"
    :validate-and-click="validateAndClick"
    :validator-form="validatorForm"
  />
  <oio-modal width="60%" :visible="visible" @update:visible="change" :title="$translate('导入')">
    <a-spin :spinning="loading">
      <oio-form>
        <oio-form-item
          :label="$translate('导入模板')"
          :required="true"
          :validateStatus="validation1.status"
          :help="validation1.help"
        >
          <a-select
            class="oio-select"
            dropdown-class-name="oio-select-dropdown"
            :value="selectValue"
            @change="handleSelectChange"
          >
            <a-select-option v-for="workbook in workbookList" :value="workbook.id" :key="workbook.id"
              >{{ workbook.displayName || workbook.name }}
            </a-select-option>
          </a-select>
        </oio-form-item>
        <oio-form-item
          :label="$translate('上传文件')"
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
            <oio-button>{{ $translate('点击上传') }}</oio-button>
          </FileUpload>
        </oio-form-item>
      </oio-form>
    </a-spin>
    <template #footer>
      <oio-button @click="downloadTemplate" type="primary">{{ $translate('下载模板') }} </oio-button>
      <oio-button @click="createImportTask" type="primary">{{ $translate('导入') }} </oio-button>
    </template>
  </oio-modal>
</template>

<script lang="ts">
import { OioButton, OioForm, OioFormItem, OioModal } from '@kunlun/vue-ui-antd';
import { defineComponent } from 'vue';
import { FileUpload } from '../../../components';
import { useInjectActionContext } from '../../component';
import DefaultAction from '../../component/action/DefaultAction.vue';
import { ActionProps } from '../../component/action/typing';

export default defineComponent({
  name: 'Action',
  components: {
    FileUpload,
    OioButton,
    OioForm,
    OioFormItem,
    OioModal,
    DefaultAction
  },
  inheritAttrs: false,
  props: {
    ...ActionProps,
    visible: {
      type: Boolean,
      default: undefined
    },
    change: Function,
    createImportTask: Function,
    downloadTemplate: Function,
    handleSelectChange: Function,
    workbookList: Array,
    selectValue: String,
    getImportFile: Function,
    validation1: Object,
    validation2: Object,
    remove: Function,
    file: Object
  },
  setup() {
    const actionContext = useInjectActionContext();

    return {
      ...actionContext
    };
  }
});
</script>
