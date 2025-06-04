import { ExpressionExecutor, SubmitValue } from '@oinone/kunlun-engine';
import { IModelField, isEmptyValue, ModelFieldType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import {
  createContextItems,
  createDefaultExpressionItem,
  createExpressionDefinition,
  createExpressionDefinitionByExpressionItem,
  createExpressionDisplayName,
  createExpressionItemByExpressionDefinition,
  createExpressionValue,
  ExpressionDefinitionType,
  IExpressionDefinition,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IQueryExpressionParam,
  IVariableContextItem,
  IVariableCustomMethodContext,
  IVariableValueType,
  queryExpression
} from '@oinone/kunlun-vue-expression';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isBoolean, isNil, isString } from 'lodash-es';
import { FormFieldWidget } from '../../../../basic';

export class ExpressionAbstractWidget extends FormFieldWidget {
  @Widget.Reactive()
  protected type = ExpressionDefinitionType.OPERATION;

  @Widget.Reactive()
  protected sourceCode = '';

  @Widget.Reactive()
  protected hasChangeSourceCode = false;

  protected isFrontend = false;

  public initialize(props) {
    this.setExpressionItemList([createDefaultExpressionItem(this.type)]);
    super.initialize(props);
    return this;
  }

  @Widget.Reactive()
  protected expressionItemList: IExpressionItem[] = [];

  // @deprecated
  @Widget.Reactive()
  protected get valueList(): IExpressionItem[] {
    return this.getExpressionItemList();
  }

  // @deprecated
  protected set valueList(expressionItems: IExpressionItem[]) {
    this.setExpressionItemList(expressionItems);
  }

  public getExpressionItemList() {
    return this.expressionItemList;
  }

  public setExpressionItemList(expressionItemList?: IExpressionItem[]) {
    if (JSON.stringify(expressionItemList) === JSON.stringify(this.expressionItemList)) {
      return;
    }
    expressionItemList = !expressionItemList?.length ? [createDefaultExpressionItem(this.type)] : expressionItemList;
    this.expressionItemList = expressionItemList;
  }

  // 当此项为 true 时，点选每级菜单选项值都会发生变化
  @Widget.Reactive()
  protected get changeVariableOnSelect() {
    const { changeVariableOnSelect } = this.getDsl();
    if (isNil(changeVariableOnSelect)) {
      return false;
    }
    if (isBoolean(changeVariableOnSelect)) {
      return changeVariableOnSelect;
    }
    if (isString(changeVariableOnSelect) && BooleanHelper.isStringBoolean(changeVariableOnSelect)) {
      return !!BooleanHelper.toBoolean(changeVariableOnSelect);
    }
    return false;
  }

  @Widget.Reactive()
  protected get isLowCode() {
    return this.rootData?.[0]?.isLowCode;
  }

  @Widget.Reactive()
  protected get title() {
    const { title } = this.getDsl();
    return this.executeExpression(title) || this.field.displayName || this.field.label;
  }

  // 表达式展示字段
  @Widget.Reactive()
  protected get expDisplayNameField() {
    const { expDisplayNameField } = this.getDsl();
    return expDisplayNameField;
  }

  // 表达式对象存储字段
  @Widget.Reactive()
  protected get expItemsField() {
    const { expItemsField } = this.getDsl();
    return expItemsField;
  }

  // 表达式后端对象存储字段
  @Widget.Reactive()
  protected get expDefinitionField() {
    const { expDefinitionField } = this.getDsl();
    return expDefinitionField;
  }

  @Widget.Reactive()
  protected onChangeList(newList: IExpressionItem[]) {
    this.customOnChangeList(newList);
  }

  @Widget.Reactive()
  protected onChangeSourceCode(value: string | IExpressionItem[]) {
    if (typeof value === 'string') {
      this.sourceCode = value;
      this.hasChangeSourceCode = true;
    } else {
      this.sourceCode = createExpressionValue(value, this.createExpressionOption());
      this.hasChangeSourceCode = false;
    }
  }

  public customOnChangeList(newList: IExpressionItem[]) {
    if (this.hasChangeSourceCode) {
      this.setExpressionItemList(newList);
      this.setValue(this.sourceCode);
      if (isEmptyValue(this.value) && isEmptyValue(this.getExpressionItemList())) {
        this.setExpressionItemList([createDefaultExpressionItem(this.type)]);
      }
      if (this.expDisplayNameField) {
        this.formData[this.expDisplayNameField] = ExpressionExecutor.translate(this.sourceCode);
      }

      return;
    }

    this.setExpressionItemList(newList);
    this.setValue(createExpressionValue(this.getExpressionItemList(), this.createExpressionOption()));
    if (isEmptyValue(this.value) && isEmptyValue(this.getExpressionItemList())) {
      this.setExpressionItemList([createDefaultExpressionItem(this.type)]);
    }
    if (this.expDisplayNameField) {
      this.formData[this.expDisplayNameField] = createExpressionDisplayName(
        this.getExpressionItemList(),
        this.createExpressionOption()
      );
    }
  }

  @Widget.Reactive()
  protected get expressionOption(): IExpressionOption {
    return this.createExpressionOption();
  }

