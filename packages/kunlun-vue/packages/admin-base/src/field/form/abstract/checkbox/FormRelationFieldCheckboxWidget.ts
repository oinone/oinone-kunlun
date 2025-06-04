import {
  ActiveRecord,
  QueryPageOptions,
  QueryPageResult,
  QueryService,
  RequestHelper,
  RuntimeRelationField,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { BooleanHelper, NumberHelper } from '@oinone/kunlun-shared';
import { SelectItem, WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { FormComplexFieldWidget } from '../../../../basic/field/complex/FormComplexFieldWidget';
import { isValidatorSuccess, ValidatorInfo } from '../../../../typing';

export abstract class FormRelationFieldCheckboxWidget<
  Field extends RuntimeRelationField = RuntimeRelationField
> extends FormComplexFieldWidget<ActiveRecord[], Field> {
  @Widget.Reactive()
  protected selectedValues: string[] | undefined;

  @Widget.Reactive()
  protected fullOptions: SelectItem<ActiveRecord>[] | undefined;

  protected fullOptionsMap: Map<string, SelectItem<ActiveRecord>> | undefined;

  @Widget.Reactive()
  protected get options(): SelectItem<ActiveRecord>[] {
    return this.getAvailableOptions();
  }

  protected getAvailableOptions(): SelectItem<ActiveRecord>[] {
    return this.fullOptions || [];
  }

  @Widget.Reactive()
  protected get autocorrection() {
    return BooleanHelper.toBoolean(this.getDsl().autocorrection);
  }

  @Widget.Reactive()
  protected get optionLabel() {
    return this.getDsl().optionLabel;
  }

  @Widget.Reactive()
  protected get orientation() {
    const _orientation = this.getDsl().orientation as string;
    if (_orientation) {
      return _orientation;
    }
    return undefined;
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
    return -Infinity;
  }

  /**
   * 选择变更
   * @param keys 选择的keys
   */
  @Widget.Method()
  public onSelectedChange(keys: string[] | undefined) {
    const { fullOptionsMap } = this;
    if (!fullOptionsMap) {
      console.error('full options uninitialized.');
      return;
    }
    this.selectedValues = keys;
    if (!keys) {
      super.change([]);
      return;
    }
    const submitData: ActiveRecord[] = [];
    for (const key of keys) {
      const value = fullOptionsMap.get(key);
      if (value == null) {
        console.error('the value is not included in the full options.', fullOptionsMap, key);
      } else {
        submitData.push(value.data);
      }
    }
    super.change(submitData);
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    const { selectedValues } = this;
    const length = selectedValues?.length;
    const required = this.required && !this.invisible;
    if (!length) {
      if (required) {
        return this.validatorError(`${this.field.label}${translateValueByKey('必填')}`);
      }
      return this.validatorSuccess();
    }
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
    return this.validatorSuccess();
  }

  @Widget.Reactive()
  protected get loadFullOptions(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().loadFullOptions);
  }

  @Widget.Reactive()
  protected get loadPageSize(): number {
    let pageSize = NumberHelper.toNumber(this.getDsl().loadPageSize);
    if (pageSize == null) {
      pageSize = 100;
    }
    return pageSize;
  }

  @Widget.Reactive()
  protected get loadMaxTotalPage(): number {
    let totalPages = NumberHelper.toNumber(this.getDsl().loadMaxTotalPage);
    if (totalPages == null) {
      totalPages = -1;
    }
    return totalPages;
  }

  protected async mountedProcess(): Promise<void> {
    const { loadPageSize, loadFullOptions } = this;
    const firstPage = await this.queryPage({
      currentPage: 1,
      pageSize: loadPageSize,
      condition: this.domain
    });
    if (loadFullOptions) {
      await this.fillFullOptionsForAll(firstPage, loadPageSize);
    } else {
      this.fillFullOptionsForFirstPage(firstPage);
    }
  }

  protected fillFullOptionsForFirstPage(firstPage: QueryPageResult<ActiveRecord>) {
    this.generatorFullOptions(firstPage.content);
    this.backfillSelectedValues();
  }

  protected async fillFullOptionsForAll(firstPage: QueryPageResult<ActiveRecord>, pageSize: number) {
    const { totalPages, content } = firstPage;
    let maxTotalPages = this.loadMaxTotalPage;
    if (maxTotalPages <= 0) {
      maxTotalPages = totalPages;
    }
    if (totalPages <= 1 || maxTotalPages === 1) {
      this.generatorFullOptions(content);
      this.backfillSelectedValues();
      return;
    }
    const results: Promise<ActiveRecord[]>[] = [];
    for (let i = 2; i <= maxTotalPages; i++) {
      results.push(
        this.queryPage<ActiveRecord>({
          currentPage: i,
          pageSize,
          condition: this.domain,
          context: { batch: true }
        }).then((res) => res.content)
      );
    }
    const res = await Promise.all(results);
    res.forEach((v) => content.push(...v));
    this.generatorFullOptions(content);
    this.backfillSelectedValues();
  }

  protected generatorKey(activeRecord: ActiveRecord): string | undefined {
    const pks = this.referencesModel?.pks;
    if (!pks) {
      return undefined;
    }
    return pks.map((pk) => activeRecord[pk]).join('#');
  }

  protected generatorFullOptions(activeRecords: ActiveRecord[]) {
    const fullOptions: SelectItem<ActiveRecord>[] = [];
    const fullOptionsMap = new Map<string, SelectItem<ActiveRecord>>();
    for (const activeRecord of activeRecords) {
      const key = this.generatorKey(activeRecord);
      if (!key) {
        continue;
      }
      const option: SelectItem<ActiveRecord> = {
        key,
        value: key,
        label: this.executeExpressionByItem(activeRecord, this.optionLabel, key) || key,
        data: activeRecord
      };
      fullOptions.push(option);
      fullOptionsMap.set(key, option);
    }
    this.fullOptions = fullOptions;
    this.fullOptionsMap = fullOptionsMap;
  }

  /**
   * 回填选中之值
   * @protected
   */
  protected backfillSelectedValues() {
    const { value } = this;
    if (!value) {
      return;
    }
    const selectedValues: string[] = [];
    for (const activeRecord of value) {
      const key = this.generatorKey(activeRecord);
      if (!key) {
        console.warn('record pk is null.', activeRecord);
        continue;
      }
      selectedValues.push(key);
    }
    this.selectedValues = selectedValues;
  }

  protected async queryPage<T = Record<string, unknown>>(
    option: Omit<QueryPageOptions, 'requestFields'>
  ): Promise<QueryPageResult<T>> {
    return QueryService.queryPage(this.referencesModel!, {
      ...option,
      requestFields: RequestHelper.convertRequestFields(this.referencesModel!.modelFields)
    });
  }

  protected executeExpressionByItem<T>(item: ActiveRecord, expression: string, errorValue?: T): T | string | undefined {
    if (expression === null || expression === undefined) {
      return typeof errorValue === 'boolean' ? errorValue : errorValue || expression;
    }

    /**
     * 如果表达式全是英文，则不需要进行表达式解析，否则会导致翻译后的label或者displayName之类的变成"true"
     */
    if (typeof expression === 'string' && /^[a-zA-Z]+$/.test(expression)) {
      return expression;
    }

    return Expression.run(
      {
        activeRecords: [item],
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.scene
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }
}
