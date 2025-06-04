import { computed, onBeforeUnmount, ref, Ref, watch } from 'vue';
import { IExpressionItem, IExpressionLabelDisplayType, IExpressionOption } from '../../../types';
import {
  createDefaultExpressionItem,
  createExpressionApiName,
  createExpressionDisplayName,
  createExpressionValue
} from '../../../share';
import { deepClone, isEmptyValue } from '@oinone/kunlun-meta';
import { ExpressionExecutor } from '@oinone/kunlun-engine';

export function useExpressionLabelMaybeSourceCode(props: { [key: string]: any }) {
  const existing = (props.expressionItemList || []).some((v) => !!v.valueList?.find((val) => val.value));
  if (!existing && props.hasChangeSourceCode && props.sourceCode) {
    return ExpressionExecutor.translate(props.sourceCode);
  }
}

export function useExpressionLabel(
  props: { value?: string; [key: string]: any },
  expressionOption: Ref<IExpressionOption>,
  expressionItemList: Ref<IExpressionItem[]>
) {
  const expressionLabel = computed(() => {
    const val = useExpressionLabelMaybeSourceCode(props);

    if (val) {
      return val;
    }

    switch (expressionOption.value.labelDisplayType) {
      case IExpressionLabelDisplayType.VALUE:
        return (
          props.value || createExpressionValue(expressionItemList.value as IExpressionItem[], expressionOption.value!)
        );
      case IExpressionLabelDisplayType.API_NAME:
        return createExpressionApiName(expressionItemList.value as IExpressionItem[], expressionOption.value!);
      case IExpressionLabelDisplayType.DISPLAY_NAME:
      default:
        return createExpressionDisplayName(expressionItemList.value as IExpressionItem[], expressionOption.value!);
    }
  });
  return { expressionLabel };
}

export function useWatchExpressionItemList(
  props: { value?: string; expressionItemList: IExpressionItem[] },
  expressionOption: Ref<IExpressionOption>,
  expressionItemList: Ref<IExpressionItem[]>
) {
  watch(
    () => props.expressionItemList,
    (newVal, oldVal) => {
      if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
        return;
      }
      expressionItemList.value = newVal?.length ? newVal : [createDefaultExpressionItem(expressionOption.value.type)];
    },
    { immediate: true, deep: true }
  );
  watch(
    () => props.value,
    (newVal) => {
      if (!newVal && isEmptyValue(expressionItemList.value)) {
        expressionItemList.value = [createDefaultExpressionItem(expressionOption.value.type)];
      }
    }
  );
}

export function useWatchIsShowExpressionDialog(
  props: { blur?: Function; changeShowDropdown?: (boolean) => void },
  isShowExpressionDialog: Ref<boolean>
) {
  watch(isShowExpressionDialog, (newVal) => {
    if (!newVal) {
      props.blur?.();
    }
    props.changeShowDropdown?.(newVal);
  });
  onBeforeUnmount(() => {
    isShowExpressionDialog.value = false;
  });
}

export function useOnShowExpressionDialog(
  props: { initExpressionItemList?: () => Promise<IExpressionItem[]> },
  isShowExpressionDialog: Ref<boolean>,
  expressionItemList: Ref<IExpressionItem[]>,
  dialogExpressionItemList: Ref<IExpressionItem[]>
) {
  // 是否用后端请求初始化过表达式列表
  const isInitExpressionItems = ref(false);

  const onShowExpressionDialog = async () => {
    isShowExpressionDialog.value = !isShowExpressionDialog.value;
    if (isShowExpressionDialog.value) {
      if (!isInitExpressionItems.value) {
        expressionItemList.value = (await props.initExpressionItemList?.()) || expressionItemList.value;
        isInitExpressionItems.value = true;
      }

      const list = deepClone(expressionItemList.value) as IExpressionItem[];
      list.forEach((a) => (a.showValueListLabel = true));
      dialogExpressionItemList.value = list;
    }
  };

  return { isInitExpressionItems, onShowExpressionDialog };
}

export function useClearExpressionHandler(
  props: { readonly?: boolean; blur?: Function; [key: string]: any },
  expressionLabel: Ref<string>,
  expressionOption: Ref<IExpressionOption>,
  dialogExpressionItemList: Ref<IExpressionItem[]>,
  submitHandler: Function
) {
  const isShowClear = computed(() => {
    return expressionLabel.value && !props.readonly;
  });
  const clearHandler = (closeDialog = true) => {
    dialogExpressionItemList.value = [createDefaultExpressionItem(expressionOption.value.type!)];
    props.onChangeSourceCode(dialogExpressionItemList.value);

    submitHandler?.(closeDialog);
    props.blur?.();
  };

  return { isShowClear, clearHandler };
}

export function useSubmitExpressionHandler(
  props: { onChangeList?: (expressionItems: IExpressionItem[]) => void; [key: string]: any },
  emit: Function,
  isShowExpressionDialog: Ref<boolean>,
  expressionOption: Ref<IExpressionOption>,
  expressionItemList: Ref<IExpressionItem[]>,
  dialogExpressionItemList: Ref<IExpressionItem[]>
) {
  const defaultExpressionItem = [createDefaultExpressionItem(expressionOption.value.type!)];
  const submitHandler = (closeDialog = true) => {
    if (props.hasChangeSourceCode) {
      dialogExpressionItemList.value = defaultExpressionItem;
    }

    setTimeout(() => {
      closeDialog && (isShowExpressionDialog.value = false);
    }, 200);
    expressionItemList.value = JSON.parse(JSON.stringify(dialogExpressionItemList.value));
    props.onChangeList?.(expressionItemList.value);
    emit('change-expression-items', expressionItemList.value);
    const expValue = createExpressionValue(expressionItemList.value as IExpressionItem[], expressionOption.value!);
    emit('change', expValue);
    emit('update:value', expValue);
  };
  return { submitHandler };
}
