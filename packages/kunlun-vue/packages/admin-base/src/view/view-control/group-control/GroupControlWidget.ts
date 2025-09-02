import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { IGroup } from '@oinone/kunlun-service';
import { BaseElementWidget } from '../../../basic';
import DefaultGroupControl from './DefaultGroupControl.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'GroupControl'
  })
)
export class GroupControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultGroupControl);
    return this;
  }

  /**
   * 分组数据
   * @see {@link BaseElementListViewWidget}
   */
  @Widget.Reactive()
  @Widget.Inject('groupList')
  protected parentGroupList: IGroup[] | undefined;

  /**
   * 修改分组
   * @see {@link BaseElementListViewWidget}
   */
  @Widget.Method()
  @Widget.Inject()
  protected onGroupChange!: (groupList: IGroup[]) => void;

  @Widget.Reactive()
  protected get groupList() {
    const { modelFields } = this.model;
    return this.parentGroupList?.map((sort) => {
      const field = modelFields.find((field) => field.name === sort.groupField);
      return {
        ...sort,
        title: field?.label
      };
    });
  }

  @Widget.Reactive()
  protected get allFields() {
    return this.model.modelFields;
  }
}
