const MASK_CLASS = 'k-layout-mask';
const COLLAPSED_CLASS = 'collapsed';

/**
 * 菜单收起util类
 * 菜单收起后统一处理appSwitcher menu对应的变化
 * */
export function maskCollapsed(collapsed: boolean) {
  const maskElement = document.getElementsByClassName(MASK_CLASS)[0];
  if (!maskElement) {
    throw new Error('mask element not found');
  }
  if (collapsed) {
    maskElement.className = `${MASK_CLASS} ${COLLAPSED_CLASS}`;
  } else {
    maskElement.className = `${MASK_CLASS}`;
  }
}
