import { PropType } from 'vue';
import { PopperTrigger } from '../oio-popper';

export enum OioTooltipPlacement {
  /**
   * @deprecated please use OioTooltipPlacement#tl
   */
  TL = 'tl',
  /**
   * @deprecated please use OioTooltipPlacement#tm
   */
  TM = 'tm',
  /**
   * @deprecated please use OioTooltipPlacement#tr
   */
  TR = 'tr',
  /**
   * @deprecated please use OioTooltipPlacement#rt
   */
  RT = 'rt',
  /**
   * @deprecated please use OioTooltipPlacement#rm
   */
  RM = 'rm',
  /**
   * @deprecated please use OioTooltipPlacement#rb
   */
  RB = 'rb',
  /**
   * @deprecated please use OioTooltipPlacement#bl
   */
  BL = 'bl',
  /**
   * @deprecated please use OioTooltipPlacement#bm
   */
  BM = 'bm',
  /**
   * @deprecated please use OioTooltipPlacement#br
   */
  BR = 'br',
  /**
   * @deprecated please use OioTooltipPlacement#lt
   */
  LT = 'lt',
  /**
   * @deprecated please use OioTooltipPlacement#lm
   */
  LM = 'lm',
  /**
   * @deprecated please use OioTooltipPlacement#lb
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

export type $$OioTooltipPlacement = keyof Omit<
  typeof OioTooltipPlacement,
  'TL' | 'TM' | 'TR' | 'RT' | 'RM' | 'RB' | 'BL' | 'BM' | 'BR' | 'LT' | 'LM' | 'LB'
>;

export function convertAntdTooltipPlacement(placement: OioTooltipPlacement | string | undefined): string | undefined {
  if (!placement) {
    return undefined;
  }
  switch (placement) {
    case OioTooltipPlacement.tl:
      return 'topLeft';
    case OioTooltipPlacement.tm:
      return 'top';
    case OioTooltipPlacement.tr:
      return 'topRight';
    case OioTooltipPlacement.rt:
      return 'rightTop';
    case OioTooltipPlacement.rm:
      return 'right';
    case OioTooltipPlacement.rb:
      return 'rightBottom';
    case OioTooltipPlacement.bl:
      return 'bottomLeft';
    case OioTooltipPlacement.bm:
      return 'bottom';
    case OioTooltipPlacement.br:
      return 'bottomRight';
    case OioTooltipPlacement.lt:
      return 'leftTop';
    case OioTooltipPlacement.lm:
      return 'left';
    case OioTooltipPlacement.lb:
      return 'leftBottom';
    default:
      return placement;
  }
}

export const OioTooltipProps = {
  visible: {
    type: Boolean,
    default: undefined
  },
  title: {
    type: String,
    default: undefined
  },
  trigger: {
    type: String as PropType<PopperTrigger>
  },
  placement: {
    type: String as PropType<OioTooltipPlacement | $$OioTooltipPlacement>
  },
  destroyOnHide: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  overlayClassName: {
    type: String
  },
  overlayStyle: {
    type: String
  },
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: HTMLElement) => HTMLElement>
  }
};
