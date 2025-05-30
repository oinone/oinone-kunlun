import { SubmitHandler } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import {
  createDefaultFieldExpressionItem,
  CURRENT_USER_BACKEND_EXPRESSION,
  currentUserOption,
  ExpressionMode,
  IQueryExpressionParam
} from '@kunlun/vue-expression';
import { Widget } from '@kunlun/vue-widget';
import { isString } from 'lodash-es';
import { FormFieldWidget } from '../../../basic';
import { RsqlConditionPanelWidget } from '../../../field/form';

/**
 * rsql查询条件控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'PermissionRsqlConditionPanel'
  })
)
export class PermissionRsqlConditionPanel extends RsqlConditionPanelWidget {
  @Widget.Reactive()
  private expressMode: ExpressionMode | undefined;

  @Widget.Method()
  public onChangeExpressMode(val: ExpressionMode) {
    this.expressMode = val;
  }

  @Widget.Watch('formData.domainExpJson')
  private watchDomainExpJson(val) {
    if (val) {
      let t = setTimeout(() => {
        const list = JSON.parse(val);

        this.setExpressionItemList(list);
        this.hasChangeSourceCode = false;
        this.sourceCode = '';
        clearTimeout(t);
        t = null as any;
      }, 300);
    }
  }

  public async initData() {
    const { value, formData } = this;
    const domainExpJson = formData?.domainExpJson;
    if (!domainExpJson && isString(value) && value) {
      this.hasChangeSourceCode = true;
      this.sourceCode = value;
      this.onChangeExpressMode(ExpressionMode.SOURCE);
    }
    this.setExpressionItemList(createDefaultFieldExpressionItem(this.fieldOptions, 0, this.type));
    return this.getExpressionItemList();
  }

  public async customSubmit(queryExpressionParam?: IQueryExpressionParam) {}

  public async submit(submitValue) {
    if (this.hasChangeSourceCode) {
      this.formData.domainExpJson = '';
      return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, this.sourceCode);
    }
    const { length } = this.expressionItemList;
    if (length) {
      this.formData.domainExpJson = JSON.stringify(this.expressionItemList);
    } else {
      this.formData.domainExpJson = '';
    }
    return SubmitHandler.DEFAULT(this.field, this.itemName, submitValue, this.value);
  }

  protected createExpressionOption() {
    const option = super.createExpressionOption();
    const finalOption = {
      ...option,
      variableCustomMethod: (variableStr: string) => {
        return `\${${variableStr}}`;
      },
      sessionContextOptions: [
        {
          ...currentUserOption,
          value: CURRENT_USER_BACKEND_EXPRESSION
        }
      ]
    };
    return finalOption;
  }
}
