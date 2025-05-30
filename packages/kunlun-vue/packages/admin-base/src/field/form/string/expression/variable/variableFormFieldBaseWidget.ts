import { ModelFieldType, IModelField } from '@kunlun/meta';
import { Widget } from '@kunlun/vue-widget';
import { Pagination, SubmitValue, translateValueByKey } from '@kunlun/engine';
import {
  fetchModelData,
  createExpressionDefinition,
  queryExpression,
  convertModels2FieldSelectionOptions,
  createContextItems,
  createDefaultExpressionItem,
  createDefaultVariableItemList,
  createExpressionDefinitionByExpressionItem,
  createExpressionItemByExpressionDefinition,
  createValueVariableListStr,
  isDefaultBlankStringVariableItemList,
  ExpressionDefinitionType,
  IExpressionDefinition,
  IExpressionOption,
  IExpressionQuoteType,
  IExpModel,
  IExpSelectOption,
  IVariableContextItem,
  IVariableItem,
  VariableItemType,
  IQueryExpressionParam,
  fetchExpressionChildren
} from '@kunlun/vue-expression';

import { FormFieldWidget } from '../../../../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../../../../typing';
import { isNil, isString } from 'lodash-es';

const allowFieldTypes = [
  ModelFieldType.String,
  ModelFieldType.Text,
  ModelFieldType.HTML,
  ModelFieldType.Phone,
  ModelFieldType.Email
];

/**
 * 变量控件
 */
export class VariableFormFieldBaseWidget extends FormFieldWidget {
  public initialize(props) {
    this.setVariableItemList(createDefaultVariableItemList());
    super.initialize(props);
    const { isFieldMode, isFieldStore } = this.getDsl();
    this.isFieldMode = isFieldMode;
    this.isFieldStore = isFieldStore;
    return this;
  }

  @Widget.Reactive()
  protected get quoteType(): IExpressionQuoteType {
    const { quoteType } = this.getDsl();
    return quoteType ? (quoteType as IExpressionQuoteType) : IExpressionQuoteType.SINGLE;
  }

  @Widget.Reactive()
  protected get useContextName(): boolean | undefined {
    const { useContextName } = this.getDsl();
    return isNil(useContextName) ? undefined : !!useContextName;
  }

  // 私有
  @Widget.Reactive()
  public variableItemList: IVariableItem[] = createDefaultVariableItemList();

  // @deprecated
  @Widget.Reactive()
  protected get valueList(): IVariableItem[] {
    return this.getVariableItemList();
  }

  // @deprecated
  protected set valueList(variableItems: IVariableItem[]) {
    this.setVariableItemList(variableItems);
  }

  public getVariableItemList() {
    return this.variableItemList;
  }

  public setVariableItemList(variableItems: IVariableItem[]) {
    if (!isDefaultBlankStringVariableItemList(variableItems)) {
      this.variableItemList = variableItems;
    }
  }

  /**
   * 服务端加载数据结束后务必将该值改为true，否则可能导致部分功能异常
   * @private
   */
  @Widget.Reactive()
  protected isInitData = false;

  @Widget.Reactive()
  private isFieldMode = false;

  @Widget.Reactive()
  private isFieldStore: boolean | undefined = undefined;

  @Widget.Reactive()
  protected minVariableNum = 1;

  @Widget.Reactive()
  protected maxVariableNum = 1;

  @Widget.Reactive()
  protected pagination: Pagination = {
    total: 0,
    pageSize: 10,
    current: 1
  };

  @Widget.Reactive()
  private modelList: IExpModel[] = [];

  @Widget.Reactive()
  private options: IExpSelectOption[] = [];

  // 数据标题变量控件中单个字符串最大输入长度
  @Widget.Reactive()
  private variableMaxStringLength = 10;

  private keyword = '';

  @Widget.Reactive()
  protected get ttypes(): ModelFieldType[] {
    const { ttypes } = this.getDsl();
    return ttypes ? (ttypes.split(',') as ModelFieldType[]) : [];
  }

