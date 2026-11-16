import './style/index.scss';
import { ensureSelectListItemHeight } from './select-list-item-height';

// 业务下拉大多不传 listItemHeight，入口先把 ASelect 默认行高对齐选项高度
ensureSelectListItemHeight();

export * from './components';
export * from './vc-component/use-max-tag-placeholder';
