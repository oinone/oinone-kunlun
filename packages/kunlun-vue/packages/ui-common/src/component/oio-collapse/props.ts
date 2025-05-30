import { PropType } from 'vue';
import { OioBaseContainerProps, OioComponentData } from '../../typing';

export const DEFAULT_COLLAPSE_TITLE = '折叠面板';

export const DEFAULT_COLLAPSE_PANEL_TITLE = '折叠面板项';

export enum OioCollapseExpandIconPosition {
  /**
   * 右侧
   */
  right = 'right',
  /**
   * 左侧
   */
  left = 'left',
  /**
   * 隐藏
   */
  hidden = 'hidden'
}

export enum OioCollapseType {
  /**
   * bordered: true; ghost: false
   */
  bordered = 'bordered',
  /**
   * bordered: true; ghost: false; the color of the header and content is different.
   */
  stripe = 'stripe',
  /**
   * bordered: false; ghost: false
   */
  simple = 'simple',
  /**
   * bordered: false; ghost: true
   */
  ghost = 'ghost'
}

export enum OioCollapseMethod {
  /**
   * 点击头部区域折叠
   */
  default = 'default',
  /**
   * 点击标题折叠
   */
  header = 'header',
  /**
   * 点击图标折叠
   */
  icon = 'icon'
}

export const OioCollapseProps = {
  ...OioComponentData,
  ...OioBaseContainerProps,
  activeKey: {
    type: [String, Array] as PropType<string | string[]>
  },
  type: {
    type: String as PropType<OioCollapseType | keyof typeof OioCollapseType>,
    default: OioCollapseType.bordered
  },
  collapseMethod: {
    type: String as PropType<OioCollapseMethod | keyof typeof OioCollapseMethod>,
    default: undefined
  },
  accordion: {
    type: Boolean,
    default: false
  },
  expandIconPosition: {
    type: [String, Object] as PropType<string | keyof typeof OioCollapseExpandIconPosition>,
    default: OioCollapseExpandIconPosition.right
  },
  destroyInactivePanel: {
    type: Boolean,
    default: false
  }
};

export const OioCollapsePanelProps = {
  ...OioComponentData,
  ...OioBaseContainerProps,
  key: {
    type: String
  },
  forceRender: {
    type: Boolean,
    default: undefined
  },
  collapseMethod: {
    type: String as PropType<OioCollapseMethod | keyof typeof OioCollapseMethod>,
    default: undefined
  },
  header: {
    type: [String, Object]
  },
  showArrow: {
    type: Boolean,
    default: undefined
  }
};
