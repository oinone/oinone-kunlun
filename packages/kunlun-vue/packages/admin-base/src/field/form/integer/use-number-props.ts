import { NumberHelper } from '@oinone/kunlun-shared';
import { isNil } from 'lodash-es';
import { computed } from 'vue';
import { useMetadataProps } from '../../../basic';

export function useNumberProps(props) {
  const metadataProps = useMetadataProps(props);

  const min = computed(() => {
    const num = NumberHelper.toBigNumber(props.min);
    if (!isNil(num)) {
      return num.toString();
    }
    return num;
  });

  const max = computed(() => {
    const num = NumberHelper.toBigNumber(props.max);
    if (!isNil(num)) {
      return num.toString();
    }
    return num;
  });

  const precision = computed(() => {
    const num = NumberHelper.toNumber(props.precision);
    if (isNil(num)) {
      return undefined;
    }
    return num;
  });

  return {
    ...metadataProps,
    min,
    max,
    precision
  };
}
