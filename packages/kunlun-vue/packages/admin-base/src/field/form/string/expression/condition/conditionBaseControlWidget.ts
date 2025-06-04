import { Widget } from '@oinone/kunlun-vue-widget';
import {
  ExpActiveType,
  IExpressionDefinition,
  IExpressionItem,
  IExpressionOption,
  IExpSelectOption,
  convertModelFields2Options,
  createConditionExpressionValue,
  createDefaultExpressionItem,
  createDefaultExpressionItemList,
  createDefaultFieldExpressionItem,
  createExpressionItemByExpressionDefinition,
  queryExpModelFields,
  createConditionExpressionDisplayName
} from '@oinone/kunlun-vue-expression';
import { ExpressionAbstractWidget } from '../ExpressionAbstractWidget';
import { ExpressionExecutor } from '@oinone/kunlun-engine';

export class ConditionBaseControlWidget extends ExpressionAbstractWidget {
  public initialize(props) {
    this.setExpressionItemList(createDefaultExpressionItemList(this.type));
    super.initialize(props);
    return this;
  }

  protected createExpressionOption() {
    return {
      variableContextItems: this.contextItems,
      models: this.models,
      type: this.type,
      isFrontend: this.isFrontend,
      ttypes: this.ttypes,
      isBetweenInBrackets: true,
      quoteType: this.quoteType,
      showVariableType: this.showVariableType,
      modelModel: this.modelModel,
      variableCustomMethod: this.variableCustomMethod,
      numberCustomMethod: this.numberCustomMethod
    } as IExpressionOption;
  }

  public customOnChangeList(newList: IExpressionItem[]) {
    if (this.hasChangeSourceCode) {
      this.setExpressionItemList(newList);
      this.setValue(this.sourceCode);
      if (this.expDisplayNameField) {
        this.formData[this.expDisplayNameField] = ExpressionExecutor.translate(this.sourceCode);
      }

      return;
    }

    this.setExpressionItemList(newList);
    this.formData[this.itemData] = createConditionExpressionValue(
      this.getExpressionItemList(),
      this.createExpressionOption()
    );
    if (this.expDisplayNameField) {
      this.formData[this.expDisplayNameField] = createConditionExpressionDisplayName(
        this.getExpressionItemList(),
        this.createExpressionOption()
      );
    }
  }

  public async initData() {
    const expression = (await this.queryExpression()) as IExpressionDefinition;
    if (expression) {
      createExpressionItemByExpressionDefinition(expression, this.createExpressionOption());
      const valueList = expression.itemList;
      this.setExpressionItemList(!valueList?.length ? [createDefaultExpressionItem(this.type!)] : valueList);
      this.sourceCode = this.value as string;

      const list = valueList || [];

      if (list.length && this.sourceCode) {
        const valueList = list[0].valueList || [];

        if (!valueList.some((v) => v.value)) {
          this.hasChangeSourceCode = true;
        }
      }
    } else {
      this.setExpressionItemList(createDefaultFieldExpressionItem(this.fieldOptions, 0, this.type));

      if (this.value) {
        this.sourceCode = this.value as string;
        this.hasChangeSourceCode = true;
      }
    }
    return this.getExpressionItemList();
  }

  @Widget.Reactive()
  protected fieldOptions: IExpSelectOption[] = [];

  protected async createFieldOptions() {
    if (!this.models || !this.models.length) {
      return [];
    }

    const modelFields = await queryExpModelFields(this.models[0]);
    const fieldOptions = convertModelFields2Options(
      modelFields,
      this.ttypes,
      this.isFieldStore,
      true,
      true,
      this.filterMethod
    );
    return fieldOptions.filter((a) => a.show === ExpActiveType.ACTIVE);
  }
}
