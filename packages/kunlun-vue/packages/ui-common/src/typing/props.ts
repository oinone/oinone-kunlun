import { PropType } from 'vue';
import { $$FormLayout, FormLayout } from '../component/oio-form/props';

export const OioComponentData = {
  /**
   * 第三方扩展属性
   */
  componentData: {
    type: Object as PropType<Record<string, unknown>>
  }
};

/**
 * 容器组件属性
 */
export const OioBaseContainerProps = {
  /**
   * 表单布局
   */
  layout: {
    type: String as PropType<FormLayout | $$FormLayout>
  },
  /**
   * 是否隐藏
   */
  invisible: {
    type: Boolean,
    default: undefined
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: undefined
  },
  /**
   * @deprecated 弃用属性
   */
  help: {
    type: String,
    default: undefined
  }
};

export type OioBaseContainerPropsType = {
  layout?: FormLayout;
  invisible?: boolean;
  disabled?: boolean;
};
