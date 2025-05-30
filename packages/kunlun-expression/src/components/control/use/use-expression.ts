import { computed, onMounted, Ref } from 'vue';
import { IExpressionItem, IExpressionLabelDisplayType, IExpressionOption } from '../../../types';
import { createDefaultExpressionItem } from '../../../share';

export function useExpressionOptions(
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
      leftJoinField: props.leftJoinField,
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
