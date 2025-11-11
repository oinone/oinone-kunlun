<template>
  <div class="default-table-footer-operator-quick-fill" @click="onToggleModal(true)">
    <oio-icon size="14" icon="oinone-file-text-outlined" color="var(--oio-primary-color)"></oio-icon>
    {{ $translate('快速填报 ') }}
  </div>

  <oio-modal
    :width="ModalWidth.medium"
    :visible="showModal"
    :title="$translate('快速填报')"
    :loading="loading"
    @cancel="handleCancel"
  >
    <div class="quick-fill-modal-content">
      <a-radio-group :value="type" v-if="step === 0" name="radioGroup" @change="onChangeRadio">
        <a-radio value="create">{{ $translate('新增数据') }}</a-radio>
        <a-radio value="update">{{ $translate('编辑已有数据') }}</a-radio>
      </a-radio-group>

      <div class="quick-fill-modal-content-desc" v-if="step === 0">
        <template v-if="type === 'create'">
          <div class="quick-fill-modal-content-desc-item">
            {{ $translate('支持将Excel内容粘贴至本表格，粘贴后内容将自动追加至表格末尾') }}
          </div>
          <div class="quick-fill-modal-content-desc-item">{{ $translate('系统已自动隐藏不支持粘贴的字段列') }}</div>
          <div class="quick-fill-modal-content-desc-item">
            {{ $translate('可在当前页面调整字段与数据的对应关系，确认后数据将追加至对应列中') }}
          </div>
        </template>
        <template v-else>
          <div class="quick-fill-modal-content-desc-item">
            {{ $translate('支持将 Excel 内容粘贴至本表格') }}
          </div>
          <div class="quick-fill-modal-content-desc-item">
            {{ $translate('执行粘贴操作时，系统将自动跳过不可编辑的字段列，请注意核对字段的排列顺序') }}
          </div>
        </template>
      </div>

      <div class="quick-fill-modal-content-error" v-else>
        <oio-icon icon="oinone-tixing" color="var(--oio-error-color)" size="14"></oio-icon>
        <span>{{ $translate('以下数据不符合规则，请修改后继续') }}</span>
      </div>

      <div class="quick-fill-excel" v-show="step === 0">
        <excel
          ref="excelRef"
          :model-fields="editableModelFields"
          :row-count="rowCount"
          :add-row-count="addRowCount"
        ></excel>
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
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../basic';
import Excel from './Excel.vue';
import { QuickFillType } from './type';

const DEFAULT_ROW_COUNT = 9;

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
    const formContext = useInjectOioDefaultFormContext();

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

    const rowCount = ref(DEFAULT_ROW_COUNT);
    const excelRef = ref();
    const loading = ref(false);

    const handleCancel = () => {
      if (!excelRef.value?.getCellStatus()) {
        return props.onToggleModal(false);
      }
      const _modal = Modal.confirm({
        class: 'oio-modal oio-quick-fill-witch-mode-modal',
        icon: createVNode(OioIcon, { icon: 'oinone-tixing1', size: '18' }),
        closeIcon: createVNode(OioCloseIcon),
        title: translateValueByKey(`确认关闭?`),
        closable: true,
        content: translateValueByKey('本页数据将丢失，请确认后再继续'),
        okText: translateValueByKey('确定'),

        cancelText: translateValueByKey('取消'),
        onOk: () => {
          props.onToggleModal(false);
          _modal.destroy();
        }
      });
    };

    const fillValueByDataSource = () => {
      const { cells, rowCount: currentRowCount } = props.fillValueByDataSource();
      excelRef.value.setCells(cells || {});
      rowCount.value = currentRowCount ?? DEFAULT_ROW_COUNT;
    };

    const onChangeRadio = (val) => {
      const nextType = val.target.value;
      const str = `确认要切换为${nextType === QuickFillType.update ? '编辑已有' : '新增'}数据吗？`;
      if (excelRef.value.getCellStatus()) {
        const _modal = Modal.confirm({
          class: 'oio-modal oio-quick-fill-witch-mode-modal',
          icon: createVNode(OioIcon, { icon: 'oinone-tixing1', size: '18' }),
          closeIcon: createVNode(OioCloseIcon),
          title: translateValueByKey(str),
          closable: true,
          content: translateValueByKey('切换后，本页数据将丢失，请确认后再继续'),
          okText: translateValueByKey('确定'),

          cancelText: translateValueByKey('取消'),
          onOk: () => {
            type.value = nextType;
            excelRef.value.resetExcel();
            if (nextType === QuickFillType.create) {
              excelRef.value.setCells({});
              rowCount.value = DEFAULT_ROW_COUNT;
            } else if (nextType === QuickFillType.update) {
              fillValueByDataSource();
            }
            _modal.destroy();
          }
        });
      } else {
        type.value = nextType;
        excelRef.value.resetExcel();

        if (nextType === QuickFillType.create) {
          excelRef.value.setCells({});
          rowCount.value = DEFAULT_ROW_COUNT;
        } else if (nextType === QuickFillType.update) {
          fillValueByDataSource();
        }
      }

      props.onStepChange(0);
    };

    const onHandlerSure = async () => {
      loading.value = true;
      try {
        await props.onSure(excelRef.value.getTableHeaderValues(), excelRef.value.getCells());
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => props.showModal,
      (visible) => {
        if (!visible) {
          type.value = QuickFillType.create;
          rowCount.value = DEFAULT_ROW_COUNT;
          loading.value = false;
          excelRef.value?.resetExcel();
        }
      }
    );

    const addRowCount = (addNumber = 1) => {
      if (type.value === QuickFillType.update) {
        return;
      }
      rowCount.value += addNumber;
    };

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer() {
        return document.body;
      }
    });

    return {
      ModalWidth,

      excelRef,
      type,
      rowCount,
      loading,
      onChangeRadio,
      onHandlerSure,
      addRowCount,
      handleCancel
    };
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
