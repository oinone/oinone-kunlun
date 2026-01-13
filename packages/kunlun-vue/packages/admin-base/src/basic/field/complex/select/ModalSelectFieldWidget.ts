import { ActiveRecord, ActiveRecords, RuntimeRelationField } from '@oinone/kunlun-engine';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ModalSelect } from '../../../../components';
import { TableSelectFieldWidget } from './TableSelectFieldWidget';

export abstract class ModalSelectFieldWidget<
  Option extends ActiveRecord = ActiveRecord,
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField
> extends TableSelectFieldWidget<Option, Value, Field> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ModalSelect);
    return this;
  }

  @Widget.Reactive()
  public get title() {
    return this.field.label;
  }
}
