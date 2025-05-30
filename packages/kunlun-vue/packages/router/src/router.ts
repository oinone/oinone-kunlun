import { App, shallowRef, computed } from 'vue';
import { getRouterInstance, ActivatedRoute } from '@kunlun/router';

import { ACTIVATED_ROUTE_TOKEN } from './token';
import { Route } from './Route';
import { Match } from './Match';
import { Redirect } from './Redirect';

const createVueRouter = () => {
  const router = getRouterInstance();
  const currentRoute = shallowRef<ActivatedRoute | null>(null);

  router.activatedRoute.subscribe((activatedRoute) => {
    currentRoute.value = activatedRoute;
  });

  return {
    install: (app: App) => {
      if (app.config.globalProperties.$router) {
        console.warn(`Already install vue router: `, app.config.globalProperties.$router);
        return;
      }
      app.config.globalProperties.$router = router;
      app.component('Route', Route);
      app.component('Match', Match);
      app.component('Redirect', Redirect);

      const reactiveRoute = computed(() => currentRoute.value);
      app.provide(ACTIVATED_ROUTE_TOKEN, reactiveRoute);

      router.ignite();
    }
  };
};

export { createVueRouter };
