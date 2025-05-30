import { computed } from 'vue';
import { BooleanHelper } from '@kunlun/shared';
import { translate } from '@kunlun/engine';

export function useBoolean(props: any) {
  const realLabel = computed(() => {
    const booleanVal = BooleanHelper.toBoolean(props.value);
    if (typeof booleanVal !== 'boolean') {
      return '';
    }
    return booleanVal ? translate('kunlun.fields.boolean.true') : translate('kunlun.fields.boolean.false');
  });
  return { realLabel };
}
