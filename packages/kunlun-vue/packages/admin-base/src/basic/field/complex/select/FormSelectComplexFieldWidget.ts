import {
  type ActiveRecord,
  type ActiveRecords,
  getRelationFieldKey,
  isRelatedField,
  ModelCache,
  QueryService,
  RequestHelper,
  type RuntimeModel,
  type RuntimeModelField,
  type RuntimeRelationField,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { type Entity, type IModel, isEmptyValue, ModelType } from '@oinone/kunlun-meta';
import { Condition, type ObjectValue } from '@oinone/kunlun-request';
import { DEFAULT_TRUE_CONDITION, IQueryPageOption, IQueryPageResult, queryOne } from '@oinone/kunlun-service';
import { CastHelper, NumberHelper } from '@oinone/kunlun-shared';
import {
  autoFillSelectedValueToOptions,
  autoFillSelectedValueToOptionsByLabel,
  buildSelectSearchCondition
} from '@oinone/kunlun-vue-admin-layout';
import { PageSizeEnum, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNil, isNumber, isString, toInteger } from 'lodash-es';
import { isValidatorSuccess, type ValidatorInfo } from '../../../../typing';
import type { FormComplexFieldProps } from '../FormComplexFieldWidget';
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

  @Widget.Reactive()
  protected searchValue = '';

  protected queryFieldName = 'name';

  protected computeQueryOneDefaultKey() {
    return 'id';
  }

  @Widget.Reactive()
  public get computeQueryOneKey() {
    return this.getDsl().computeQueryOneKey;
  }

  @Widget.Reactive()
  protected showMoreButton = false;

  @Widget.Reactive()
  protected isInitOptions = false;

  protected totalPages = 10000;

  @Widget.Reactive()
  protected total = 0;

  @Widget.Reactive()
  protected currentPage = 1;

  @Widget.Reactive()
  protected pageSize = PageSizeEnum.OPTION_2;

  @Widget.Reactive()
  protected options: Record<string, unknown>[] = [];

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
      this.fillOptions(this.dataList || []);
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

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    this.field.multi ? this.fillOptionsForMulti(dataList) : this.fillOptionsForSingle(dataList, insetDefaultValue);
  }

  public x2oChange(value) {
    if (value == null) {
      super.change(null as any);
      this.handleEmpty();
      return;
    }

    const selectedValue = this.dataList.find((d) => d[this.relationFieldKey] === value.value)! || value;
    super.change(selectedValue as any);
  }

  protected x2mChange(value) {
    if (value == null) {
      super.change(value);
      this.handleEmpty();
    } else {
      if (!value.length) {
        this.handleEmpty();
      }
      const submitData = this.filterX2mChangeValue(value);
      super.change(submitData);
    }
  }

  protected filterX2mChangeValue(value) {
    // focus的时候才会查询数据，这时候dataList为空，如果开始有value，会导致剩下的已选数据匹配不到值
    const list = isEmpty(this.dataList) ? this.value || [] : this.dataList;
    return value
      .map((item) => {
        return (list as any[])?.find((d) => d[this.relationFieldKey] === item.value);
      })
      .filter((a) => !!a);
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

  protected setQueryFieldName(queryFieldName: string) {
    this.queryFieldName = queryFieldName;
  }

  protected async fillOptionsForMulti(dataList: Record<string, unknown>[]) {
    const pk = this.referencesModel?.pks;
    if (!pk) {
      console.error(`current model is not found pks. field: ${this.field.data}`);
      return;
    }
    if (this.selectedValues) {
      for (let j = 0; j < this.selectedValues.length; j++) {
        const selected = this.selectedValues[j];
        if (!selected) {
          continue;
        }
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
        dataList = [this.selectedValue, ...dataList];
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
  }

  @Widget.Reactive()
  protected get relationFieldKey() {
    return getRelationFieldKey(this.field, this.referencesModel);
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
      condition: buildSelectSearchCondition(this.referencesModel, this.queryFieldName, this.searchValue, this.domain),
      currentPage: this.currentPage
    });

    const options = [...this.dataList, ...iQueryPageResult.content];
    await this.fillOptions(options, true);
    this.loadMoreLoading = false;
  }

  @Widget.Method()
  protected async onSelect(e) {
    this.selectedOption = e;
    // 选中后关闭下拉时保留搜索关键字与结果，再次打开仍可继续在原结果上选择
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
      const { references } = this.field;
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
    const { searchFields } = this;
    if (searchFields.length) {
      this.setQueryFieldName(searchFields.join(','));
    }

    if (this.needInitOptions) {
      this.initLoadOptions();
    }

    // if (!this.readonly && !this.disabled) {
    //   if (!this.options || !this.options.length) {
    //     this.loadMoreLoading = true;
    //   }
    // }
  }

  protected async initLoadOptions() {
    this.loadMoreLoading = true;
    try {
      const data = await this.loadOptions({
        condition: buildSelectSearchCondition(this.referencesModel, this.queryFieldName, this.searchValue, this.domain),
        currentPage: this.currentPage
      });
      if (data) {
        await this.fillOptions(data.content, true);
        this.isInitOptions = true;
      }
    } catch (e) {
      console.error('initLoadOptions exp', e);
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
        this.total = toInteger(iQueryPageResult.totalElements);
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

  /**
   * 下拉是否展开。用于识别 ant-select 关闭时触发的空搜索副作用。
   */
  protected isDropdownOpen = false;

  /**
   * 空搜索待确认快照。ant-select 关下拉会先 search('') 再关；
   * 若关闭时仍有快照则恢复，避免清空关键字与结果。
   */
  protected searchSnapshot: {
    searchValue: string;
    options: Record<string, unknown>[];
    dataList: Record<string, unknown>[];
    currentPage: number;
    totalPages: number;
    showMoreButton: boolean;
  } | null = null;

  /**
   * 下拉显隐变化。
   * 关闭时保留已有搜索关键字与对应结果，避免失焦后清空关键字并重查第一页。
   * 仅在打开且尚无候选时触发初始化加载。
   */
  @Widget.Method()
  protected dropdownVisibleChange(open: boolean) {
    this.isDropdownOpen = open;
    if (!open) {
      // 关闭下拉：取消挂起的空搜索，并恢复被 ant-select 抢先清空的关键字/结果
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.restoreSearchSnapshot();
      return;
    }
    if (!this.options?.length) {
      this.initLoadOptions();
    }
  }

  /**
   * 恢复关闭下拉前的搜索快照。
   */
  protected restoreSearchSnapshot() {
    if (!this.searchSnapshot) {
      return;
    }
    const snapshot = this.searchSnapshot;
    this.searchSnapshot = null;
    this.searchValue = snapshot.searchValue;
    this.options = snapshot.options;
    this.dataList = snapshot.dataList;
    this.currentPage = snapshot.currentPage;
    this.totalPages = snapshot.totalPages;
    this.showMoreButton = snapshot.showMoreButton;
  }

  /**
   * 执行搜索查询并回填候选项。
   */
  protected async executeSearchQuery() {
    const iQueryPageResult = await this.loadOptions({
      condition: buildSelectSearchCondition(this.referencesModel, this.queryFieldName, this.searchValue, this.domain),
      currentPage: this.currentPage
    });
    if (iQueryPageResult) {
      this.totalPages = FormSelectComplexFieldWidget.getRealPages(iQueryPageResult.totalPages);
      await this.fillOptions(iQueryPageResult.content, false);
    }
  }

  /**
   * 搜索候选项。
   * 规则：搜索关键字只能由用户在下拉内手动输入/清空；选中、失焦、关下拉、清字段值都不得自动清空。
   * ant-select 关下拉会伪触发 search('')，通过快照在关闭时恢复，仅下拉仍打开时的空串才视为用户手动清空。
   * @param searchValue 搜索关键字；空字符串表示用户清空搜索
   * @param forceSearch 保留参数兼容调用方，不再用于自动清空关键字
   */
  @Widget.Method()
  protected async search(searchValue: string, forceSearch = false) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this.searchValue === searchValue) {
      return;
    }
    // ant-select 关下拉会先触发 search('')（此时下拉仍标记为打开），再触发关闭。
    // 先做快照并延迟提交；若紧接着关闭则恢复快照。仅下拉仍打开才视为用户手动清空。
    if (!forceSearch && !searchValue && this.searchValue) {
      this.searchSnapshot = {
        searchValue: this.searchValue,
        options: [...this.options],
        dataList: [...this.dataList],
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        showMoreButton: this.showMoreButton
      };
      this.searchValue = searchValue;
      this.currentPage = 1;
      this.timeout = setTimeout(() => {
        if (!this.isDropdownOpen) {
          this.restoreSearchSnapshot();
          return;
        }
        this.searchSnapshot = null;
        this.executeSearchQuery();
      }, 100);
      return;
    }
    this.searchSnapshot = null;
    this.searchValue = searchValue;
    this.currentPage = 1;
    this.timeout = setTimeout(() => {
      this.executeSearchQuery();
    }, 400);
  }

  protected oldDomain = '';

  @Widget.Watch('domain')
  protected async onDomainChange(newDomain, oldDomain) {
    if (newDomain !== oldDomain) {
      this.oldDomain = oldDomain;
      this.currentPage = 1;
      this.initLoadOptions();
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

  /**
   * 值是否与选项列表是否一致
   *   如果为 true，那么是编辑页数据回填，在获取焦点的时候需要查询列表
   */
  @Widget.Reactive()
  protected get valueEqualOptions() {
    let valueEqualOptions = false;

    if (this.value) {
      let value: ActiveRecord[];
      if (Array.isArray(this.value)) {
        value = this.value;
      } else {
        value = [this.value];
      }
      valueEqualOptions =
        this.options.length === value.length &&
        this.options.every((opt) => {
          return !!value.find((v) => v[this.relationFieldKey] === opt.value);
        });
    }

    return valueEqualOptions;
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    const { value } = this;
    if (!isNil(value)) {
      if (this.field.multi) {
        const values = CastHelper.cast<ActiveRecord[]>(value);
        const { length } = values;
        if (length > 0) {
          if (!isNil(this.maxNumber) && length > this.maxNumber) {
            return this.validatorError(
              `${this.field.label} ${translateValueByKey('最多选择')}${this.maxNumber}${translateValueByKey('个')}`
            );
          }
          if (!isNil(this.minNumber) && length < this.minNumber) {
            return this.validatorError(
              `${this.field.label} ${translateValueByKey('最少选择')}${this.minNumber}${translateValueByKey('个')}`
            );
          }
        }
      }
    }
    return this.validatorSuccess();
  }

  @Widget.Method()
  protected handleEmpty(_forceSearch = false) {
    // 仅重置选中态。搜索关键字与结果只能由用户在下拉内手动清理，清字段值时不自动重置。
    this.selectedOption = {};
  }

  @Widget.Method()
  public focus() {
    super.focus();

    if (this.readonly || this.disabled) {
      return;
    }

    if (!this.options.length || this.valueEqualOptions) {
      this.initLoadOptions();
    } else if (!this.isInitOptions) {
      this.isInitOptions = true;
    }
  }

  @Widget.Method()
  public blur() {
    // 失焦不清理搜索关键字与结果
    super.blur();
  }

  @Widget.Method()
  protected changeSearchValue(val: string) {
    this.searchValue = val;
  }

  private static getRealPages(val) {
    return isNil(val) ? 1000 : val;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected get queryData() {
    return this.buildQueryData();
  }

  protected buildQueryData() {
    return this.genQueryData();
  }

  protected genQueryData() {
    return this.generatorQueryData();
  }

  @Widget.Reactive()
  protected get computedValue(): string | number | null {
    const _compute = this.getCompute(this.formData);
    if (_compute != null && _compute !== '') {
      const res = this.executeExpression<number | string | null | undefined>(_compute, null);
      if (res == null || res === '') {
        return null;
      }
      return res;
    }
    return null;
  }

  public async updateM2oValue() {
    const val = this.getValue();
    const _compute = this.getCompute(this.formData);
    if (_compute != null && _compute !== '') {
      const computeResult = this.executeExpression<number | null | string | undefined>(_compute, null);
      let queryOneKey = this.computeQueryOneKey;
      const _computeList = _compute.split('.');
      if (_computeList[0] === 'activeRecord' && _computeList[1] && _computeList[2] && !queryOneKey) {
        const currentModel = (await ModelCache.get(this.field!.model)) as unknown as IModel;

        const relatedField = currentModel?.modelFields?.find((_f) => _f.name === _computeList[1]);
        if (relatedField && relatedField.references) {
          const relatedFieldModel = (await ModelCache.get(relatedField.references)) as unknown as IModel;
          if (relatedFieldModel && relatedFieldModel.modelFields) {
            const finalField = relatedFieldModel.modelFields.find(
              (_f) => _f.relationFields && _f.relationFields.includes(_computeList[2])
            );
            if (finalField) {
              const keyIndex = finalField.relationFields?.findIndex((_r) => _r === _computeList[2]);
              queryOneKey = finalField.referenceFields?.[keyIndex!] || 'id';
            }
          }
        }
      }
      if (!queryOneKey) {
        queryOneKey = this.computeQueryOneDefaultKey();
      }
      const param = {};
      param[queryOneKey] = computeResult;
      if (isString(computeResult) || isNumber(computeResult)) {
        if (typeof val === 'object' && !isEmptyValue(val)) {
          if (val[queryOneKey] !== computeResult) {
            const data = await queryOne(this.field!.references!, param);
            this.setValue(data);
          }
        } else {
          const data = await queryOne(this.field!.references!, param);
          this.setValue(data);
        }
      } else if (typeof computeResult === 'object') {
        if (JSON.stringify(computeResult) !== JSON.stringify(this.value)) {
          this.setValue(computeResult);
        }
      } else if (isNil(computeResult)) {
        this.setValue(null);
      }
    }
  }

  protected async innerQueryPage<T = Record<string, unknown>>(
    modelModel: string,
    option: IQueryPageOption,
    fields?: RuntimeModelField[],
    variables?: ObjectValue,
    context: ObjectValue = {}
  ): Promise<IQueryPageResult<T>> {
    let { condition } = option;
    if (!isEmptyValue(option.queryData)) {
      const { queryData } = option;
      if (typeof condition === 'string') {
        condition = new Condition(condition);
      }
      if (!condition) {
        condition = new Condition(DEFAULT_TRUE_CONDITION);
      }
      condition.setConditionBodyData({
        ...(condition.getConditionBodyData() || {}),
        ...queryData
      });
    }
    return QueryService.queryPage(this.referencesModel!, {
      fun: this.loadFunctionFun,
      currentPage: option.currentPage!,
      pageSize: option.pageSize!,
      condition,
      requestFields: RequestHelper.convertRequestFields(fields || []),
      variables,
      context
    }) as unknown as IQueryPageResult<T>;
  }

  /**
   * @deprecated invalid prop
   */
  @Widget.Reactive()
  protected get renderOnParent() {
    const _renderOnParent = this.getDsl().renderOnParent;
    if (isNil(_renderOnParent)) {
      return false;
    }
    return _renderOnParent;
  }

  /**
   * @deprecated invalid prop
   */
  @Widget.Reactive()
  protected get clearBackFillSelected() {
    const _clearBackFillSelected = this.getDsl().clearBackFillSelected;
    if (isNil(_clearBackFillSelected)) {
      return false;
    }
    return _clearBackFillSelected;
  }
}
