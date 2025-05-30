import { PropType, VNode } from 'vue';
import { $$OioTooltipPlacement, OioTooltipPlacement } from '../oio-tooltip';

const MIN_STEP = 1;

export enum SliderDirection {
  /**
   * @deprecated please using SliderDirection#horizontal
   */
  HORIZONTAL = 'horizontal',
  /**
   * @deprecated please using SliderDirection#vertical
   */
  VERTICAL = 'vertical',

  horizontal = 'horizontal',
  vertical = 'vertical'
}

export type SliderToolbarFormatter = (value: number) => string;

export const OioSliderProps = {
  value: {
    type: Number
  },
  defaultValue: {
    type: Number
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  },
  step: {
    type: Number,
    default: MIN_STEP
  },
  direction: {
    type: String as PropType<SliderDirection | keyof Omit<typeof SliderDirection, 'HORIZONTAL' | 'VERTICAL'>>,
    default: SliderDirection.horizontal
  },
  marks: {
    type: Object as PropType<{
      [key: number]: string | VNode | { style?: CSSStyleDeclaration; label: string | VNode } | (() => VNode);
    }>
  },
  dots: {
    type: Boolean,
    default: false
  },
  reverse: {
    type: Boolean,
    default: false
  },
  range: {
    type: Boolean,
    default: false
  },
  tooltipVisible: {
    type: Boolean,
    default: undefined
  },
  tooltipPlacement: {
    type: String as PropType<OioTooltipPlacement | $$OioTooltipPlacement>
  },
  tooltipFormatter: {
    type: Function as PropType<SliderToolbarFormatter>
  },
  getTooltipTriggerContainer: {
    type: Function as PropType<(triggerNode: Node | HTMLElement) => Node | HTMLElement>
  }
};
