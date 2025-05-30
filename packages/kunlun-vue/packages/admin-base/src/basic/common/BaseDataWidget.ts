import { ActiveRecordsWidgetProps, Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { BaseRuntimePropertiesWidget } from './BaseRuntimePropertiesWidget';

export class BaseDataWidget<
  Props extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends BaseRuntimePropertiesWidget<Props> {
  /**
   * 数据交互标识
   */
  @Widget.Reactive()
  public get itemData(): string {
    const { data, name } = this.getDsl();
    return data || name;
  }

  /**
   * 数据提交标识
   */
  @Widget.Reactive()
  public get itemName(): string {
    const { data, name } = this.getDsl();
    return name || data;
  }

  /**
   * 上级数据路径
   */
  @Widget.Reactive()
  @Widget.Inject('dataPath')
  protected parentDataPath: string | undefined;

  /**
   * 当前数据子路径
   */
  @Widget.Reactive()
  protected get subDataPath(): string | undefined {
    return this.itemData;
  }

  /**
   * 当前数据子路径索引
   */
  @Widget.Reactive()
  protected subDataIndex: string | number | undefined;

  /**
   * 当前数据路径
   */
  @Widget.Reactive()
  protected currentDataPath: string | undefined;

  /**
   * 完整路径
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get dataPath(): string {
    const { parentDataPath, subDataPath, subDataIndex, currentDataPath } = this;
    if (isNil(currentDataPath)) {
      let dataPath = parentDataPath || '';
      if (subDataPath) {
        if (dataPath) {
          dataPath = `${dataPath}.${subDataPath}`;
        } else {
          dataPath = subDataPath;
        }
        if (subDataIndex != null) {
          dataPath = `${dataPath}[${subDataIndex}]`;
        }
      }
      return dataPath;
    }
    return currentDataPath;
  }
}
