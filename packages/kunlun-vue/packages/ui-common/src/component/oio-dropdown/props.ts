import { CSSStyle } from '@kunlun/shared';
import { PropType } from 'vue';

export enum OioDropdownTrigger {
  /**
   * 鼠标悬停
   */
  hover = 'hover',
  /**
   * 鼠标点击
   */
  click = 'click',
  /**
   * 鼠标右键唤醒上下文菜单
   */
  contextmenu = 'contextmenu'
}

export enum OioDropdownPlacement {
  tl = 'tl',
  tm = 'tm',
  tr = 'tr',
  rb = 'rb',
  bl = 'bl',
  bm = 'bm',
  lt = 'lt'
}

export function convertAntdDropdownPlacement(placement: OioDropdownPlacement | undefined): string | undefined {
  if (!placement) {
    return undefined;
  }
  switch (placement) {
    case OioDropdownPlacement.tl:
      return 'topLeft';
    case OioDropdownPlacement.tm:
      return 'topCenter';
    case OioDropdownPlacement.tr:
      return 'topRight';
    case OioDropdownPlacement.bl:
      return 'bottomLeft';
    case OioDropdownPlacement.rb:
      return 'bottomRight';
    case OioDropdownPlacement.bm:
      return 'bottomCenter';
    default:
      return 'bottomLeft';
  }
}

export const OioDropdownProps = {
  value: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: undefined
  },
  trigger: {
    type: [String, Array] as PropType<
      keyof typeof OioDropdownTrigger | OioDropdownTrigger | (keyof typeof OioDropdownTrigger | OioDropdownTrigger)[]
    >
  },
  placement: {
    type: [String, Object] as PropType<keyof typeof OioDropdownPlacement | OioDropdownPlacement>
  },
  overlayClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  overlayStyle: {
    type: [String, Object] as PropType<string | CSSStyle>
  },
  forceRender: {
    type: Boolean,
    default: undefined
  },
  destroyOnHide: {
    type: Boolean,
    default: undefined
  },
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: Node | HTMLElement) => Node | HTMLElement>
  }
};
