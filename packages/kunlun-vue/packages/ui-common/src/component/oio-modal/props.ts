import { PropType } from 'vue';
import { VcMaskPopupAppearanceProps, VcPopupAppearanceProps, VcPopupControlProps, VcPopupDataProps } from '../vc-popup';
import { ModalWidth, ModalWidthType } from './typing';

const OioModalAppearanceProps = {
  ...VcPopupAppearanceProps,
  ...VcMaskPopupAppearanceProps,
  title: {
    type: String,
    default: '对话框'
  },
  help: {
    type: String
  },
  width: {
    type: [Number, String] as PropType<ModalWidthType | string | number>,
    default: ModalWidth.small
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
