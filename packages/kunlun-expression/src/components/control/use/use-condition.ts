import { computed, onMounted, Ref } from 'vue';
import { IExpressionItem, IExpressionLabelDisplayType, IExpressionOption } from '../../../types';
import {
  createConditionExpressionApiName,
  createConditionExpressionDisplayName,
  createConditionExpressionValue,
  createDefaultExpressionItem,
  createExpressionApiName,
  createExpressionDisplayName,
  createExpressionValue
} from '../../../share';
import { useExpressionLabelMaybeSourceCode } from './use-common';

export function useConditionOptions(
  props: {
    initExpressionItemList?: () => Promise<IExpressionItem[]>;
    expressionOption?: IExpressionOption;
    [key: string]: any;
  },
  expressionItemList: Ref<IExpressionItem[]>
) {
  const expressionOption = computed(() => {
    return {
      type: props.type,
      contextItems: props.contextItems,
      models: props.models,
      quoteType: props.quoteType,
      ttypes: props.ttypes,
      useContextName: props.useContextName,
      leftJoinTtype: props.leftJoinTtype,
      ...(props.expressionOption as any),
      labelDisplayType: props.expressionOption?.labelDisplayType || IExpressionLabelDisplayType.DISPLAY_NAME
    } as unknown as IExpressionOption;
  });

  onMounted(async () => {
    if (expressionOption.value.labelDisplayType != IExpressionLabelDisplayType.VALUE) {
      expressionItemList.value = (await props.initExpressionItemList?.()) || [
        createDefaultExpressionItem(expressionOption.value.type!)
      ];
    }
  });

  return { expressionOption };
}

export function useConditionLabel(
  props: { value?: string },
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
          props.value ||
          createConditionExpressionValue(expressionItemList.value as IExpressionItem[], expressionOption.value!)
        );
      case IExpressionLabelDisplayType.API_NAME:
        return createConditionExpressionApiName(expressionItemList.value as IExpressionItem[], expressionOption.value!);
      case IExpressionLabelDisplayType.DISPLAY_NAME:
      default:
        return createConditionExpressionDisplayName(
          expressionItemList.value as IExpressionItem[],
          expressionOption.value!
        );
    }
  });
  return { expressionLabel };
}
