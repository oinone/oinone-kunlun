<template>
  <span class="tag-control-wrapper expression-tag-control">
    <control-tag class="expression-tag-control-tag" closable @close="clearHandler">
      <template #default>
        <span>
          <span class="placeholder" v-if="!expressionLabel">{{ placeholder }}</span>
          <span v-else :title="expressionLabel">
            {{ expressionLabel }}
          </span>
        </span>
      </template>
      <template #addOn>
        <span class="control-tag-close-btn">
          <plus-circle-outlined @click="onShowExpressionDialog" />
        </span>
      </template>
    </control-tag>

    <expression-dialog
      dialog-class="expression-input-control-dialog"
      :title="placeholder"
      width="50%"
      :visible="isShowExpressionDialog"
      :z-index="99999"
      :mask-closable="false"
      @cancel="cancelHandler"
      @ok="submitHandler"
    >
      <expression-input-form
        v-if="isShowExpressionDialog"
        class="expression-input-control-dialog-inner"
        v-model:expression-item-list="dialogExpressionItemList"
        :expression-option="expressionOption"
        :filter-method="filterMethod"
        :field-options="fieldOptions"
        :is-simple-mode="isSimpleMode"
        :is-low-code="isLowCode"
        :change-variable-on-select="changeVariableOnSelect"
        @change-list="handleChangeList"
      />
    </expression-dialog>
  </span>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import ExpressionDialog from '../../dialog/ExpressionDialog.vue';
import ExpressionInputForm from './ExpressionInputForm.vue';
import ControlTag from '../control-tag/ControlTag.vue';
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import { IExpressionItem } from '../../../types';
import { ExpressionCommonProps, ExpressionEvent } from '../typing';
import { useExpressionOptions } from '../use/use-expression';
import {
  useClearExpressionHandler,
  useExpressionLabel,
  useOnShowExpressionDialog,
  useSubmitExpressionHandler,
  useWatchExpressionItemList,
  useWatchIsShowExpressionDialog
} from '../use/use-common';

export default defineComponent({
  inheritAttrs: false,
  components: { ExpressionInputForm, ExpressionDialog, ControlTag, PlusCircleOutlined },
  props: {
    ... ExpressionCommonProps
  },
  emits: ExpressionEvent,
  setup(props, { emit }) {
    const expressionItemList = ref<IExpressionItem[]>([]);
    // 弹窗内用的，取消的时候需要恢复到打开弹窗前的值
    const dialogExpressionItemList = ref<IExpressionItem[]>([]);
    const isShowExpressionDialog = ref(false);

    const { expressionOption } = useExpressionOptions(props, expressionItemList);
    const { expressionLabel } = useExpressionLabel(props, expressionOption, expressionItemList);
    useWatchExpressionItemList(props, expressionOption, expressionItemList);
    useWatchIsShowExpressionDialog(props, isShowExpressionDialog);

    const { onShowExpressionDialog } = useOnShowExpressionDialog(
      props,
      isShowExpressionDialog,
      expressionItemList,
      dialogExpressionItemList
    );
    const { submitHandler } = useSubmitExpressionHandler(
      props,
      emit,
      isShowExpressionDialog,
      expressionOption,
      expressionItemList,
      dialogExpressionItemList
    );
    const { isShowClear, clearHandler } = useClearExpressionHandler(
      props,
      expressionLabel,
      expressionOption,
      dialogExpressionItemList,
      submitHandler
    );

    const handleChangeList = (newList) => {
      // console.log('handlerChangeList', newList);
      // expressionItemList.value = newList || [];
      // props.onChangeList && props.onChangeList(expressionItemList.value);
      dialogExpressionItemList.value = newList || [];
    };

    const cancelHandler = () => {
      setTimeout(() => {
        isShowExpressionDialog.value = false;
      }, 200);
      dialogExpressionItemList.value = [];
    };

    return {
      expressionOption,
      isShowExpressionDialog,
      expressionItemList,
      dialogExpressionItemList,
      expressionLabel,
      isShowClear,
      clearHandler,
      onShowExpressionDialog,
      handleChangeList,
      cancelHandler,
      submitHandler
    };
  }
});
</script>
