import { NumberHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { BaseView, BaseViewProps } from '../token';

export class BaseObjectView<Props extends BaseViewProps = BaseViewProps> extends BaseView<Props> {
  @Widget.Reactive()
  @Widget.Inject('cols')
  protected parentCols: number | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get cols() {
    let cols = NumberHelper.toNumber(this.getDsl().cols) as number | undefined;
    if (isNil(cols)) {
      cols = this.parentCols;
    }
    if (isNil(cols)) {
      cols = 1;
    }
    return cols;
  }
}