  @Widget.Reactive()
  protected get contextItems(): IVariableContextItem[] {
    const { contextItems, model } = this.getDsl();
    return createContextItems(
      contextItems,
      this.formData?.model as string,
      (this.executeExpression(model, null) || this.field.model) as string
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

  protected filterMethod = (field: IModelField) => {
    return allowFieldTypes.includes(field.ttype);
  };

  protected get models() {
    if (!this.contextItems) {
      return [];
    }
    const models: string[] = [];
    this.contextItems.forEach((item) => {
      if (item.models) {
        item.models.forEach((model) => model && (models.includes(model) || models.push(model)));
      }
    });
    return models;
  }

  public async fetchModelData() {
    if (!this.models.length) {
      return;
    }
    const queryPageResult = await fetchModelData(this.models, this.keyword, this.pagination);
    this.modelList = queryPageResult.content as IExpModel[];
    this.options = convertModels2FieldSelectionOptions(
      this.modelList,
      this.ttypes,
      this.isFieldStore,
      undefined,
      false,
      this.filterMethod
    );
    if (this.isSimpleMode) {
      this.options = (this.options && this.options[0] && this.options[0].children!) || [];
    }
    this.pagination.total = queryPageResult.totalElements;
  }

  @Widget.Method()
  private async fetchChildren(selectedOptions: IExpSelectOption[]) {
    await fetchExpressionChildren(selectedOptions, this.options, {});
  }

  @Widget.Method()
  protected async onPaginationChange(current, pageSize) {
    this.pagination.current = current;
    this.pagination.pageSize = pageSize;
    this.fetchModelData();
  }

  @Widget.Method()
  public onChangeValueList(list: IVariableItem[]) {
    this.setVariableItemList(list);
    this.change(
      createValueVariableListStr(list, {
        variableContextItems: this.contextItems,
        isBetweenInBrackets: false,
        quoteType: this.quoteType,
        useContextName: this.useContextName
      } as IExpressionOption)
    );
    if (isDefaultBlankStringVariableItemList(list)) {
      this.blur();
    }
  }

  @Widget.Method()
  public onKeywordChange(keyword) {
    this.keyword = keyword;
    this.pagination.current = 1;
    this.fetchModelData();
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    if (this.invisible) {
      return this.validatorSuccess();
    }
    if (this.required) {
      if (this.isInitData && this.minVariableNum >= 1) {
        if (
          this.getVariableItemList().filter((a) => a.type === VariableItemType.VARIABLE).length < this.minVariableNum
        ) {
          return this.validatorError(translateValueByKey('至少要有一个字段'));
        }
      }
    }
    return this.validatorSuccess();
  }

  @Widget.Reactive()
  public get queryExpressionParam() {
    return {
      model: this.field.model,
      field: this.field.name,
      key: this.formData.id as string
    } as IQueryExpressionParam;
  }

  public async submit(submitValue: SubmitValue) {
    await this.customSubmit();
    return super.submit(submitValue);
  }

  public async customSubmit() {
    if (this.queryExpressionParam.key) {
      const expressionItemList = [
        { ...createDefaultExpressionItem(ExpressionDefinitionType.OPERATION), valueList: this.getVariableItemList() }
      ];
      const expressionDefinition = createExpressionDefinitionByExpressionItem(
        this.queryExpressionParam,
        expressionItemList,
        { variableContextItems: this.contextItems, type: ExpressionDefinitionType.OPERATION } as IExpressionOption
      );

      await createExpressionDefinition(expressionDefinition);
    }
  }

  @Widget.Watch('formData.model', { deep: true })
  public async watchModel() {
    if (this.formData.model) {
      this.fetchModelData();
    }
  }

  public async initData() {
    if (this.formData.id) {
      const expression = (await queryExpression(this.queryExpressionParam)) as IExpressionDefinition;
      if (expression) {
        createExpressionItemByExpressionDefinition(expression, {
          variableContextItems: this.contextItems,
          type: ExpressionDefinitionType.OPERATION
        } as IExpressionOption);
        let expressionItemList = expression.itemList;
        expressionItemList =
          !expressionItemList || !expressionItemList.length
            ? [createDefaultExpressionItem(ExpressionDefinitionType.OPERATION)]
            : expressionItemList;

        this.setVariableItemList(expressionItemList[0].valueList!);
        this.isInitData = true;
        return this.getVariableItemList();
      }
    }
    this.setVariableItemList(createDefaultVariableItemList());
    this.isInitData = true;
    return this.getVariableItemList();
  }

  @Widget.Watch('formData.id', { deep: true })
  public watchId() {
    this.initData();
  }

  protected mounted() {
    super.mounted();
    this.fetchModelData();
    this.watchId();
  }
}
