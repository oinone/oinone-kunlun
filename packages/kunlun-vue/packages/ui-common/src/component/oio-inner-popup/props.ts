import { ReturnPromise, ReturnVoid } from '@oinone/kunlun-shared';
import { PropType, Slot } from 'vue';
import { DrawerPlacement } from '../oio-drawer';
import { VcPopupAppearanceProps, VcPopupDataProps } from '../vc-popup';
import { InnerPopupSize } from './typing';

type InnerPopupTeleportType = string | HTMLElement;

export const OioInnerPopupAppearanceProps = {
  ...VcPopupAppearanceProps,
  title: {
    type: String,
    default: '标题'
  },
  help: {
    type: String
  },
  placement: {
    type: String,
    default: DrawerPlacement.right
  },
  size: {
    type: [String, Number] as PropType<InnerPopupSize | keyof typeof InnerPopupSize | number | string>,
    default: InnerPopupSize.small
  }
};

export const OioInnerPopupControlProps = {
  teleport: {
    type: [String, Object, Function] as PropType<InnerPopupTeleportType | (() => InnerPopupTeleportType)>,
    required: true
  },
  visible: {
    type: Boolean,
    default: undefined
  },
  loading: {
    type: Boolean,
    default: undefined
  },
  closable: {
    type: Boolean,
    default: undefined
  },
  keyboard: {
    type: Boolean,
    default: undefined
  },
  destroyOnClose: {
    type: Boolean,
    default: undefined
  },
  enterText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  enterCallback: {
    type: Function as PropType<(event: PointerEvent, data: object) => ReturnPromise<boolean | ReturnVoid>>
  },
  cancelCallback: {
    type: Function as PropType<(event: PointerEvent, data: object) => ReturnPromise<boolean | ReturnVoid>>
  }
};

export const OioInnerPopupProps = {
  ...OioInnerPopupAppearanceProps,
  ...OioInnerPopupControlProps,
  ...VcPopupDataProps,
  resizable: {
    type: Boolean,
    default: undefined
  },
  header: {
    type: Function as PropType<Slot>
  },
  footer: {
    type: Function as PropType<Slot>
  }
};
