import { IGridWidgetProps } from '@oinone/kunlun-engine';
import { CSSStyle } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../../basic';
import Grid from './Grid.vue';

export class GridWidget extends MaskWidget {
  @Widget.Reactive()
  private itemInvisible = false;

  @Widget.Inject('cols')
  @Widget.Reactive()
  private cols!: number;

  @Widget.Reactive()
  protected internalStyle: CSSStyle | undefined;

  @Widget.Reactive()
  public get style(): CSSStyle | undefined {
    return { ...(super.style || {}), ...(this.internalStyle || {}) } as CSSStyle;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(Grid);

    const dsl = this.getDsl();

    const { span = 12, rowIndex = 'auto', columnIndex = 'auto' } = dsl as unknown as IGridWidgetProps;

    let _rowIndex: string | number = rowIndex;
    let _columnIndex: string | number = columnIndex;

    // 行的位置要 + 1，才是正确的
    if (!Number.isNaN(Number(rowIndex))) {
      _rowIndex = Number(rowIndex) + 1;
    }

    // 比如网络一共12列，当前grid占据3列，那么就是 3 + 2，这样在网格中的位置才是对的
    if (!Number.isNaN(Number(this.cols)) && !Number.isNaN(Number(_columnIndex))) {
      // 比如网络一共12列，当前grid占据12列，那么是 12 + 1，这样在网格中的位置才是对的

      if (_columnIndex >= this.cols || Number(span) + 2 >= this.cols) {
        _columnIndex = Number(this.cols) + 1;
      } else {
        _columnIndex = Number(span) + 2;
      }
    }

    const internalStyle = {} as CSSStyle;

    internalStyle.gridArea = `span 1 / span ${span} / ${_rowIndex} / ${_columnIndex}`;

    if (dsl.type && dsl.type === 'flex') {
      internalStyle.display = 'flex';
    }

    this.internalStyle = internalStyle;

    return this;
  }
}
