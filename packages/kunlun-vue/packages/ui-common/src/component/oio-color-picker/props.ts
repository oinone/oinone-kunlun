import { PropType } from 'vue';

export const DEFAULT_PREDEFINE = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  'rgba(255, 69, 0, 0.68)',
  'rgb(255, 120, 0)',
  'rgba(250, 213, 0, 1)',
  'rgba(144, 240, 144, 0.5)',
  'rgb(0, 186, 189)',
  'rgba(31, 147, 255, 0.73)',
  '#c7158577'
];

export const DEFAULT_LASTED_COLOR_COUNT = 4;

export enum ColorFormat {
  /**
   * @deprecated please use ColorFormat#hsl
   */
  HSL = 'hsl',
  /**
   * @deprecated please use ColorFormat#hsv
   */
  HSV = 'hsv',
  /**
   * @deprecated please use ColorFormat#hex
   */
  HEX = 'hex',
  /**
   * @deprecated please use ColorFormat#rgb
   */
  RGB = 'rgb',

  hsl = 'hsl',
  hsv = 'hsv',
  hex = 'hex',
  rgb = 'rgb'
}

export enum ColorInputPlacement {
  BEFORE = 'append',
  AFTER = 'prepend'
}

export const OioColorPickerProps = {
  value: {
    type: String
  },
  defaultValue: {
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
  colorFormat: {
    type: String as PropType<ColorFormat | keyof Omit<typeof ColorFormat, 'HSL' | 'HSV' | 'HEX' | 'RGB'>>,
    default: ColorFormat.rgb
  },
  predefine: {
    type: Array as PropType<string[]>,
    default: DEFAULT_PREDEFINE
  },
  showAlpha: {
    type: Boolean,
    default: true
  },
  hasInput: {
    type: Boolean,
    default: false
  },
  inputPlacement: {
    type: String as PropType<ColorInputPlacement | 'append' | 'prepend'>,
    default: ColorInputPlacement.BEFORE
  },
  inputPlaceholder: {
    type: String,
    default: '请选择颜色'
  },
  inputReadonly: {
    type: Boolean,
    default: true
  },
  disabledLastedColor: {
    type: Boolean,
    default: false
  },
  lastedColorCount: {
    type: Number,
    default: DEFAULT_LASTED_COLOR_COUNT
  }
};
