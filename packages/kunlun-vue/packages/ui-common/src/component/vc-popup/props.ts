import { ReturnPromise, ReturnVoid } from '@kunlun/shared';
import { PropType } from 'vue';

export const VcPopupAppearanceProps = {
  zIndex: {
    type: Number,
    default: 1000
  },
  wrapperClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  wrapperProps: {
    type: Object
  }
};

export const VcMaskPopupAppearanceProps = {
  mask: {
    type: Boolean,
    default: undefined
  },
  maskClosable: {
    type: Boolean,
    default: undefined
  }
};

export const VcPopupDataProps = {
  data: {
    type: Object,
    default: {}
  },
  copy: {
    type: Boolean,
    default: true
  },
  deep: {
    type: Boolean,
    default: false
  }
};

export const VcPopupControlProps = {
  visible: {
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
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: Node | HTMLElement) => Node | HTMLElement>
  },
  enterCallback: {
    type: Function as PropType<(event: PointerEvent, data: object) => ReturnPromise<boolean | ReturnVoid>>
  },
  cancelCallback: {
    type: Function as PropType<(event: PointerEvent, data: object) => ReturnPromise<boolean | ReturnVoid>>
  }
};
