import {
  ActiveRecord,
  ActiveRecords,
  getRelationFieldKey,
  isRelatedField,
  parseConfigs,
  RuntimeModel,
  RuntimeModelField,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { Entity, IModelField, isEmptyValue, ModelType } from '@oinone/kunlun-meta';
import { Condition, ObjectValue } from '@oinone/kunlun-request';
import { IQueryPageOption, IQueryPageResult, queryPage } from '@oinone/kunlun-service';
import { CastHelper, NumberHelper } from '@oinone/kunlun-shared';
import {
  autoFillSelectedValueToOptions,
  autoFillSelectedValueToOptionsByLabel,
  builderSelectSearchCondition
} from '../../../../layout';
import { PageSizeEnum, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';
import { FormComplexFieldProps } from '../FormComplexFieldWidget';
import { BaseSelectFieldWidget } from './BaseSelectFieldWidget';

/**
 * 关系字段下拉选的抽象类
 */
export abstract class FormSelectComplexFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends BaseSelectFieldWidget<Value, Field, Props> {
  protected selectedValue!: Record<string, unknown>; // 单选选中的值

  protected selectedOption!: Record<string, unknown>; // 单选选中的选项

  protected selectedValues!: Record<string, unknown>[]; // 多选选中的值

  protected timeout;

  protected searchValue = '';

  @Widget.Reactive()
  protected get queryFieldName() {
    return this.searchFields.length ? this.searchFields.join(',') : 'name';
  }

  protected abstract fillOptions(dataList: Record<string, unknown>[], insetDefaultValue?: boolean);

  @Widget.Reactive()
  protected loadMoreLoading = false;

  @Widget.Reactive()
  protected showMoreButton = false;

  @Widget.Reactive()
  protected isInitOptions = false;

  @Widget.Reactive()
  protected get allowSelectAll() {
    return this.pageSize < 0;
  }

  protected totalPages = 10000;

  protected currentPage = 1;

  protected pageSize = PageSizeEnum.OPTION_2;

  @Widget.Reactive()
  protected options: Record<string, unknown>[] = [];

  @Widget.Reactive()
  protected get selectedOptions(): Entity[] {
    return this.handleSelectOption(
      this.field.multi ? this.selectedValues : this.selectedValue ? [this.selectedValue] : [],
      this.referencesModel
    );
  }

  protected dataList: Record<string, unknown>[] = [];

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  @Widget.Watch('value', { deep: true })
  protected watchValue() {
    if (this.field.multi) {
      this.selectedValues = this.value as any;
    } else {
      this.selectedValue = this.value as any;
    }
    if (!isEmptyValue(this.value)) {
      if (this.dataList && this.dataList.length) {
        this.fillOptions(this.dataList);
      }
    } else {
      if (this.oldDomain && this.oldDomain !== this.domain) {
        // 解决其他字段联动后当前字段domain发生了改变，且配置了clearFields清空了当前字段value的时候，之前已选中的对象还在options的问题
        // 之前watch domain 属性是没有用的，domain发生改变的时候value还是老的数据，所以需要在domain和value同时明确发生改变后重新获取一次options
        this.currentPage = 1;
        this.initLoadOptions();
        this.oldDomain = '';
      }
    }
  }

  public async loadMetadata() {}

  @Widget.Method()
  protected generatorSelectOption(optionDataList: Record<string, unknown>[]) {
    return this.handleSelectOption(optionDataList, this.referencesModel);
  }

  protected handleSelectOption(
    optionDataList: Record<string, unknown>[],
    referencesModel: RuntimeModel | undefined
  ): Entity[] {
    const { separator = ' ' } = this.getDsl();
    const xmlOptionLabel = this.optionLabel;
    const metaModelLabel = referencesModel?.label;
    if (isEmptyValue(xmlOptionLabel) && isEmptyValue(metaModelLabel)) {
      let labelFields: string[] = [];
      labelFields = referencesModel?.labelFields || [];
      return autoFillSelectedValueToOptions(
        this.relationFieldKey,
        this.value as Entity,
        optionDataList,
        labelFields,
        separator
      );
    }
    return autoFillSelectedValueToOptionsByLabel(
      this.relationFieldKey,
      this.value as Entity,
      optionDataList,
      xmlOptionLabel,
      metaModelLabel,
      this.optionLabelContextArgs
    );
  }

  protected async fillOptionsForMulti(dataList: Record<string, unknown>[]) {
    const pk = this.referencesModel!.pks!;
    if (this.selectedValues) {
      for (let j = 0; j < this.selectedValues.length; j++) {
        const selected = this.selectedValues[j];
        const selectedOptionIndex = dataList.findIndex((option) => {
          for (let i = 0; i < pk.length; i++) {
            if (selected[pk[i]] !== option[pk[i]]) {
              return false;
            }
          }
          return true;
        });
        if (selectedOptionIndex < 0) {
          dataList = [selected, ...dataList];
        } else {
          const secondSelectedOptionIndex = dataList.slice(selectedOptionIndex + 1).findIndex((option) => {
            for (let i = 0; i < pk.length; i++) {
              if (selected[pk[i]] !== option[pk[i]]) {
                return false;
              }
            }
            return true;
          });
          if (secondSelectedOptionIndex >= 0) {
            dataList.splice(secondSelectedOptionIndex + 1, 1);
          }
        }
      }
    }
    this.dataList = dataList;
    this.options = this.handleSelectOption(this.dataList, this.referencesModel);
  }

  protected async fillOptionsForSingle(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    const pk = this.referencesModel?.pks || [];
    let valid = true;
    for (let i = 0; i < pk.length; i++) {
      if (this.selectedValue && this.selectedValue[pk[i]] == null) {
        valid = false;
        break;
      }
    }
    if (this.selectedValue && valid) {
      const selectedOptionIndex = dataList.findIndex((option) => {
        for (let i = 0; i < pk.length; i++) {
          if (this.selectedValue && this.selectedValue[pk[i]] !== option[pk[i]]) {
            return false;
          }
        }
        return true;
      });
      if (selectedOptionIndex < 0 && insetDefaultValue) {
        dataList = [...dataList];
        // dataList = [this.selectedValue, ...dataList];
      } else {
        const secondSelectedOptionIndex = dataList.slice(selectedOptionIndex + 1).findIndex((option) => {
          for (let i = 0; i < pk.length; i++) {
            if (this.selectedValue && this.selectedValue[pk[i]] !== option[pk[i]]) {
              return false;
            }
          }
          return true;
        });
        if (secondSelectedOptionIndex >= 0) {
          dataList.splice(secondSelectedOptionIndex + 1, 1);
        }
      }
    }
    this.dataList = dataList;
    this.options = this.handleSelectOption(this.dataList, this.referencesModel);

    // if (!insetDefaultValue && !isEmptyValue(this.value)) {
    //   this.selectedOption = {
    //     value: this.value?.[this.relationFieldKey]
    //   };
    // }

    // let existInOptions = false;
    // if (this.selectedOption && this.selectedOption.value) {
    //   existInOptions = !!this.options.find((option) => option.value === this.selectedOption.value);
    //   if (!existInOptions && !isEmpty(this.options) && !this.clearBackFillSelected) {
    //     this.options.unshift(this.selectedOption);
    //   }
    // }
  }

  @Widget.Reactive()
  protected get renderOnParent() {
    const _renderOnParent = this.getDsl().renderOnParent;
    if (isNil(_renderOnParent)) {
      return false;
    }
    return _renderOnParent;
  }

  @Widget.Reactive()
  protected get clearBackFillSelected() {
    const _clearBackFillSelected = this.getDsl().clearBackFillSelected;
    if (isNil(_clearBackFillSelected)) {
      return false;
    }
    return _clearBackFillSelected;
  }

  @Widget.Reactive()
  protected get relationFieldKey() {
    return getRelationFieldKey(this.field, this.referencesModel);
  }

  @Widget.Reactive()
  protected get allowClear() {
    const { allowClear } = this.getDsl();
    if (isNil(allowClear)) {
      return true;
    }
    return allowClear;
  }

  @Widget.Reactive()
  protected get showSearch() {
    const show = this.getDsl().showSearch;
    if (!isNil(show)) {
      return show;
    }
    return true;
  }

  @Widget.Method()
  protected async loadMore() {
    this.currentPage += 1;
    if (this.currentPage > this.totalPages) {
      this.showMoreButton = false;
      return;
    }
    this.loadMoreLoading = true;
    const iQueryPageResult = await this.loadOptions({
      condition: builderSelectSearchCondition(this.queryFieldName, this.searchValue, this.domain),
      currentPage: this.currentPage
    });

    const options = [...this.dataList, ...iQueryPageResult.content];
    await this.fillOptions(options, true);
    this.loadMoreLoading = false;
  }

  @Widget.Method()
  protected async onSelect(e) {
    this.selectedOption = e;
    if (this.searchValue) {
      this.search('');
    }
  }

  @Widget.Reactive()
  protected get maxDepth(): number {
    let maxDepth = NumberHelper.toNumber(this.getDsl().maxDepth);
    if (isNil(maxDepth) || (maxDepth !== -1 && maxDepth <= 0)) {
      maxDepth = 1;
    }
    return maxDepth;
  }

  protected async loadOriginValue() {
    const { value } = this;
    if (Array.isArray(value) && value.length) {
      const ids = value.map((val) => val[this.relationFieldKey]);
      const item = this.options.filter((o) => ids.includes(o.value));
      const references = this.field.references;
      if (!item.length && references) {
        // const cond = new Condition('id').in(ids).toString();
        // const condition = this.domain ? `${this.domain} and ${cond}` : cond;
        // const opts = await queryPage(references, { condition });
        const res = this.handleSelectOption(this.dataList, this.referencesModel);
        this.options.unshift(...res);
        this.dataList.unshift(...res);
      }
    }
  }

  /**
   * 如果当前字段是m2m select， 并且有值 ,那么发起查询获取数据
   *
   *   否则就在字段获取焦点的时候查询
   */
  @Widget.Reactive()
  protected get needInitOptions() {
    if (Array.isArray(this.value)) {
      return !!this.value.length;
    }

    if (this.readonly || this.disabled) {
      return false;
    }

    return false;
  }

  protected mountedProcess() {
    super.mountedProcess();

    if (this.needInitOptions) {
      this.initLoadOptions();
    }
  }

  protected async initLoadOptions() {
    this.loadMoreLoading = true;
    try {
      const data = await this.loadOptions();
      if (data) {
        await this.fillOptions(data.content, true);
        this.isInitOptions = true;
      }
    } finally {
      this.loadMoreLoading = false;
    }
  }

  protected async loadOptions(param: IQueryPageOption = {}) {
    /**
     * @description 如果当前字段是非存储，并且它的关联模型是（STORE[`存储模型`] || PROXY[`代理模型`]）才需要 `queryPage`
     */
    const { references } = this.field;
    const option = { condition: this.domain, queryData: this.queryData, ...param, pageSize: this.pageSize };
    let { type: referencesType } = this.referencesModel!;
    const referencesModelFields = (this.referencesModel?.modelFields || []) as unknown as RuntimeModelField[];
    let content;
    // fixme @zbh 20221129 改版
    if (false) {
      // if (this.field.optionsLoadApi) {
      // content = queryFieldDataList4Options(
      //   CastHelper.cast(this.field),
      //   CastHelper.cast(this.field),
      //   [],
      //   this.getSelfViewWidget()!.getDsl(),
      //   this.formData,
      //   [this.formData],
      //   this.rootData,
      //   useMatched().matched.segmentParams?.page?.scene
      // );
    } else if (references) {
      if (!referencesType) {
        const referenceModel = this.referencesModel!;
        referencesType = referenceModel.type;
      }
      if (referencesType === ModelType.STORE || referencesType === ModelType.PROXY) {
        // 这里暂时只能做到两层, 否则中间层的模型字段无处定义
        const mainModel = this.model;
        const elseQueryFields: RuntimeModelField[] = [];
        const mainModelFields = mainModel.modelFields;
        if (mainModelFields) {
          for (const modelField of mainModelFields) {
            if (
              modelField &&
              isRelatedField(modelField) &&
              modelField.relatedTtype &&
              modelField.related &&
              modelField.related.length > 1
            ) {
              const mainFieldName = modelField.related[0];
              const elseFieldName = modelField.related[1];
              if (this.field!.name === mainFieldName) {
                elseQueryFields.push({
                  ...modelField,
                  model: references,
                  name: elseFieldName,
                  ttype: modelField.relatedTtype
                });
              }
            }
          }
        }
        for (const elseQueryField of elseQueryFields) {
          const index = referencesModelFields?.findIndex((_f) => _f.name === elseQueryField.name);
          if (index < 0) {
            referencesModelFields?.push(elseQueryField);
          }
        }
        const iQueryPageResult = await this.innerQueryPage(references, option, referencesModelFields!, undefined, {
          maxDepth: this.maxDepth
        });
        this.totalPages = FormSelectComplexFieldWidget.getRealPages(iQueryPageResult.totalPages);
        this.showMoreButton = this.currentPage < this.totalPages;

        content = iQueryPageResult;
      }
    } else {
      content = {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 0
      } as IQueryPageResult<Record<string, unknown>>;
    }
    if (content && !content.content) {
      content.content = [];
    }
    return content;
  }

  @Widget.Method()
  protected async search(searchValue: string, forceSearch = false, reload = false) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (!forceSearch && !reload) {
      if (this.searchValue === searchValue) {
        return;
      }
    }
    this.searchValue = searchValue;
    this.currentPage = 1;
    this.loadMoreLoading = true;
    this.timeout = setTimeout(delaySearch, 400);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    async function delaySearch() {
      const iQueryPageResult = await self.loadOptions({
        condition: builderSelectSearchCondition(self.queryFieldName, self.searchValue, self.domain),
        currentPage: self.currentPage
      });
      if (iQueryPageResult) {
        self.totalPages = FormSelectComplexFieldWidget.getRealPages(iQueryPageResult.totalPages);
        await self.fillOptions(iQueryPageResult.content, false);
      }
      self.loadMoreLoading = false;
    }
  }

  protected oldDomain = '';

  @Widget.Watch('domain')
  protected async onDomainChange(newDomain, oldDomain) {
    if (newDomain !== oldDomain) {
      this.oldDomain = oldDomain;
      this.currentPage = 1;
      // this.initLoadOptions();
    }
  }

  @Widget.Watch('queryData')
  protected async onQueryChange(newData, oldData) {
    if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
      this.currentPage = 1;
      this.initLoadOptions();
    }
  }

  @Widget.Reactive()
  protected get maxNumber() {
    const _maxNumber = this.getDsl().maxNumber;
    if (_maxNumber) {
      return _maxNumber;
    }
    return Infinity;
  }

  @Widget.Reactive()
  protected get minNumber() {
    const _minNumber = this.getDsl().minNumber;
    if (_minNumber) {
      return _minNumber;
    }
    return 0;
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    const { value } = this;
    if (!isNil(value) && this.required) {
      if (this.field.multi) {
        const values = CastHelper.cast<ActiveRecord[]>(value);
        const { length } = values;
        if (length > 0) {
          if (!isNil(this.maxNumber) && length > this.maxNumber) {
            return this.validatorError(
              `${this.field.label} translateValueByKey('最多选择')${this.maxNumber}translateValueByKey('个')`
            );
          }
          if (!isNil(this.minNumber) && length < this.minNumber) {
            return this.validatorError(
              `${this.field.label} translateValueByKey('最少选择')${this.minNumber}translateValueByKey('个')`
            );
          }
        }
      }
    }
    return this.validatorSuccess();
  }

  @Widget.Method()
  protected handleEmpty(forceSearch = false) {
    // value置空说明是触发了清除, 这个时候搜索关键词应该也要清空, 并且下拉候选项也要恢复初始值
    this.selectedOption = {};
    this.search('', forceSearch);
  }

  @Widget.Method()
  public focus() {
    super.focus();

    if (this.readonly || this.disabled) {
      return;
    }

    if (!this.options || !this.options.length) {
      this.initLoadOptions();
    } else if (!this.isInitOptions) {
      this.isInitOptions = true;
    }
  }

  @Widget.Method()
  public blur() {
    // 若此时搜索结果为空, 那么需要将候选值恢复初始值, 以防下次下拉的时候还是空
    if (!this.options || !this.options.length) {
      this.handleEmpty(true);
    }
    super.blur();
  }

  @Widget.Method()
  protected changeSearchValue(val: string) {
    this.searchValue = val;
  }

  @Widget.Method()
  protected get getPopupContainer() {
    if (this.renderOnParent) {
      return (triggerNode) => {
        return triggerNode.parentNode || document.body;
      };
    }
    return null;
  }

  protected static getRealPages(val) {
    return isNil(val) ? 1000 : val;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get queryData() {
    return this.genQueryData();
  }

  protected genQueryData() {
    const queryData = {};
    const dslConfig = this.getDsl();
    const { queryDataConfig } = parseConfigs(dslConfig, { key: 'queryDataConfig', prefix: 'queryData' });
    if (queryDataConfig) {
      for (const queryDataConfigKey in queryDataConfig) {
        const value = queryDataConfig[queryDataConfigKey] as any;
        queryData[queryDataConfigKey] = this.executeExpression(value, value);
      }
      return queryData;
    }
    return {};
  }

  protected async innerQueryPage<T = Record<string, unknown>>(
    modelModel: string,
    option: IQueryPageOption,
    fields?: RuntimeModelField[],
    variables?: ObjectValue,
    context: ObjectValue = {}
  ): Promise<IQueryPageResult<T>> {
    if (!isEmptyValue(option.queryData)) {
      const condition = new Condition((option?.condition as Condition)?.toString());
      condition.setConditionBodyData(option.queryData as any);
      option.condition = condition;
    }
    return queryPage(modelModel, option, fields as unknown as IModelField[], variables, context);
  }
}
