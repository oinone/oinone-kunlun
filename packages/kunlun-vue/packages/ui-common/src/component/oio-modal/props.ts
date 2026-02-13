import type { CSSStyle } from '@oinone/kunlun-shared';
import type { PropType } from 'vue';
import { VcMaskPopupAppearanceProps, VcPopupAppearanceProps, VcPopupControlProps, VcPopupDataProps } from '../vc-popup';
import type { ModalWidthType } from './typing';

export interface ModalWrapperProps {
  id?: string;
  bodyStyle?: string | CSSStyle;
  maskStyle?: string | CSSStyle;
}

const OioModalAppearanceProps = {
  ...VcPopupAppearanceProps,
  ...VcMaskPopupAppearanceProps,
  title: {
    type: String
  },
  help: {
    type: String
  },
  width: {
    type: [Number, String] as PropType<ModalWidthType | string | number>
  },
  height: {
    type: [Number, String] as PropType<ModalWidthType | string | number>
  },
  headerInvisible: {
    type: Boolean,
    default: undefined
  },
  footerInvisible: {
    type: Boolean,
    default: undefined
  },
  // 是否显示切换全屏按钮
  enabledFullScreen: {
    type: Boolean,
    default: true
  },
  // 是否显示切换窗口类型按钮
  showPopupToggle: {
    type: Boolean,
    default: true
  },
  wrapperProps: {
    type: Object as PropType<ModalWrapperProps>
  },
  centered: {
    type: Boolean,
    default: undefined
  }
};

const OioModalControlProps = {
  ...VcPopupControlProps,
  loading: {
    type: Boolean,
    default: undefined
  },
  confirmLoading: {
    type: Boolean,
    default: undefined
  },
  draggable: {
    type: Boolean,
    default: false
  },
  enterText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  }
};

export const OioModalProps = {
  ...OioModalAppearanceProps,
  ...OioModalControlProps,
  ...VcPopupDataProps
};
