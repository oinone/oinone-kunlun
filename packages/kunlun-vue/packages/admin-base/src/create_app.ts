import { createVueRouter } from '@oinone/kunlun-vue-router';
import Antd from 'ant-design-vue';
import { createApp as createVueApp } from 'vue';
import VXETable from 'vxe-table';
import { DefaultRoot } from './provider';
import 'xe-utils';
import './style/index.scss';

export const createApp = (rootProps = {}) => {
  const root = new DefaultRoot();

  root.initialize();

  const app = createVueApp(
    {
      render: () => root.render()
    },
    rootProps
  );
  app.use(createVueRouter());
  app.use(Antd);
  app.use(VXETable);
  return app;
};
