import { computed } from 'vue';
import { DebugRequestInfo } from '../typing';

export function useDebugRequestInfo(props: { requestInfo?: DebugRequestInfo }) {
  const isShowResponseInfo = computed(() => {
    return !!props.requestInfo?.allDuration;
  });

  const isShowError = computed(() => {
    return isShowResponseInfo.value && !!props.requestInfo?.errorCode;
  });

  return {
    isShowResponseInfo,
    isShowError
  };
}
