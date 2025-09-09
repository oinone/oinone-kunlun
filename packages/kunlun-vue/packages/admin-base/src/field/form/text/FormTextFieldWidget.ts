import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNaN, isNumber } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../typing';
import { FormStringFieldWidget } from '../string/FormStringFieldWidget';
import DefaultTextarea from './DefaultTextarea.vue';
import { InputTextareaSize } from './typing';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Form, ViewType.Search], ttype: ModelFieldType.Text }))
export class FormTextFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTextarea);
    return this;
  }

  @Widget.Reactive()
  protected get defaultRows(): InputTextareaSize {
    return 3;
  }

  @Widget.Reactive()
  protected get rows(): InputTextareaSize {
    const { rows } = this.getDsl();
    if (rows == null) {
      return this.defaultRows;
    }
    const autoSize = BooleanHelper.toBoolean(rows);
    if (autoSize != null) {
      return autoSize;
    }
    const minRows = Number(rows);
    if (!isNaN(minRows)) {
      return minRows;
    }
    if (typeof rows === 'string') {
      const [minRows, maxRows] = rows.split(',');
      const minRowsNumber = Number(minRows);
      const maxRowsNumber = Number(maxRows);
      if (isNaN(minRowsNumber) || isNaN(maxRowsNumber)) {
        return this.defaultRows;
      }
      return {
        minRows: minRowsNumber,
        maxRows: maxRowsNumber
      };
    }
    return this.defaultRows;
  }

  @Widget.Reactive()
  protected get maxLength() {
    const _maxLength = this.getDsl().maxLength;
    if (_maxLength) {
      const calLength = this.getLimitLength('maxLength');
      if (isNumber(calLength)) {
        return calLength;
      }
    }
    if (this.field.store) {
      return this.field.size || 16383;
    }
    return _maxLength || 16383;
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await this.validatorSpecific(this.value);
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (this.value == null) {
      return this.validatorSuccess();
    }
    return this.validateLength(this.value);
  }
}
