import { getCurrentInstance } from 'vue';
import { Router } from '@kunlun/router';

// export type Router = Omit<ReturnType<typeof createRouter>, '_instance' | 'ignite' | 'activatedRoute'>;
export const useRouter = (): { router: Router } => {
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error(`No vue instance in current component.`);
  }
  const router: any = instance.appContext.config.globalProperties.$router;

  return { router };
};

/**
 * 该方法只能在beforeCreated、created、mounted生命周期中调用才会生效。
 * 如果想全局使用，请调用 @see {@link getRouterInstance}
 */
export const getRouter = (): Router => {
  return useRouter().router;
};
