import { Constructor } from '@oinone/kunlun-shared';
import { DisposableSupported } from '../feature';

/**
 * 组件构造器
 */
export type WidgetConstructor<Props extends WidgetProps, Widget extends IWidget<Props>> = Constructor<Widget>;

/**
 * 组件属性
 */
export interface WidgetProps {
  [key: string]: unknown;
}

/**
 * 组件
 */
export interface IWidget<Props extends WidgetProps = WidgetProps> extends DisposableSupported {
  /**
   * 获取当前组件响应式对象
   * @return this
   */
  getOperator();

  /**
   * 获取组件实例ID
   */
  getHandle();

  /**
   * 组件初始化
   * @param props 属性
   */
  initialize(props: Props);

  /**
   * 创建子组件
   * @param constructor 子组件构造器
   * @param slotName 插槽名称
   * @param props 属性
   * @param specifiedIndex 插入/替换指定索引的子组件
   */
  createWidget<ChildProps extends WidgetProps = WidgetProps>(
    constructor: WidgetConstructor<ChildProps, IWidget<ChildProps>>,
    slotName?: string,
    props?: ChildProps,
    specifiedIndex?: number
  );

  /**
   * 获取父组件
   */
  getParent(): IWidget | null;
}
