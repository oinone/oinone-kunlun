import { ModelFieldType, IModelField, ViewType, SystemSource } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ExpressionKeyword } from '@kunlun/expression';
import { FormFieldWidget } from '../../../../../basic';
import { Widget } from '@kunlun/vue-widget';
import {
  ModelFieldSelectControl,
  ExpressionKeywordDisplayName,
  IVariableContextItem,
  IVariableItem
} from '@kunlun/vue-expression';
import { isBoolean, isNil, isString } from 'lodash-es';
import { BooleanHelper } from '@kunlun/shared';

/**
 * 指定模型下的字段选择控件
 */
@SPI.ClassFactory(
  FormFieldWidget.Token({
    widget: 'ModelFieldSelectControl',
    viewType: ViewType.Form,
    ttype: ModelFieldType.String
  })
)
export class ModelFieldSelectControlWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ModelFieldSelectControl);

    // this.fillContextItems();
    return this;
  }

  private fillContextItems() {
    let { workflowModelExp = '', expModel = '', canSelectComplexField = true, canSelectRelationField = false } = this.getDsl();
    this.isCanSelectComplexField = canSelectComplexField;
    this.isCanSelectRelationField = canSelectRelationField;
    expModel = this.executeExpression(expModel || workflowModelExp, '');
    this.contextItems = (
      !expModel
        ? []
        : [
            {
              name: ExpressionKeyword.activeRecord,
              displayName: ExpressionKeywordDisplayName.activeRecord,
              models: [expModel]
            }
          ]
    ) as IVariableContextItem[];
  }

  @Widget.Reactive()
  private contextItems = [] as IVariableContextItem[];

  @Widget.Reactive()
  protected isCanSelectComplexField = true;

  @Widget.Reactive()
  protected isSimpleMode = true;

  @Widget.Reactive()
  protected isCanSelectRelationField = false;

  @Widget.Reactive()
  private get size() {
    const { size = 'default' } = this.getDsl();
    return size;
  }

  // 当此项为 true 时，点选每级菜单选项值都会发生变化
  @Widget.Reactive()
  protected get changeOnSelect() {
    let { changeOnSelect } = this.getDsl();
    if (isNil(changeOnSelect)) {
      return false;
    }
    if (isBoolean(changeOnSelect)) {
      return changeOnSelect;
    }
    if (isString(changeOnSelect) && BooleanHelper.isStringBoolean(changeOnSelect)) {
      return !!BooleanHelper.toBoolean(changeOnSelect);
    }
    return false;
  }

  @Widget.Method()
  public filterMethod(field: IModelField) {
    if (!this.isCanSelectRelationField && field.systemSource == SystemSource.RELATION) {
      return false;
    }
    if (field.multi) {
      return false;
    }
    return true;
  }

  protected mounted() {
    this.fillContextItems();
    super.mounted();
  }

  @Widget.Method()
  public change(value: IVariableItem) {
    super.change(value && value.apiName);
  }
}
