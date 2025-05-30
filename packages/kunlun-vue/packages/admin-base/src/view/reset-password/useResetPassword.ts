import { getLoginTheme, MajorConfig } from '@kunlun/engine';
import { computed, reactive, ref } from 'vue';
import { Copyright } from '../../typing';

export function useResetPassword(props: { majorConfig?: MajorConfig; copyrightYear?: string; onOk?: Function }) {
  const formLayout = reactive({
    labelCol: {
      style: { width: '150px' }
    },
    wrapperCol: {
      span: 14
    }
  });

  const formButtonLayout = reactive({
    wrapperCol: {
      style: { marginLeft: '150px' },
      span: 14
    }
  });

  const loading = ref(false);

  const logo = computed(() => {
    const theme = getLoginTheme() || ({} as any);
    return theme.logo || '';
  });

  const copyright = computed<Copyright>(() => {
    return {
      year: props.copyrightYear || '',
      company: props.majorConfig?.partnerName || '',
      icp: props.majorConfig?.icpDesc || ''
    };
  });

  const onOk = async () => {
    loading.value = true;
    try {
      await props.onOk?.();
    } finally {
      loading.value = false;
    }
  };

  return {
    formLayout,
    formButtonLayout,
    loading,
    logo,
    copyright,
    onOk
  };
}
