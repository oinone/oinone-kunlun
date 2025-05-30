import {
  ActiveRecord,
  isM2MField,
  isO2MField,
  QueryPageResult,
  QueryService,
  RequestHelper,
  SubmitHandler,
  SubmitValue,
  translateValueByKey
} from '@kunlun/engine';
import { LifeCycleTypes } from '@kunlun/event';
import { Expression, ExpressionKeyword, ExpressionRunParam } from '@kunlun/expression';
import { isEmptyValue, ModelFieldType, ViewType } from '@kunlun/meta';
import { Condition, ObjectValue } from '@kunlun/request';
import { IQueryPageOption } from '@kunlun/service';
import { SPI } from '@kunlun/spi';
import { SelectMode, ValidateTrigger } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../basic';
import { isValidatorSuccess, ValidatorInfo } from '../../typing';
import { FormM2MFieldSelectWidget } from '../form';
import DefaultTransfer from './DefaultTransfer.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: [ModelFieldType.ManyToMany, ModelFieldType.OneToMany],
    widget: 'Transfer'
  })
)
export class FormTransferFieldWidget extends FormM2MFieldSelectWidget {
  @Widget.Reactive()
  protected get selectMode(): SelectMode {
    return SelectMode.multiple;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTransfer);
    return this;
  }

  @Widget.Reactive()
  protected get needInitOptions() {
    return true;
  }

  @Widget.Reactive()
  protected get enableSearch() {
    return this.getDsl().enableSearch;
  }

  @Widget.Reactive()
  protected get leftDisplayType() {
    return this.getDsl().leftDisplayType;
  }

  @Widget.Reactive()
  protected get rightDisplayType() {
    return this.getDsl().rightDisplayType;
  }

  @Widget.Reactive()
  protected get leftFields() {
    return this.getDsl().leftFields;
  }

  @Widget.Reactive()
  protected get rightFields() {
    return this.getDsl().rightFields;
  }

  @Widget.Reactive()
  protected get optionFields() {
    return this.getDsl().optionFields;
  }

  @Widget.Reactive()
  protected get sortable(): boolean {
    return this.getDsl().sortable;
  }

  @Widget.Reactive()
  protected get optionLabel() {
    const { optionLabel } = this.getDsl();
    const metaModelLabel = this.referencesModel?.label;
    if (isEmptyValue(optionLabel) && isEmptyValue(metaModelLabel)) {
      let labelFields = this.referencesModel?.labelFields || [];
      if (!labelFields.length) {
        labelFields = ['name'];
      }
      return labelFields.map((v) => `${ExpressionKeyword.activeRecord}.${v}`).join(' || ');
    }
    return optionLabel || metaModelLabel;
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

  @Widget.Method()
  public change(value: string[] = []) {
    const list = this.originOptions as ActiveRecord[];
    const submitData = value
      .map((item) => {
        return list?.find((d) => d.id === item);
      })
      .filter((a) => !!a) as ActiveRecord[];
    this.notify(LifeCycleTypes.ON_FIELD_CHANGE);
    this.updateValue(submitData);
    if (this.validateTrigger.includes(ValidateTrigger.CHANGE)) {
      this.executeValidator().then((info) => {
        if (isValidatorSuccess(info)) {
          this.afterChange();
        }
      });
    } else {
      this.afterChange();
    }
  }

  public async validator(): Promise<ValidatorInfo> {
    const res = await super.validator();
    if (!isValidatorSuccess(res)) {
      return res;
    }
    const { selectedValues } = this;
    let length = selectedValues?.length;
    if (!length && this.required && !this.invisible) {
      return this.validatorError(`${translateValueByKey('必填')}`);
    }
    if (!length) {
      length = 0;
    }
    if (!isNil(this.maxNumber) && length > this.maxNumber) {
      return this.validatorError(`${translateValueByKey('最多选择')}${this.maxNumber}${translateValueByKey('个')}`);
    }
    if (!isNil(this.minNumber) && length < this.minNumber) {
      return this.validatorError(`${translateValueByKey('最少选择')}${this.minNumber}${translateValueByKey('个')}`);
    }
    return this.validatorSuccess();
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

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value } = this;
    if (isM2MField(field)) {
      return SubmitHandler.M2M(field, itemName, submitValue, value);
    } else if (isO2MField(field)) {
      return SubmitHandler.O2M(field, itemName, submitValue, value);
    }
  }

  protected async queryPage<T = Record<string, unknown>>(
    option: IQueryPageOption,
    variables?: ObjectValue,
    context: ObjectValue = {}
  ): Promise<QueryPageResult<T>> {
    if (!isEmptyValue(option.queryData)) {
      const condition = new Condition((option?.condition as Condition)?.toString());
      condition.setConditionBodyData(option.queryData as Record<string, unknown>);
      option.condition = condition;
    }
    return QueryService.queryPage(this.referencesModel!, {
      currentPage: option.currentPage!,
      pageSize: option.pageSize!,
      condition: option.condition,
      requestFields: RequestHelper.convertRequestFields(this.referencesModel!.modelFields),
      variables,
      context
    });
  }

  protected generatorFullOptions(content) {
    const options: ActiveRecord[] = content.map((option) => {
      const title = this.executeExpressionByItem(option, this.optionLabel);
      return { title, ...option };
    });
    return options;
  }

  protected originOptions = [];

  protected insertOptions(options, back = false) {
    if (!options?.length) {
      return;
    }
    const optionKeys = (this.options ?? []).map((o) => o.id);
    const finalOptions = [...(this.options ?? [])];
    options.forEach((c) => {
      if (!optionKeys.includes(c.id)) {
        finalOptions.push(c);
      }
    });
    this.options = this.generatorFullOptions(finalOptions);
    if (!back) {
      this.originOptions = options;
    }
  }

  protected backfillSelectedValues() {
    this.insertOptions(this.value, true);
  }

  @Widget.Reactive()
  protected get leftColumns() {
    const fields = this.referencesModel?.modelFields;
    if (!fields || !this.leftFields?.length) {
      return undefined;
    }
    return this.leftFields.split(',').map((field) => {
      const model = fields?.find((f) => f.name === field);
      return { dataIndex: field, title: model?.label ?? field };
    });
  }

  @Widget.Reactive()
  protected get rightColumns() {
    const fields = this.referencesModel?.modelFields;
    if (!fields || !this.rightFields?.length) {
      return undefined;
    }
    return this.rightFields.split(',').map((field) => {
      const model = fields?.find((f) => f.name === field);
      return { dataIndex: field, title: model?.label ?? field };
    });
  }

  protected async mountedProcess(): Promise<void> {
    const pageSize = 100;
    const firstPage = await this.queryPage({
      currentPage: 1,
      pageSize,
      condition: this.domain
    });
    const { totalPages, content } = firstPage;
    if (totalPages <= 1) {
      this.insertOptions(content);
      this.backfillSelectedValues();
      return;
    }
    const results: Promise<ActiveRecord[]>[] = [];
    for (let i = 2; i <= totalPages; i++) {
      results.push(
        this.queryPage<ActiveRecord>({
          currentPage: i,
          pageSize,
          condition: this.domain
        }).then((res) => res.content)
      );
    }
    await Promise.all(results).then((res) => {
      res.forEach((v) => content.push(...v));
      this.insertOptions(content);
      this.backfillSelectedValues();
    });
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    // do noting.
  }
}
