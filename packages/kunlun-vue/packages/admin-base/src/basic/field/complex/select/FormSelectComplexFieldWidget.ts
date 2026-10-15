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
  SelectSearchArea,
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
      // 与 683d3254 一致：清字段值不自动清空搜索关键字/结果
      // default 仅隐藏触发框展示用 searchValue，筛选暂存仍保留
      this.hideTriggerSearchDisplay();
      return;
    }

    const selectedValue = this.dataList.find((d) => d[this.relationFieldKey] === value.value)! || value;
    super.change(selectedValue as any);
    // 选中：暂存关键字与筛选结果，仅隐藏展示用 searchValue，再次展开可恢复
    // dropdown 模式 early-return，保持 683d3254「选中后不清理关键字/结果」
    this.parkTriggerSearchAfterSelect();
  }

  /**
   * 是否为「触发框内搜索」模式（searchArea=default）。
   * 该模式下 searchValue 绑定在 a-select 上，关闭态若保留关键字会遮挡已选展示。
   * dropdown 模式不走此分支，行为与 683d3254（关系字段下拉保留搜索关键字与结果）保持一致。
   */
  protected get isTriggerSearchArea(): boolean {
    return this.searchArea === SelectSearchArea.default;
  }

  /**
   * 仅隐藏触发框展示用 searchValue（不影响 options / preserved / searchSnapshot）。
   * 用于清字段后关闭态不再显示旧关键字；筛选态仍按 683d3254 保留。
   */
  protected hideTriggerSearchDisplay() {
    if (!this.isTriggerSearchArea) {
      return;
    }
    this.searchValue = '';
  }

  /**
   * 选中后暂存当前筛选态，并隐藏触发框关键字以展示已选标签。
   * 再次展开时由 restorePreservedTriggerSearch 回填关键字与过滤结果。
   * 注意：不得丢弃筛选结果，也不得影响 dropdown 模式（本方法对 dropdown 直接返回）。
   */
  protected parkTriggerSearchAfterSelect() {
    if (!this.isTriggerSearchArea) {
      return;
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    const keyword =
      this.searchSnapshot?.searchValue || this.searchValue || this.preservedTriggerSearch?.searchValue || '';
    const options = this.searchSnapshot?.options || this.options;
    const dataList = this.searchSnapshot?.dataList || this.dataList;
    const currentPage = this.searchSnapshot?.currentPage ?? this.currentPage;
    const totalPages = this.searchSnapshot?.totalPages ?? this.totalPages;
    const showMoreButton = this.searchSnapshot?.showMoreButton ?? this.showMoreButton;
    // 快照已转入 preserved，避免关闭时再被 restore 成「展示用 searchValue」盖住已选
    this.searchSnapshot = null;
    if (keyword) {
      this.preservedTriggerSearch = {
        searchValue: keyword,
        options: [...options],
        dataList: [...dataList],
        currentPage,
        totalPages,
        showMoreButton
      };
      // 关闭态仍保留筛选 options，保证已选标签可解析，且与再次展开一致
      this.options = [...options];
      this.dataList = [...dataList];
      this.currentPage = currentPage;
      this.totalPages = totalPages;
      this.showMoreButton = showMoreButton;
    }
    // 仅清空展示用关键字，不丢弃 preservedTriggerSearch（等价于保留搜索态）
    this.searchValue = '';
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
    // 选中后关闭下拉时保留搜索关键字与结果，再次打开仍可继续在原结果上选择（683d3254）
    // default 额外：展示用 searchValue 由 parkTriggerSearchAfterSelect 隐藏，展开时再回填
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
   * 触发框搜索（default）收起时暂存的关键字与筛选结果。
   * 收起时 searchValue 置空以展示已选标签；再次展开时回填，实现「展开显示关键字 / 收起显示已选」。
   */
  protected preservedTriggerSearch: {
    searchValue: string;
    options: Record<string, unknown>[];
    dataList: Record<string, unknown>[];
    currentPage: number;
    totalPages: number;
    showMoreButton: boolean;
  } | null = null;

  /**
   * 下拉显隐变化。
   * - dropdown：关闭时恢复关键字与结果；打开且无候选时初始化加载。
   * - default：关闭时暂存关键字并清空展示用 searchValue（显示已选）；打开时回填关键字与筛选结果。
   */
  @Widget.Method()
  protected dropdownVisibleChange(open: boolean) {
    this.isDropdownOpen = open;
    if (!open) {
      // 关闭下拉：取消挂起的空搜索，并按模式处理关键字/结果
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.restoreSearchSnapshot();
      return;
    }
    // 展开：触发框模式优先回填收起前/选中前暂存的关键字与筛选结果
    if (this.restorePreservedTriggerSearch()) {
      return;
    }
    if (!this.options?.length) {
      this.initLoadOptions();
    }
  }

  /**
   * 展开时回填触发框搜索暂存态。
   * @returns 是否已回填（已回填则无需再 initLoadOptions）
   */
  protected restorePreservedTriggerSearch(): boolean {
    if (!this.isTriggerSearchArea || !this.preservedTriggerSearch) {
      return false;
    }
    const preserved = this.preservedTriggerSearch;
    this.searchValue = preserved.searchValue;
    this.options = preserved.options;
    this.dataList = preserved.dataList;
    this.currentPage = preserved.currentPage;
    this.totalPages = preserved.totalPages;
    this.showMoreButton = preserved.showMoreButton;
    return true;
  }

  /**
   * 处理关闭下拉时的搜索快照。
   * - dropdown（683d3254）：完整恢复关键字与结果到当前态，保证再次打开可继续筛选。
   * - default：将关键字与结果写入 preservedTriggerSearch，searchValue 置空以展示已选标签；
   *   再次展开时回填，语义上仍「保留搜索关键字与结果」，仅展示时机不同。
   */
  protected restoreSearchSnapshot() {
    if (this.isTriggerSearchArea) {
      this.parkTriggerSearchOnClose();
      return;
    }
    // —— 以下与 683d3254 restoreSearchSnapshot 保持一致，勿改 ——
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
   * 触发框搜索收起：暂存关键字与筛选结果，并清空展示用 searchValue。
   * 这样关闭态显示已选标签，再次展开可恢复搜索态。
   * 若选中时已写入 preservedTriggerSearch，关闭时无关键字则保留该暂存，不得清空。
   */
  protected parkTriggerSearchOnClose() {
    const keyword = this.searchSnapshot?.searchValue || this.searchValue;
    if (this.searchSnapshot) {
      const snapshot = this.searchSnapshot;
      this.searchSnapshot = null;
      this.options = snapshot.options;
      this.dataList = snapshot.dataList;
      this.currentPage = snapshot.currentPage;
      this.totalPages = snapshot.totalPages;
      this.showMoreButton = snapshot.showMoreButton;
      if (keyword) {
        this.preservedTriggerSearch = {
          searchValue: keyword,
          options: snapshot.options,
          dataList: snapshot.dataList,
          currentPage: snapshot.currentPage,
          totalPages: snapshot.totalPages,
          showMoreButton: snapshot.showMoreButton
        };
      }
      // keyword 为空时保留已有 preserved（选中路径已暂存）
    } else if (keyword) {
      // 未走伪空搜索快照（例如直接点外部关闭），按当前态暂存
      this.preservedTriggerSearch = {
        searchValue: keyword,
        options: [...this.options],
        dataList: [...this.dataList],
        currentPage: this.currentPage,
        totalPages: this.totalPages,
        showMoreButton: this.showMoreButton
      };
    }
    // 无关键字且无快照：保留 selected 时写入的 preservedTriggerSearch，不做清空
    // 关闭态必须清空受控 searchValue，否则会盖住已选标签
    this.searchValue = '';
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
   * 核心规则继承 683d3254：关键字只能由用户手动输入/清空；选中、失焦、关下拉、清字段值都不得自动丢弃筛选结果。
   * - dropdown：关下拉通过 searchSnapshot 完整恢复 searchValue 与 options。
   * - default：关下拉将态写入 preservedTriggerSearch 并隐藏展示用 searchValue；展开再回填（结果不丢）。
   * ant-select 关下拉会伪触发 search('')；仅下拉仍打开时的空串才视为用户手动清空。
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
        // 用户在下拉打开时主动清空搜索：才丢弃暂存并重查（与 683d3254 一致）
        this.searchSnapshot = null;
        this.preservedTriggerSearch = null;
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
    // 仅重置选中态。搜索关键字与结果只能由用户在下拉内手动清理，清字段值时不自动重置（683d3254）。
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
