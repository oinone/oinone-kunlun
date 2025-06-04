<template>
  <span v-if="readonly" class="expression-input-control expression-input-control-detail" :title="expressionLabel">{{
    expressionLabel
  }}</span>
  <span v-else class="ant-input-group-wrapper ant-input-control oio-input expression-input-control">
    <span class="ant-input-wrapper ant-input-group" @click="onShowExpressionDialog">
      <span class="ant-input placeholder" v-if="!expressionLabel">{{ placeholder }}</span>
      <span class="ant-input" v-if="expressionLabel">
        <div class="tag" :title="expressionLabel">
          <div>{{ expressionLabel }}</div>
        </div>
      </span>
      <span class="ant-input-clear" v-if="isShowClear" @click.stop="clearHandler">
        <close-circle-filled />
      </span>
      <span class="ant-input-group-addon"><i class="d-iconfont oinone-variable-x"></i></span>
    </span>
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
      <condition-input-form
        v-if="isShowExpressionDialog"
        class="expression-input-control-dialog-inner"
        v-model:expression-item-list="dialogExpressionItemList"
        :expression-option="expressionOption"
        :filter-method="filterMethod"
        :field-options="fieldOptions"
        :is-simple-mode="isSimpleMode"
        :is-field-store="isFieldStore"
        :is-low-code="isLowCode"
        :source-code="sourceCode"
        :has-change-source-code="hasChangeSourceCode"
        @change-list="handleChangeList"
        @change-source-code="onChangeSourceCode"
        @clear="clearHandler"
      />
    </expression-dialog>
  </span>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { deepClone } from '@oinone/kunlun-meta';
import { CloseCircleFilled } from '@ant-design/icons-vue';
import { BooleanHelper } from '@oinone/kunlun-shared';
import ExpressionDialog from '../../dialog/ExpressionDialog.vue';
import ConditionInputForm from './ConditionInputForm.vue';
import { createDefaultFieldExpressionItem } from '../../../share';
import { IExpressionItem } from '../../../types';
import { ConditionCommonProps } from '../typing';
import { useConditionLabel, useConditionOptions } from '../use/use-condition';
import {
  useSubmitExpressionHandler,
  useWatchExpressionItemList,
  useWatchIsShowExpressionDialog
} from '../use/use-common';

export default defineComponent({
  inheritAttrs: false,
  components: { ConditionInputForm, ExpressionDialog, CloseCircleFilled },
  props: {
    ...ConditionCommonProps
  },
  setup(props, { emit }) {
    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);
    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);
    const expressionItemList = ref<IExpressionItem[]>([]);
    // 弹窗内用的，取消的时候需要恢复到打开弹窗前的值
    const dialogExpressionItemList = ref<IExpressionItem[]>([]);
    const isShowExpressionDialog = ref(false);

    const { expressionOption } = useConditionOptions(props, expressionItemList);
    const handleChangeList = (newList) => {
      // console.log('handleChangeList', newList);
      dialogExpressionItemList.value = newList || [];
    };

    const { expressionLabel } = useConditionLabel(props, expressionOption, expressionItemList);
    useWatchExpressionItemList(props, expressionOption, expressionItemList);
    useWatchIsShowExpressionDialog(props, isShowExpressionDialog);

    const onShowExpressionDialog = () => {
      isShowExpressionDialog.value = !isShowExpressionDialog.value;
      if (isShowExpressionDialog.value) {
        const list = deepClone(expressionItemList.value) as IExpressionItem[];
        list.forEach((a) => (a.showCompareValueListLabel = true));
        dialogExpressionItemList.value = list;
      }
    };

    const isShowClear = computed(() => {
      return expressionLabel.value && !props.readonly;
    });
    const clearHandler = (closeDialog = true) => {
      dialogExpressionItemList.value = createDefaultFieldExpressionItem(props.fieldOptions!, 0, props.type!);
      props.onChangeSourceCode?.(dialogExpressionItemList.value);
      submitHandler(closeDialog);
      props.blur?.();
    };

    const cancelHandler = () => {
      setTimeout(() => {
        isShowExpressionDialog.value = false;
      }, 200);
      dialogExpressionItemList.value = [];
    };

    const { submitHandler } = useSubmitExpressionHandler(
      props,
      emit,
      isShowExpressionDialog,
      expressionOption,
      expressionItemList,
      dialogExpressionItemList
    );

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
