import { ViewType } from '@oinone/kunlun-meta';
import { Widget, DslNodeWidget } from '@oinone/kunlun-vue-widget';
import { IGridWidgetProps } from '@oinone/kunlun-engine';
import Grid from './Grid.vue';

export class GridWidget extends DslNodeWidget {
  @Widget.Reactive()
  protected style: CSSStyleDeclaration = {} as CSSStyleDeclaration;

  @Widget.Reactive()
  protected itemInvisible = false;

  @Widget.Inject('cols')
  @Widget.Reactive()
  protected cols!: number;

  protected viewType: ViewType = ViewType.Form;

  public initialize(props) {
    super.initialize(props);
    const { dslNode } = props;

    const { span = 12, rowIndex = 'auto', columnIndex = 'auto' } = dslNode as IGridWidgetProps;

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

    this.style.gridArea = `span 1 / span ${span} / ${_rowIndex} / ${_columnIndex}`;

    if (dslNode.type && dslNode.type === 'flex') {
      this.style.display = 'flex';
    }

    this.setComponent(Grid);

    return this;
  }
}
