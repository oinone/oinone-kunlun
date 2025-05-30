import { ActiveRecord } from '@kunlun/engine';
import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../basic';
import { FormTransferFieldWidget } from './FormTransferFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    widget: 'ExportFieldTransfer'
  })
)
export class ExportFieldTransfer extends FormTransferFieldWidget {
  public initialize(props) {
    super.initialize(props);
    return this;
  }

  @Widget.Reactive()
  protected get defaultValue(): ActiveRecord[] {
    if (!this.options?.length) {
      return [];
    }
    const tableFields = this.metadataRuntimeContext.parentContext?.model.modelFields
      .map((f) => {
        const target = this.options.find((o) => `${o.model}+${o.field}` === `${f.model}+${f.data}`);
        if (!target) {
          return undefined;
        }
        return {
          ...target,
          displayName: f.label || target.displayName,
          invisible: f.invisible
        };
      })
      .filter((v) => !!v && BooleanHelper.isFalse(v.invisible));
    return (tableFields || []) as ActiveRecord[];
  }

  protected generatorFullOptions(content) {
    if (!content) {
      return [];
    }
    const tableFields = this.metadataRuntimeContext.parentContext?.model.modelFields;
    return super.generatorFullOptions(
      content.map((o) => {
        const target = tableFields?.find((f) => `${o.model}+${o.field}` === `${f.model}+${f.data}`);
        if (!target) {
          return o;
        }
        return {
          ...o,
          displayName: target.label || o.displayName
        };
      })
    );
  }

  protected backfillSelectedValues() {
    this.setValue(this.generatorFullOptions(this.defaultValue));
    super.backfillSelectedValues();
  }

  @Widget.Reactive()
  protected get sortable() {
    return true;
  }
}
