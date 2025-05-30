import { PropType } from 'vue';

/**
 * 按钮触发方式
 */
export enum PopperTrigger {
  /**
   * 手动控制
   */
  MANUAL = 'manual',
  /**
   * 鼠标悬停
   */
  HOVER = 'hover',
  /**
   * 鼠标点击
   */
  CLICK = 'click',
  /**
   * 获取焦点
   */
  FOCUS = 'focus',
  /**
   * 鼠标右键唤醒上下文菜单
   */
  CONTEXTMENU = 'contextmenu'
}

export type PopperTriggerType = string | string[] | PopperTrigger | PopperTrigger[];

/**
 * 触发后面板出现的相对位置
 */
export enum PopperRelative {
  BODY = 'body',
  PARENT = 'parent'
}

/**
 * 触发后面板出现的相对定位点
 */
export enum PopperRelativePosition {
  /**
   * 左上（left-top）
   */
  LT = 'lt',
  /**
   * 左下（left-bottom）
   */
  LB = 'lb',
  /**
   * 右上（right-top）
   */
  RT = 'rt',
  /**
   * 右下（right-bottom）
   */
  RB = 'rb',
  /**
   * 上中（top-middle）
   */
  TM = 'tm',
  /**
   * 右中（right-middle）
   */
  RM = 'rm',
  /**
   * 下中（bottom-middle）
   */
  BM = 'bm',
  /**
   * 左中（left-middle）
   */
  LM = 'lm'
}

/**
 * 触发后面板出现的位置
 */
export interface PopperPosition {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export const OioPopperProps = {
  visible: {
    type: Boolean,
    default: undefined
  },
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: HTMLElement) => HTMLElement>
  },
  disabled: {
    type: Boolean,
    default: false
  },
  trigger: {
    type: [String, Array] as PropType<PopperTriggerType | PopperTriggerType[]>,
    default: [PopperTrigger.HOVER]
  },
  relative: {
    type: String as PropType<PopperRelative>,
    default: PopperRelative.PARENT
  },
  relativePosition: {
    type: String as PropType<PopperRelativePosition>,
    default: PopperRelativePosition.LT
  },
  offsetPosition: {
    type: Object as PropType<PopperPosition>
  },
  destroyOnHide: {
    type: Boolean,
    default: false
  },
  popperClass: {
    type: [String, Array] as PropType<string | string[]>
  },
  popperStyle: {
    type: Object as PropType<CSSStyleDeclaration>
  },
  popperTransition: {
    type: String,
    default: 'oio-fade-in-linear'
  },
  mouseenterDelay: {
    type: Number,
    default: 0.1
  },
  mouseleaveDelay: {
    type: Number,
    default: 0.1
  }
};
