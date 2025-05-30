import VXETable from 'vxe-table';
import VXETablePluginAntd from 'vxe-table-plugin-antd';
import VXETablePluginElement from 'vxe-table-plugin-element';
import 'vxe-table/lib/style.min.css';
import 'vxe-table-plugin-antd/dist/style.min.css';
import 'vxe-table-plugin-element/dist/style.min.css';

VXETable.use(VXETablePluginAntd);
VXETable.use(VXETablePluginElement);

export * from './typing';

export * from './props';

export { default as OioTable } from './oio-table.vue';
