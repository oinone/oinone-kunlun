<template>
  <div class="default-table-footer-operator-quick-fill" @click="onToggleModal(true)">
    <oio-icon size="14" icon="oinone-file-text-outlined" color="var(--oio-primary-color)"></oio-icon>
    {{ $translate('快速填报 ') }}
  </div>

  <oio-modal
    :width="ModalWidth.medium"
    :visible="showModal"
    :title="$translate('快速填报')"
    @cancel="() => onToggleModal(false)"
    @enter="onSure"
  >
    <div class="quick-fill-modal-content">
      <a-radio-group :value="radioValue" name="radioGroup" @change="onChangeRadio">
        <a-radio value="newValue">{{ $translate('新增数据') }}</a-radio>
        <a-radio value="oldValue">{{ $translate('编辑已有数据') }}</a-radio>
      </a-radio-group>

      <div class="quick-fill-modal-content-desc">
        <div class="quick-fill-modal-content-desc-item">
          {{ $translate('支持将Excel内容粘贴至本表格，粘贴后内容将自动追加至表格末尾') }}
        </div>
        <div class="quick-fill-modal-content-desc-item">{{ $translate('系统已自动隐藏不支持粘贴的字段列') }}</div>
        <div class="quick-fill-modal-content-desc-item">
          {{ $translate('可在当前页面调整字段与数据的对应关系，确认后数据将追加至对应列中') }}
        </div>
      </div>

      <div class="quick-fill-excel">
        <excel ref="excelRef" :model-fields="editableModelFields" :row-count="rowCount"></excel>
      </div>
    </div>
  </oio-modal>
</template>

<script lang="ts">
import { createVNode, defineComponent, PropType, ref } from 'vue';
import { OioIcon, OioModal } from '@oinone/kunlun-vue-ui-antd';
import { ActiveRecord, RuntimeModelField, translateValueByKey } from '@oinone/kunlun-engine';
import { ModalWidth, OioCloseIcon } from '@oinone/kunlun-vue-ui-common';
import { Radio as ARadio, RadioGroup as ARadioGroup, Modal } from 'ant-design-vue';
import Excel from './Excel.vue';
import { isNull } from 'lodash';
import { Entity } from '@oinone/kunlun-meta';

export default defineComponent({
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    editableModelFields: {
      type: Array as PropType<RuntimeModelField[]>,
      default: () => []
    },
    onToggleModal: {
      type: Function,
      required: true
    },
    onSure: {
      type: Function,
      required: true
    },
    dataSource: {
      type: Array as PropType<ActiveRecord[]>,
      default: () => []
    },
    fillValueByDataSource: {
      type: Function,
      required: true
    }
  },
  components: {
    OioIcon,
    OioModal,
    ARadioGroup,
    ARadio,
    Excel
  },
  setup(props) {
    const radioValue = ref<'newValue' | 'oldValue'>('newValue');
    const rowCount = ref(9);
    const excelRef = ref();

    const onChangeRadio = (val) => {
      if (excelRef.value.getCellStatus()) {
        const _modal = Modal.confirm({
          class: 'oio-modal oio-quick-fill-witch-mode-modal',
          icon: createVNode(OioIcon, { icon: 'oinone-tixing1', size: '18' }),
          closeIcon: createVNode(OioCloseIcon),
          title: translateValueByKey('确认要切换为编辑已有数据吗？'),
          closable: true,
          content: translateValueByKey('切换后，本页数据将丢失，请确认后再继续'),
          okText: translateValueByKey('确定'),

          cancelText: translateValueByKey('取消'),
          onOk: () => {
            radioValue.value = val.target.value;
            excelRef.value.resetExcel();

            if (radioValue.value === 'oldValue') {
              const excelValue = props.fillValueByDataSource();
              excelRef.value.setCells(excelValue);
            }
            _modal.destroy();
          }
        });
      } else {
        radioValue.value = val.target.value;
        excelRef.value.resetExcel();

        if (radioValue.value === 'oldValue') {
          const excelValue = props.fillValueByDataSource();
          excelRef.value.setCells(excelValue);
        }
      }
    };

    return { excelRef, radioValue, ModalWidth, rowCount, onChangeRadio };
  }
});
</script>

<style lang="scss">
.default-table-footer-operator-quick-fill {
  cursor: pointer;
  display: flex;
  align-items: center;
  column-gap: 4px;
}

.oio-quick-fill-witch-mode-modal {
  .ant-modal-confirm-title {
    display: inline-block;
    vertical-align: middle;
    margin-left: var(--oio-margin-md);
  }
  .ant-modal-confirm-content {
    color: var(--oio-text-color-secondary);
    margin-left: 30px;
  }
}

.quick-fill-modal-content {
  .quick-fill-modal-content-desc {
    padding: var(--oio-padding);
    border-radius: var(--oio-border-radius-sm);
    background: #f8f8fa;
    margin: var(--oio-margin) 0;
    color: var(--oio-text-color-secondary);
    & > div {
      position: relative;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      &:last-child {
        margin-bottom: 0;
      }
      &::before {
        content: '';
        display: block;
        width: 3px;
        height: 3px;
        background: var(--oio-text-color-secondary);
        margin-right: 6px;
        border-radius: 50%;
      }
    }
  }

  .quick-fill-excel {
    width: 100%;
    overflow-x: scroll;
    scrollbar-width: 0;
    border: 1px solid var(--oio-border-color);
    border-radius: var(--oio-border-radius);
  }
}
</style>
