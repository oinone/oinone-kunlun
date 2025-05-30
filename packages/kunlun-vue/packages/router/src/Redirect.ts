import { VNodeProps, onMounted } from 'vue';

import { useRouter } from './helpers/useRouter';

export interface RedirectProps {
  to: string;
}

export const REDIRECT_COMPONENT_NAME = 'Redirect';

const RedirectImpl = {
  name: REDIRECT_COMPONENT_NAME,
  props: {
    to: String
  },
  setup(props: RedirectProps) {
    const { router } = useRouter();

    onMounted(() => {
      router.navigate(props.to, { replaceUrl: true });
    });
  }
};

export const Redirect = (RedirectImpl as any) as {
  new (): {
    $props: VNodeProps & RedirectProps;
  };
};
