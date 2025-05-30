<template>
  <span v-if="readonly" class="expression-input-control expression-input-control-detail">{{ expressionLabel }}</span>
  <span v-else class="ant-input-group-wrapper ant-input-control oio-input expression-input-control">
    <span class="ant-input-wrapper ant-input-group" @click="onShowExpressionDialog">
      <span class="ant-input placeholder" tabindex="0" v-if="!expressionLabel">{{ placeholder }}</span>
      <span class="ant-input" tabindex="0" v-if="expressionLabel">
        <span class="tag" :title="expressionLabel">
          {{ expressionLabel }}
        </span>
      </span>
      <span class="ant-input-clear" v-if="isShowClear" @click.stop="clearHandler">
        <close-circle-filled />
      </span>
      <span class="ant-input-group-addon"><i class="d-iconfont oinone-kongjian"></i></span>
    </span>

    <expression-dialog
      dialog-class="expression-input-control-dialog"
      :title="title"
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
        :canSelectedComplexField="canSelectedComplexField"
        :expression-option="expressionOption"
        :filter-method="filterMethod"
        :field-options="fieldOptions"
        :is-simple-mode="isSimpleMode"
        :is-low-code="isLowCode"
        :source-code="sourceCode"
        :has-change-source-code="hasChangeSourceCode"
        :change-variable-on-select="changeVariableOnSelect"
        @change-list="handleChangeList"
        @change-source-code="onChangeSourceCode"
        @clear="clearHandler"
      />
    </expression-dialog>
  </span>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { BooleanHelper } from '@kunlun/shared';
import { CloseCircleFilled } from '@ant-design/icons-vue';
import ExpressionDialog from '../../dialog/ExpressionDialog.vue';
import ExpressionInputForm from './ExpressionInputForm.vue';
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
  components: { ExpressionInputForm, ExpressionDialog, CloseCircleFilled },
  props: {
    ...ExpressionCommonProps
  },
  emits: ExpressionEvent,
  setup(props, { emit }) {
    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);
    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

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
      dialogExpressionItemList.value = newList || [];
    };

    const cancelHandler = () => {
      setTimeout(() => {
        isShowExpressionDialog.value = false;
      }, 200);
      dialogExpressionItemList.value = [];
    };

    // 用来处理 clearField逻辑
    watch(
      () => props.value,
      (v) => {
        if (!v) {
          clearHandler(false);
        }
      }
    );

    return {
      readonly,
      disabled,
      expressionOption,
      isShowExpressionDialog,
      expressionItemList,
      dialogExpressionItemList,
      expressionLabel,
      isShowClear,
      onShowExpressionDialog,
      handleChangeList,
      cancelHandler,
      submitHandler,
      clearHandler
    };
  }
});
</script>
