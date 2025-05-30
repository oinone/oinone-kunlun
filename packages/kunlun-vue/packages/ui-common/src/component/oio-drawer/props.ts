import { PropType } from 'vue';
import { VcMaskPopupAppearanceProps, VcPopupAppearanceProps, VcPopupControlProps, VcPopupDataProps } from '../vc-popup';
import { DrawerHeight, DrawerPlacement, DrawerWidth } from './typing';

const OioDrawerAppearanceProps = {
  ...VcPopupAppearanceProps,
  ...VcMaskPopupAppearanceProps,
  title: {
    type: String,
    default: '抽屉'
  },
  help: {
    type: String
  },
  placement: {
    type: String as PropType<DrawerPlacement | keyof typeof DrawerPlacement>
  },
  width: {
    type: [Number, String] as PropType<DrawerWidth | string | number>,
    default: DrawerWidth.small
  },
  height: {
    type: [Number, String] as PropType<DrawerHeight | string | number>,
    default: DrawerHeight.small
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

const OioDrawerControlProps = {
  ...VcPopupControlProps,
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  confirmLoading: {
    type: Boolean
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

export const OioDrawerProps = {
  ...OioDrawerAppearanceProps,
  ...OioDrawerControlProps,
  ...VcPopupDataProps
};
