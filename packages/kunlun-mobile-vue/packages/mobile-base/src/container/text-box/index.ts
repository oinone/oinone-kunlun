import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BasePackWidget } from '../../basic';
import { DefaultGroupWidget } from '../group';
import Component from './TextBox.vue';

// fixme @zbh 20220816 改版
@SPI.ClassFactory(BasePackWidget.Token({ widget: 'text-box' }))
export class TextBoxGroup extends BasePackWidget {
  @Widget.Reactive()
  protected title = '';

  @Widget.Reactive()
  protected currentValue = '';

  @Widget.Reactive()
  protected filterValue: any[] = [];

  @Widget.Reactive()
  protected width = '100%';

  public initialize(props) {
    super.initialize(props);
    this.setComponent(Component);
    this.title = (this.getDsl().title as string) || '';
    return this;
  }

  @Widget.Reactive()
  public get getValue() {
    const format = (this.getDsl().format || '') as string;
    const formatParts = (format || '').split(/\%f/);
    const len = formatParts.length;

    const values: any[] = [];

    this.getChildren().forEach(async (child) => {
      // const field = (child as CommonItemWidget).getFieldWidget()!;
      //
      // if (field?.value && typeof field?.value === 'object') {
      //   values.push({
      //     value: field?.value,
      //     field
      //   });
      // } else {
      //   values.push(field?.value as any);
      // }
    });

    const children: any[] = [];

    formatParts.forEach((t, i) => {
      children.push(t);

      if (i !== len - 1 && values[i]) {
        children.push(values[i] || '--');
      }
    });

    this.filterValue = children.filter((c) => c);

    return children.filter((c) => c).join('');
  }

  @Widget.Watch('filterValue')
  protected async watchValue(val) {
    const values: string[] = [];
    for (const iterator of val) {
      if (iterator.value && typeof iterator.value === 'object') {
        // eslint-disable-next-line no-await-in-loop
        // const model = await getModel((iterator.field as FormM2OFieldWidget).references!);
        // const labelField = (model && model.labelFields && model.labelFields[0]) || 'name';
        // values.push((iterator.value as any)[labelField] as string);
      } else {
        values.push(iterator);
      }
    }

    this.currentValue = values.filter((v) => v).join('');
  }

  public mounted() {
    super.mounted();
    const span = (this.getDsl().span || '1') as number;

    const parent = (this.getParent() || {}) as DefaultGroupWidget;
    const cols = parent.cols || 1;
    this.width = `${Number(span / cols) * 100}%`;
  }
}
