import { IGroup } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
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
  protected parentGroupList;

  @Widget.Reactive()
  protected groupList: (IGroup & { title: string })[] = [];

  /**
   * 修改分组
   * @see {@link BaseElementListViewWidget#onGroupChange}
   */
  @Widget.Method()
  @Widget.Inject()
  protected onGroupChange!: (groupList: IGroup[]) => void;

  @Widget.Method()
  protected onOpen() {
    this.groupList = this.getGroupList();
  }

  protected getGroupList() {
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
