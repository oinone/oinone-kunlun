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
  <oio-modal width="60%" :visible="visible" @update:visible="change" :title="$translate('导出')">
    <a-spin :spinning="loading">
      <oio-form>
        <oio-form-item
          :label="$translate('导出模板')"
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
      </oio-form>
    </a-spin>
    <template #footer>
      <oio-button @click="createExportTask" type="primary">{{ $translate('导出') }}</oio-button>
      <oio-button @click="() => change(false)">{{ $translate('取消') }}</oio-button>
    </template>
  </oio-modal>
</template>

<script lang="ts">
import { OioButton, OioForm, OioFormItem, OioModal } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';
import DefaultAction from '../../component/action/DefaultAction.vue';
import { ActionProps } from '../../component/action/typing';

export default defineComponent({
  name: 'Action',
  components: {
    OioModal,
    OioButton,
    OioForm,
    OioFormItem,
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
    handleSelectChange: Function,
    workbookList: Array,
    selectValue: String,
    createExportTask: Function,
    validation1: Object
  }
});
</script>
