import { BigNumber } from '@oinone/kunlun-shared';
import { PropType } from 'vue';

const MIN_PRECISION = 0;

const MAX_PRECISION = 6;

const MIN_STEP = 1;

export enum InputType {
  /**
   * @deprecated please use InputType#text
   */
  TEXT = 'TEXT',
  /**
   * @deprecated please use InputType#password
   */
  PASSWORD = 'PASSWORD',

  text = 'text',
  password = 'password'
}

export enum InputMediaMode {
  /**
   * @deprecated please use InputMediaMode#dynamic
   */
  DYNAMIC = 'DYNAMIC',
  /**
   * @deprecated please use InputMediaMode#static
   */
  STATIC = 'STATIC',

  dynamic = 'dynamic',
  static = 'static'
}

export const AInputProps = {
  type: {
    type: String as PropType<InputType | keyof Omit<typeof InputType, 'TEXT' | 'PASSWORD'>>,
    default: InputType.TEXT
  },
  value: {
    type: String
  },
  defaultValue: {
    type: String
  },
  placeholder: {
    type: String
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowClear: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number
  },
  autocomplete: {
    type: [Boolean, String],
    default: undefined
  }
};

export const OioInputProps = {
  ...AInputProps,
  showCount: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  minlength: {
    type: Number
  },
  autofocus: {
    type: Boolean,
    default: undefined
  }
};

export const AInputSearchProps = {
  ...AInputProps
};

export const OioInputSearchProps = {
  ...AInputSearchProps,
  ...OioInputProps
};

export const OioInputNumberProps = {
  value: {
    type: [Number, String]
  },
  defaultValue: {
    type: [Number, String]
  },
  placeholder: {
    type: String
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  formatter: {
    type: Function as PropType<(value: string) => string>
  },
  parser: {
    type: Function as PropType<(value: string) => string>
  },
  min: {
    type: [Number, String],
    validator: (val) => {
      if (new BigNumber(val).isNaN()) {
        console.warn(`Invalid min value. ${val}`);
        return undefined;
      }
      return val;
    }
  },
  max: {
    type: [Number, String],
    validator: (val) => {
      if (new BigNumber(val).isNaN()) {
        console.warn(`Invalid max value. ${val}`);
        return undefined;
      }
      return val;
    }
  },
  minSafeInteger: {
    type: [Number, String],
    default: Number.MIN_SAFE_INTEGER,
    validator: (val) => {
      if (BigInt(val) < -Number.MAX_VALUE) {
        console.warn(`Invalid min safe integer. ${val}`);
        return -Number.MAX_VALUE;
      }
      return val;
    }
  },
  maxSafeInteger: {
    type: [Number, String],
    default: Number.MAX_SAFE_INTEGER,
    validator: (val) => {
      if (BigInt(val) > Number.MAX_VALUE) {
        console.warn(`Invalid max safe integer. ${val}`);
        return Number.MAX_VALUE;
      }
      return val;
    }
  },
  step: {
    type: [Number, String],
    default: MIN_STEP
  },
  addStep: {
    type: [Number, String]
  },
  reduceStep: {
    type: [Number, String]
  },
  precision: {
    type: Number
    // fixme @zbh 等vue修复 custom validator 的判断bug后打开，返回0时会出现警告
    // validator: (val) => {
    //   if (val < MIN_PRECISION) {
    //     console.warn(
    //       `Invalid precision value. The precision value must be between ${MIN_PRECISION} and ${MAX_PRECISION}.`
    //     );
    //     return MIN_PRECISION;
    //   }
    //   if (val > MAX_PRECISION) {
    //     console.warn(
    //       `Invalid precision value. The precision value must be between ${MIN_PRECISION} and ${MAX_PRECISION}.`
    //     );
    //     return MAX_PRECISION;
    //   }
    //   return val;
    // }
  },
  unit: {
    type: String
  },
  hiddenStepHandle: {
    type: Boolean,
    default: false
  },
  showThousandth: {
    type: Boolean,
    default: false
  },
  autocorrection: {
    type: Boolean,
    default: false
  }
};

export const AInputPasswordProps = {
  ...AInputProps
};

export const OioInputPasswordProps = {
  ...AInputPasswordProps,
  ...OioInputProps,
  showPassword: {
    type: Boolean,
    default: true
  }
};

export const OioInputGroupProps = {
  compact: {
    type: Boolean,
    default: undefined
  }
};
