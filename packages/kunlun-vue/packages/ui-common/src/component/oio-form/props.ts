import { PropType } from 'vue';
import { OioColModel } from '../oio-block';
import { OioSpinProps } from '../oio-spin';

export enum FormLayout {
  /**
   * @deprecated please using FormLayout#horizontal
   */
  HORIZONTAL = 'horizontal',
  /**
   * @deprecated please using FormLayout#vertical
   */
  VERTICAL = 'vertical',
  /**
   * @deprecated please using FormLayout#inline
   */
  INLINE = 'inline',

  horizontal = 'horizontal',
  vertical = 'vertical',
  inline = 'inline'
}

export type $$FormLayout = keyof Omit<typeof FormLayout, 'HORIZONTAL' | 'VERTICAL' | 'INLINE'>;

export enum FormLabelAlign {
  /**
   * @deprecated please using FormLabelAlign#left
   */
  LEFT = 'left',
  /**
   * @deprecated please using FormLabelAlign#right
   */
  RIGHT = 'right',

  left = 'left',
  right = 'right'
}

type $$FormLabelAlign = keyof Omit<typeof FormLabelAlign, 'LEFT' | 'RIGHT'>;

export enum ValidateTrigger {
  /**
   * @deprecated please using ValidateTrigger#change
   */
  CHANGE = 'change',
  /**
   * @deprecated please using ValidateTrigger#blur
   */
  BLUR = 'blur',

  change = 'change',
  blur = 'blur'
}

type $$ValidateTrigger = keyof Omit<ValidateTrigger, 'CHANGE' | 'BLUR'>;

export enum ComputeTrigger {
  /**
   * @deprecated please using ComputeTrigger#change
   */
  CHANGE = 'change',
  /**
   * @deprecated please using ComputeTrigger#blur
   */
  BLUR = 'blur',

  change = 'change',
  blur = 'blur'
}

export enum WidgetTrigger {
  /**
   * @deprecated please using WidgetTrigger#change
   */
  CHANGE = 'change',
  /**
   * @deprecated please using WidgetTrigger#blur
   */
  BLUR = 'blur',
  /**
   * @deprecated please using WidgetTrigger#custom
   */
  CUSTOM = 'custom',

  change = 'change',
  blur = 'blur',
  custom = 'custom'
}

export enum SearchTrigger {
  /**
   * @deprecated please using SearchTrigger#manual
   */
  MANUAL = 'manual',
  /**
   * @deprecated please using SearchTrigger#change
   */
  CHANGE = 'change',

  manual = 'manual',
  change = 'change'
}

export interface FormItemRule {
  required?: boolean;
  message?: string;
  validator?: (rule: FormItemRule, value) => Promise<void | never>;
}

export const AFormProps = {
  name: {
    type: String
  },
  rules: {
    type: Object as PropType<Record<string, FormItemRule[]>>
  },
  layout: {
    type: String as PropType<FormLayout | $$FormLayout>
  },
  labelCol: {
    type: Object as PropType<OioColModel>
  },
  wrapperCol: {
    type: Object as PropType<OioColModel>
  },
  labelAlign: {
    type: [String, Object] as PropType<FormLabelAlign | $$FormLabelAlign>
  },
  colon: {
    type: Boolean,
    default: false
  },
  validateTrigger: {
    type: [String, Array] as PropType<ValidateTrigger | ValidateTrigger[] | $$ValidateTrigger | $$ValidateTrigger[]>
  },
  validateOnRuleChange: {
    type: Boolean,
    default: true
  }
};

export const OioFormProps = {
  ...AFormProps,
  ...OioSpinProps,
  data: {
    type: Object
  }
};

export const AFormItemProps = {
  name: {
    type: String
  },
  rules: {
    type: [Object, Array]
  },
  autoLink: {
    type: Boolean,
    default: true
  },
  colon: {
    type: Boolean,
    default: false
  },
  htmlFor: {
    type: String
  },
  labelCol: {
    type: Object as PropType<OioColModel>
  },
  wrapperCol: {
    type: Object as PropType<OioColModel>
  },
  labelAlign: {
    type: String as PropType<FormLabelAlign | $$FormLabelAlign>
  },
  label: {
    type: String
  },
  extra: {
    type: String
  },
  help: {
    type: String
  },
  required: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: undefined
  },
  validateStatus: {
    type: String
  },
  validateFirst: {
    type: Boolean,
    default: undefined
  },
  validateTrigger: {
    type: [String, Array] as PropType<(ValidateTrigger | $$ValidateTrigger) | (ValidateTrigger | $$ValidateTrigger)[]>
  }
};

export const OioFormItemProps = {
  ...AFormItemProps,
  layout: {
    type: [String, Object] as PropType<FormLayout>
  }
};
