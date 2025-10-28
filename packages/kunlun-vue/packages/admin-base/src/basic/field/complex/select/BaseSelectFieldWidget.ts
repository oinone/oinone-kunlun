import {
  ActiveRecordExtendKeys,
  ActiveRecords,
  ActiveRecordsOperator,
  isMinimalismTheme,
  Pagination,
  parseConfigs,
  QueryContext,
  QueryVariables,
  RequestHelper,
  RequestModelField,
  RuntimeRelationField,
  SelectConfigManager,
  SelectRuntimeConfig,
  SelectSearchArea
} from '@oinone/kunlun-engine';
import {
  BooleanHelper,
  NumberHelper,
  Optional,
  RSQLCondition,
  StringHelper,
  uniqueKeyGenerator
} from '@oinone/kunlun-shared';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil, toInteger } from 'lodash-es';
import { FormComplexFieldProps, FormComplexFieldWidget } from '../FormComplexFieldWidget';

export abstract class BaseSelectFieldWidget<
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormComplexFieldWidget<Value, Field, Props> {
  protected get selectConfig(): SelectRuntimeConfig {
    return SelectConfigManager.getConfig();
  }

  @Widget.Reactive()
  protected pagination: Pagination | undefined;

  @Widget.Reactive()
  protected loadMoreLoading = false;

  @Widget.Reactive()
  protected loadCompleted = false;

  protected lastDomain: string | undefined;

  @Widget.Reactive()
  public get labelFields(): string[] {
    return this.referencesModel?.labelFields || [];
  }

  @Widget.Reactive()
  public get allowSearch(): boolean {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().allowSearch)).orElse(true);
  }

  /**
   * 搜索所在区域
   * 值域：「搜索框内、下拉框内」
   */
  @Widget.Reactive()
  protected get searchArea(): SelectSearchArea | undefined {
    const { searchArea } = this.selectConfig;
    if (searchArea) {
      return searchArea;
    }
    return isMinimalismTheme() ? SelectSearchArea.dropdown : SelectSearchArea.default;
  }

  @Widget.Reactive()
  public get searchFields(): string[] {
    return StringHelper.convertArray(this.getDsl().searchFields) || this.labelFields;
  }

  @Widget.Reactive()
  public get separator() {
    return this.getDsl().separator || ',';
  }

  @Widget.Reactive()
  public get optionLabelSeparator(): string {
    return Optional.ofNullable(this.getDsl().separator).orElse(' ') || '';
  }

  /**
   * 最多显示多少个 tag
   */
  @Widget.Reactive()
  public get maxTagCount() {
    const { maxTagCount } = this.getDsl();
    return NumberHelper.toNumber(maxTagCount) || undefined;
  }

  /**
   * 选项字段标题(界面设计器配置属性)
   */
  @Widget.Reactive()
  protected get optionLabel() {
    const _optionLabel = this.getDsl().optionLabel;
    if (_optionLabel) {
      return _optionLabel;
    }
    return '';
  }

  @Widget.Reactive()
  protected get optionLabelContextArgs() {
    const _optionLabelContextArgs = this.getDsl().optionLabelContextArgs;
    if (_optionLabelContextArgs) {
      return _optionLabelContextArgs;
    }
    return '';
  }

  @Widget.Reactive()
  protected get isFetchAll(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().fetchAll) || false;
  }

  @Widget.Reactive()
  protected get emptyLabel(): string {
    const { emptyLabel } = this.getDsl();
    if (emptyLabel == null) {
      return '-';
    }
    return emptyLabel || '';
  }

  protected mapping<T extends Record<string, unknown>>(value: T): SelectItem<T> {
    const key = this.generatorSelectItemKey(value);
    return {
      key,
      value: key,
      label: this.generatorSelectItemLabel(value),
      data: value
    };
  }

  protected generatorSelectItemKey(value: Record<string, unknown>): string {
    const pks = this.referencesModel?.pks || [ActiveRecordExtendKeys.DRAFT_ID];
    return pks.map((pk) => value[pk] || '').join('#') || uniqueKeyGenerator();
  }

  protected generatorSelectItemLabel(value: Record<string, unknown>): string {
    const { emptyLabel } = this;
    const optionLabel = this.optionLabel || this.referencesModel?.label;
    if (optionLabel) {
      return this.executeExpressionByParameters({ activeRecord: value }, optionLabel, emptyLabel) || emptyLabel;
    }
    const labelFields = this.referencesModel?.labelFields || ['name'];
    return labelFields.map((labelField) => value[labelField] || '-').join(' ');
  }

  @Widget.Reactive()
  protected get loadFunctionFun(): string | undefined {
    return this.getDsl().load;
  }

  protected generatorCondition(condition?: RSQLCondition): RSQLCondition {
    if (!condition) {
      condition = RSQLCondition.wrapper();
    }
    const { domain, dataSource, referencesModel } = this;
    if (domain) {
      this.lastDomain = domain;
      condition = condition.apply(domain);
    } else {
      this.lastDomain = undefined;
    }
    const pks = referencesModel?.pks || [];
    if (pks.length > 0 && dataSource && dataSource.length > 0) {
      if (dataSource.length === 1) {
        condition = condition.and((c) => {
          for (const item of dataSource) {
            // fixme @zbh 20250910 由于RSQL暂不支持元组，此处不能使用唯一键
            for (const pk of pks) {
              const value = item[pk];
              if (value != null) {
                c.ne(pk, `${value}`);
              }
            }
          }
          return c;
        });
      } else {
        const pkValues: Record<string, string[]> = {};
        for (const item of dataSource) {
          // fixme @zbh 20250910 由于RSQL暂不支持元组，此处不能使用唯一键
          for (const pk of pks) {
            const value = item[pk];
            if (value != null) {
              if (pkValues[pk] == null) {
                pkValues[pk] = [];
              }
              pkValues[pk].push(`${value}`);
            }
          }
        }
        condition = condition.and((c) => {
          for (const pk of Object.keys(pkValues)) {
            const pkValue = pkValues[pk];
            if (pkValue.length === 1) {
              c.ne(pk, pkValue[0]);
            } else if (pkValue.length >= 2) {
              c.notIn(pk, pkValue);
            }
          }
          return c;
        });
      }
    }
    return condition;
  }

  protected generatorQueryData(): Record<string, unknown> {
    const queryData = {};
    const dslConfig = this.getDsl();
    const { queryDataConfig } = parseConfigs(dslConfig, { key: 'queryDataConfig', prefix: 'queryData' });
    if (queryDataConfig) {
      for (const queryDataConfigKey in queryDataConfig) {
        const value = queryDataConfig[queryDataConfigKey];
        if (typeof value === 'string') {
          queryData[queryDataConfigKey] = this.executeExpression(value, value);
        } else {
          queryData[queryDataConfigKey] = value;
        }
      }
      return queryData;
    }
    return queryData;
  }

  public generatorPagination(): Pagination {
    let { pagination } = this;
    if (!pagination) {
      pagination = {} as Pagination;
      this.pagination = pagination;
    }
    let { current, pageSize } = pagination;
    current = toInteger(current) || 1;
    pageSize = toInteger(pageSize) || 20;
    pagination.current = current;
    pagination.pageSize = pageSize;
    return pagination;
  }

  public generatorQueryVariables(): QueryVariables {
    return {
      scene: this.scene
    };
  }

  public generatorQueryContext(): QueryContext {
    return {
      __queryParams: {
        scene: this.scene
      }
    };
  }

  protected generatorRequestFields(): RequestModelField[] {
    return RequestHelper.convertRequestFields(this.referencesModel?.modelFields || []);
  }

  protected mountedProcess() {
    const { value } = this;
    const isMulti = this.field.multi || false;
    if (!value) {
      this.dataSource = [];
      return;
    }
    if (isMulti) {
      if (Array.isArray(value)) {
        this.dataSource = ActiveRecordsOperator.repairRecords(value);
      } else {
        this.dataSource = [];
      }
    } else if (Array.isArray(value)) {
      this.dataSource = ActiveRecordsOperator.repairRecords(value[0]);
    } else {
      this.dataSource = ActiveRecordsOperator.repairRecords(value);
    }
  }

  /**
   * @deprecated please using allowSearch
   */
  @Widget.Reactive()
  protected get showSearch() {
    const show = this.getDsl().showSearch;
    if (!isNil(show)) {
      return show;
    }
    return true;
  }
}
