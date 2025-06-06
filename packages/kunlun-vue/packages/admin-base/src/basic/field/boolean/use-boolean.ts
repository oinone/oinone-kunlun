import { computed } from 'vue';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { translateValueByKey } from '@oinone/kunlun-engine';

export function useBoolean(props: any) {
  const realLabel = computed(() => {
    const booleanVal = BooleanHelper.toBoolean(props.value);
    if (typeof booleanVal !== 'boolean') {
      return '';
    }
    return booleanVal ? translateValueByKey('是') : translateValueByKey('否');
  });
  return { realLabel };
}
