import { isNil } from 'lodash-es';
import { Widget } from '../basic';
import { DslDefinitionWidgetProps, DslDefinitionWidget } from '../dsl';

export interface PathWidgetProps extends DslDefinitionWidgetProps {
  path?: string;
  subPath?: string;
  subIndex?: string | number;

  __index?: number;
}

/**
 * 路径组件
 */
export class PathWidget<Props extends PathWidgetProps = PathWidgetProps> extends DslDefinitionWidget<Props> {
  /**
   * 上级路径
   */
  @Widget.Reactive()
  @Widget.Inject('path')
  protected parentPath: string | undefined;

  /**
   * 当前子路径
   */
  @Widget.Reactive()
  protected subPath: string | undefined;

  /**
   * 当前子路径索引
   */
  @Widget.Reactive()
  protected subIndex: string | number | undefined;

  /**
   * 当前指定路径
   * @protected
   */
  @Widget.Reactive()
  protected currentPath: string | undefined;

  /**
   * 完整路径
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get path() {
    const { parentPath, subPath, subIndex, currentPath } = this;
    if (isNil(currentPath)) {
      let path = parentPath || '';
      if (this.internal) {
        return path;
      }
      if (subPath) {
        if (path) {
          path = `${path}.${subPath}`;
        } else {
          path = subPath;
        }
        if (subIndex != null) {
          path = `${path}[${subIndex}]`;
        }
      }
      return path;
    }
    return currentPath;
  }

  public initialize(props: Props) {
    super.initialize(props);
    const { subPath, subIndex, path } = props;
    this.currentPath = path;
    this.subPath = subPath || this.template?.dslNodeType || '';
    if (isNil(subIndex)) {
      this.subIndex = props.__index;
    } else {
      this.subIndex = subIndex;
    }
    return this;
  }
}
