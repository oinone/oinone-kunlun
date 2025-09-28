<template>
  <div class="default-table-footer-operator-quick-fill" @click="onToggleModal(true)">
    <oio-icon size="14" icon="oinone-file-text-outlined" color="var(--oio-primary-color)"></oio-icon>
    {{ $translate('快速填报 ') }}
  </div>

  <oio-modal
    :width="ModalWidth.medium"
    :visible="showModal"
    :title="$translate('快速填报')"
    @cancel="onToggleModal(false)"
  >
    <div class="quick-fill-modal-content">
      <a-radio-group :value="type" name="radioGroup" @change="onChangeRadio">
        <a-radio value="create">{{ $translate('新增数据') }}</a-radio>
        <a-radio value="update">{{ $translate('编辑已有数据') }}</a-radio>
      </a-radio-group>

      <div class="quick-fill-modal-content-desc" v-if="step === 0">
        <div class="quick-fill-modal-content-desc-item">
          {{ $translate('支持将Excel内容粘贴至本表格，粘贴后内容将自动追加至表格末尾') }}
        </div>
        <div class="quick-fill-modal-content-desc-item">{{ $translate('系统已自动隐藏不支持粘贴的字段列') }}</div>
        <div class="quick-fill-modal-content-desc-item">
          {{ $translate('可在当前页面调整字段与数据的对应关系，确认后数据将追加至对应列中') }}
        </div>
      </div>

      <div class="quick-fill-modal-content-error" v-else>
        <oio-icon icon="oinone-tixing" color="var(--oio-error-color)" size="14"></oio-icon>
        <span>{{ $translate('以下数据不符合规则，请修改后继续') }}</span>
      </div>

      <div class="quick-fill-excel" v-show="step === 0">
        <excel ref="excelRef" :model-fields="editableModelFields" :row-count="rowCount"></excel>
      </div>

      <div v-show="step !== 0">
        <slot name="table"></slot>
      </div>
    </div>

    <template #footer>
      <div v-if="step === 0">
        <oio-button @click="onToggleModal(false)">取消</oio-button>
        <oio-button type="primary" @click="onHandlerSure">确定</oio-button>
      </div>
      <div v-else>
        <oio-button @click="onStepChange(0)">上一步</oio-button>
        <oio-button type="primary" @click="onSubmit">继续填报</oio-button>
      </div>
    </template>
  </oio-modal>
</template>

<script lang="ts">
import { ActiveRecord, RuntimeModelField, translateValueByKey } from '@oinone/kunlun-engine';
import { OioButton, OioIcon, OioModal } from '@oinone/kunlun-vue-ui-antd';
import { ModalWidth, OioCloseIcon } from '@oinone/kunlun-vue-ui-common';
import { Modal, Radio as ARadio, RadioGroup as ARadioGroup } from 'ant-design-vue';
import { computed, createVNode, defineComponent, PropType, ref, watch } from 'vue';
import Excel from './Excel.vue';
import { QuickFillType } from './type';

export default defineComponent({
  props: {
    type: {
      type: String as PropType<QuickFillType>
    },
    onTypeChange: {
      type: Function as PropType<(val: QuickFillType) => void>
    },
    showModal: {
      type: Boolean,
      required: false
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
    onSubmit: {
      type: Function,
      required: true
    },
    onStepChange: {
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
    },
    step: {
      type: Number,
      default: 0
    }
  },
  components: {
    OioIcon,
    OioModal,
    OioButton,
    ARadioGroup,
    ARadio,
    Excel
  },
  setup(props) {
    const internalType = ref<QuickFillType>(QuickFillType.create);
    const type = computed({
      get() {
        return props.type || internalType.value;
      },
      set(val: QuickFillType) {
        internalType.value = val;
        props.onTypeChange?.(val);
      }
    });

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
            type.value = val.target.value;
            excelRef.value.resetExcel();

            if (type.value === QuickFillType.create) {
              const excelValue = props.fillValueByDataSource();
              excelRef.value.setCells(excelValue);
            }
            _modal.destroy();
          }
        });
      } else {
        type.value = val.target.value;
        excelRef.value.resetExcel();

        if (type.value === QuickFillType.create) {
          const excelValue = props.fillValueByDataSource();
          excelRef.value.setCells(excelValue);
        }
      }

      props.onStepChange(0);
    };

    const onHandlerSure = () => {
      const cells = excelRef.value.getCells();
      const tableHeaderValues = excelRef.value.getTableHeaderValues();

      /**
       * 处理不粘贴的列，将列对应的值设置为空
       */
      cells.forEach((row) => {
        row.forEach((col, index) => {
          if (tableHeaderValues[index].value === 'NON_CUT') {
            row[index] = null;
          }
        });
      });

      props.onSure(cells);
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) {
          type.value = QuickFillType.create;
          excelRef.value?.resetExcel();
        }
      }
    );

    return { excelRef, type, ModalWidth, rowCount, onChangeRadio, onHandlerSure };
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

  .quick-fill-modal-content-error {
    margin: var(--oio-margin) 0;
    display: flex;
    align-items: center;
    background-color: #ffe5e6;
    border-radius: var(--oio-border-radius-sm);
    color: var(--oio-error-color);
    padding: var(--oio-padding-sm) var(--oio-padding);

    .oio-icon {
      margin-right: var(--oio-margin-sm);
    }
  }

  .table-user-prefer,
  .default-column-quick-operation,
  .default-view-control-icon {
    display: none;
  }
}
</style>