  protected createExpressionOption() {
    return {
      variableContextItems: this.contextItems,
      models: this.models,
      type: this.type,
      ttypes: this.ttypes,
      quoteType: this.quoteType,
      leftJoinTtype: this.leftJoinTtype,
      leftJoinField: this.leftJoinField,
      showVariableType: this.showVariableType,
      modelModel: this.modelModel,
      variableCustomMethod: this.variableCustomMethod
    } as IExpressionOption;
  }

  // 当前模型的编码
  @Widget.Reactive()
  protected get modelModel(): string {
    return this.models && this.models[0];
  }

  // 可选的ttype类型, 为空则是允许所有
  @Widget.Reactive()
  protected get ttypes(): ModelFieldType[] {
    const { ttypes } = this.getDsl();
    return ttypes ? (ttypes.split(',') as ModelFieldType[]) : [];
  }

  // 使用方的ttype类型，leftJoinTtype为string的时候ttypes可选值：string/text/html/email/phone
  @Widget.Reactive()
  protected get leftJoinTtype(): ModelFieldType {
    return this.getDsl().leftJoinTtype as unknown as ModelFieldType;
  }

  @Widget.Reactive()
  protected get leftJoinField(): IModelField {
    return null as any;
  }

  @Widget.Reactive()
  protected get showVariableType(): boolean {
    const { showVariableType = true } = this.getDsl();
    return isNil(showVariableType) ? true : BooleanHelper.toBoolean(showVariableType)!;
  }

  // 字段的存储类型
  @Widget.Reactive()
  protected get isFieldStore() {
    const { isFieldStore } = this.getDsl();
    return isNil(isFieldStore) ? true : BooleanHelper.toBoolean(isFieldStore);
  }

  @Widget.Reactive()
  protected get showFooter(): boolean {
    const { showFooter = true } = this.getDsl();
    return isNil(showFooter) ? true : BooleanHelper.toBoolean(showFooter)!;
  }

  /**
   * 字符串包裹引号的类型
   * @protected
   */
  @Widget.Reactive()
  protected get quoteType(): IExpressionQuoteType {
    const { quoteType } = this.getDsl();
    return quoteType ? (quoteType as IExpressionQuoteType) : IExpressionQuoteType.SINGLE;
  }

  @Widget.Reactive()
  protected get contextItems(): IVariableContextItem[] {
    const { contextItems, workflowModelExp, expModel } = this.getDsl();
    return createContextItems(
      contextItems,
      this.formData.model as string,
      (this.executeExpression(expModel || workflowModelExp, null) || this.field.model) as string
    );
  }

  @Widget.Reactive()
  protected get isSimpleMode() {
    return (
      this.contextItems &&
      this.contextItems.length === 1 &&
      this.contextItems[0].models &&
      this.contextItems[0].models.length === 1
    );
  }

  @Widget.Reactive()
  protected get models(): string[] {
    if (!this.contextItems) {
      return [];
    }
    const models: string[] = [];
    this.contextItems.forEach((item) => {
      if (item.models) {
        item.models.forEach((model) => models.includes(model) || models.push(model));
      }
    });
    return models;
  }

  // 过滤modelField的方法
  @Widget.Method()
  public filterMethod(field: IModelField): boolean {
    return true;
  }

  // 对变量额外的自定义处理方法
  public variableCustomMethod(
    variableStr: string,
    type?: IVariableValueType,
    variableCustomMethodContext?: IVariableCustomMethodContext
  ) {
    return variableStr;
  }

  // 对数字额外的自定义处理方法
  public numberCustomMethod(numStr: string | number, ttype: ModelFieldType) {
    return numStr;
  }

  public async submit(submitValue: SubmitValue) {
    await this.customSubmit();
    return super.submit(submitValue);
  }

  public async customSubmit(queryExpressionParam?: IQueryExpressionParam) {
    const expressionDefinition = createExpressionDefinitionByExpressionItem(
      queryExpressionParam || this.queryExpressionParam,
      this.valueList,
      this.createExpressionOption()
    );
    await createExpressionDefinition(expressionDefinition);
  }

  @Widget.Watch('formData.id', { deep: true, immediate: true })
  public async watchId() {
    await this.initData();
  }

  @Widget.Method()
  public async initExpressionItemList(): Promise<IExpressionItem[]> {
    return this.initData();
  }

  public async initData(): Promise<IExpressionItem[]> {
    if (this.value) {
      const expression = (await this.queryExpression()) as IExpressionDefinition;
      if (expression) {
        createExpressionItemByExpressionDefinition(expression, this.createExpressionOption());
        const valueList = expression.itemList;
        this.setExpressionItemList(!valueList?.length ? [createDefaultExpressionItem(this.type)] : valueList);
        this.sourceCode = this.value as string;

        const list = valueList || [];

        if (list.length && this.sourceCode && !list.some((v) => !!v.valueList?.find((val) => val.value))) {
          this.hasChangeSourceCode = true;
        }
      } else {
        this.setExpressionItemList([createDefaultExpressionItem(this.type)]);
        this.sourceCode = this.value as string;
        this.hasChangeSourceCode = true;
      }
    }

    return this.getExpressionItemList();
  }

  @Widget.Reactive()
  public get queryExpressionParam(): IQueryExpressionParam {
    return {
      model: this.field?.model,
      field: this.field?.name,
      key: this.formData?.id as string
    } as IQueryExpressionParam;
  }

  protected async queryExpression(): Promise<IExpressionDefinition> {
    return queryExpression(this.queryExpressionParam);
  }
}
