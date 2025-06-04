import { ExtLoader } from '@oinone/kunlun-spi';
import { createVueRouter } from '@oinone/kunlun-vue-router';
import { createApp as createVueApp } from 'vue';
import VXETable from 'vxe-table';
// import 'vxe-table/lib/style.css';
// import 'xe-utils';

import { ROOT_TOKEN } from './basic';
import './style/index.scss';
import './layout/index.scss';

export const createApp = (rootProps = {}) => {
  const root = ExtLoader.getExt(ROOT_TOKEN);

  // ExtLoader.getExt().register();
  root.initialize();

  const app = createVueApp(
    {
      render: () => root.render()
    },
    rootProps
  );
  app.use(createVueRouter());
  app.use(VXETable);
  return app;
};
