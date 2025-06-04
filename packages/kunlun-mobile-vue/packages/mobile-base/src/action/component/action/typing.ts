import { IAction } from '@oinone/kunlun-meta';
import { ObjectUtils } from '@oinone/kunlun-shared';
import { ButtonBizStyle, ButtonType, PopconfirmPlacement } from '@oinone/kunlun-vue-ui-common';
import { PropType } from 'vue';

export const BaseActionProps = {
  action: {
    type: Object as PropType<IAction>
  },
  bizStyle: {
    type: String,
    default: ButtonBizStyle.default
  },
  label: {
    type: String
  },
  help: {
    type: String
  },
  icon: {
    type: String
  },
  invisible: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledTitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  validateAndClick: {
    type: Function
  },
  validatorForm: {
    type: Function as PropType<() => Promise<boolean>>
  },
  confirm: {
    type: String
  },
  confirmTitle: {
    type: String
  },
  confirmPosition: {
    type: String as PropType<PopconfirmPlacement>
  },
  enterText: {
    type: String
  },
  cancelText: {
    type: String
  }
};

export const ActionProps = {
  ...BaseActionProps,
  type: {
    type: String,
    default: ButtonType.primary
  }
};

export function useAction(props) {
  const condition = async () => {
    if (ObjectUtils.isNotEmpty(props.confirm)) {
      if (props.validatorForm) {
        if (!(await props.validatorForm?.())) {
          return undefined;
        }
      }
      return true;
    }
    return false;
  };

  return {
    condition
  };
}
