import { PropType } from 'vue';

export enum PopconfirmPlacement {
  /**
   * @deprecated please use PopconfirmPlacement#tl
   */
  TL = 'tl',
  /**
   * @deprecated please use PopconfirmPlacement#tm
   */
  TM = 'tm',
  /**
   * @deprecated please use PopconfirmPlacement#tr
   */
  TR = 'tr',
  /**
   * @deprecated please use PopconfirmPlacement#rt
   */
  RT = 'rt',
  /**
   * @deprecated please use PopconfirmPlacement#rm
   */
  RM = 'rm',
  /**
   * @deprecated please use PopconfirmPlacement#rb
   */
  RB = 'rb',
  /**
   * @deprecated please use PopconfirmPlacement#bl
   */
  BL = 'bl',
  /**
   * @deprecated please use PopconfirmPlacement#bm
   */
  BM = 'bm',
  /**
   * @deprecated please use PopconfirmPlacement#br
   */
  BR = 'br',
  /**
   * @deprecated please use PopconfirmPlacement#lt
   */
  LT = 'lt',
  /**
   * @deprecated please use PopconfirmPlacement#lm
   */
  LM = 'lm',
  /**
   * @deprecated please use PopconfirmPlacement#lb
   */
  LB = 'lb',

  tl = 'tl',
  tm = 'tm',
  tr = 'tr',
  rt = 'rt',
  rm = 'rm',
  rb = 'rb',
  bl = 'bl',
  bm = 'bm',
  br = 'br',
  lt = 'lt',
  lm = 'lm',
  lb = 'lb'
}

export type $$PopconfirmPlacement = keyof Omit<
  typeof PopconfirmPlacement,
  'TL' | 'TM' | 'TR' | 'RT' | 'RM' | 'RB' | 'BL' | 'BM' | 'BR' | 'LT' | 'LM' | 'LB'
>;

export const PopconfirmCallbackProps = {
  confirmCallback: {
    type: Function
  },
  cancelCallback: {
    type: Function
  }
};

export const OioPopconfirmProps = {
  visible: {
    type: Boolean,
    default: undefined
  },
  manual: {
    type: Boolean,
    default: false
  },
  destroyOnClose: {
    type: Boolean,
    default: undefined
  },
  title: {
    type: String,
    default: '警告'
  },
  text: {
    type: String,
    default: '确定是否执行此操作?'
  },
  overlayClassName: {
    type: String
  },
  placement: {
    type: String as PropType<PopconfirmPlacement | $$PopconfirmPlacement>,
    default: PopconfirmPlacement.tm
  },
  enterText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  condition: {
    type: [Boolean, Function],
    default: true
  },
  ...PopconfirmCallbackProps,
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: Node | HTMLElement) => Node | HTMLElement>
  }
};
