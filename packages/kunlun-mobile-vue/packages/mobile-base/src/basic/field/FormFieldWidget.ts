import { isRelatedField, RuntimeModelField } from '@oinone/kunlun-engine';
import { ExpressionKeyword } from '@oinone/kunlun-expression';
import { isComplexTtype, isDateTtype, isNumberTtype, ModelFieldType, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, Optional } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { isEmpty, isNaN, isNumber, isString, set } from 'lodash-es';
import { BaseFieldProps, BaseFieldWidget } from '../token';

/**
 * 单字段通用组件
 */
export class FormFieldWidget<
  Value = unknown,
  Field extends RuntimeModelField = RuntimeModelField,
  Props extends BaseFieldProps<Field> = BaseFieldProps<Field>
> extends BaseFieldWidget<Value, Field, Props> {
  // fixme @zbh 20221021 计算逻辑拆分
  protected compute(): Value | null | undefined {
    const compute = this.getCompute(this.formData);
    if (compute == null || compute === '') {
      return this.getValue();
    }
    let computeResult;
    if (typeof compute === 'boolean') {
      computeResult = compute;
    } else {
      computeResult = this.executeExpression<number | Value | null | undefined>(compute, null);
      if (typeof computeResult === 'number') {
        if (isNaN(computeResult)) {
          computeResult = 0;
        }
      }
    }
    const currentValue = this.getValue();
    const isEqual = JSON.stringify(computeResult) === JSON.stringify(currentValue);
    if (typeof computeResult === 'object' && isEqual) {
      // []({}) == []({}) 和 []({}) === []({})结果均为false, 所以会导致表达式无限执行
      return this.getValue();
    }
    if (isRelatedField(this.field)) {
      if (isEqual || computeResult == null) {
        return currentValue;
      }
    }

    const { ttype } = this.field;
    if (
      this.viewMode === ViewMode.Lookup &&
      isComplexTtype(ttype) &&
      compute &&
      (isString(computeResult) || isNumber(computeResult))
    ) {
      // 解决form内配置compute后作为detail页用时候可能产生的bug，工作流的流程追踪的detail页面用的是审批时配置的form页面
      if ([ModelFieldType.OneToMany, ModelFieldType.ManyToMany].includes(ttype) && !Array.isArray(computeResult)) {
        return currentValue;
      }
      if ([ModelFieldType.OneToOne, ModelFieldType.ManyToOne].includes(ttype) && typeof computeResult !== 'object') {
        // 表单页的m2o支持配置表达式为relationFields的字段，然后根据relationFields动态查询变成对象
        // 详情页执行表达式后会得到一个简单类型数据，实际要的是一个复杂类型
        return currentValue;
      }
    }

    this.setValue(computeResult as Value);
    return computeResult;
  }

  protected getCompute(contextData) {
    const { field } = this;
    if (field?.ttype !== ModelFieldType.Related) {
      return field?.compute;
    }
    // 若是多值则需要包装一下, 暂支持两层
    let _compute = ExpressionKeyword.activeRecord.toString();
    if (isRelatedField(field)) {
      const mainField = field.related[0];
      const mainFieldData = contextData && contextData[mainField];
      if (field.multi && field.related.length > 1 && Array.isArray(mainFieldData)) {
        const targetField = field.related[1];
        _compute = `LIST_FIELD_VALUES(${_compute}.${mainField},'','${targetField}')`;
        return _compute;
      }
      for (const levelField of field.related) {
        _compute = `${_compute}.${levelField}`;
      }
      return _compute;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get allowClear() {
    return Optional.ofNullable(this.getDsl().allowClear).orElse(true);
  }

  @Widget.Reactive()
  protected get placeholder(): string | string[] | undefined {
    let { placeholder } = this.getDsl();
    let isExecuteExpression = true;

    if (isEmpty(placeholder)) {
      placeholder = undefined;
      isExecuteExpression = false;
    }

    if (placeholder == null) {
      if (BooleanHelper.toBoolean(this.label) == null) {
        placeholder = this.label;
      } else {
        placeholder = this.field.displayName;
      }
      isExecuteExpression = false;
    }
    if (BooleanHelper.toBoolean(placeholder) != null) {
      placeholder = undefined;
      isExecuteExpression = false;
    }

    if (isExecuteExpression) {
      placeholder = this.executeExpression(placeholder);
    }
    return placeholder || this.field.name || this.field.data;
  }

  @Widget.Reactive()
  protected get emptyStyle() {
    return this.getDsl().emptyStyle;
  }

  protected updateValue(val: Value | null | undefined) {
    const { field } = this;
    if (isRelatedField(field)) {
      this.updateRelatedValue(field.related, val);
    }
    this.setValue(val);
  }

  protected updateRelatedValue(relatedFields: string[], val: Value | null | undefined) {
    relatedFields.length && set(this.formData, relatedFields.join('.'), val);
  }

  @Widget.Reactive()
  public get isLink() {
    return (
      this.field &&
      this.viewType === ViewType.Form &&
      !this.readonly &&
      [
        ModelFieldType.Enum,
        ModelFieldType.MultiEnum,
        ModelFieldType.OneToMany,
        ModelFieldType.OneToOne,
        ModelFieldType.ManyToMany,
        ModelFieldType.ManyToOne,
        ModelFieldType.Date,
        ModelFieldType.DateTime,
        ModelFieldType.Time,
        ModelFieldType.Year
      ].includes(this.field.ttype as ModelFieldType)
    );
  }

  @Widget.Method()
  public clearValue() {
    let empty = undefined as any;
    const { ttype, multi = false } = this.field || {};

    if ([ModelFieldType.OneToMany, ModelFieldType.ManyToMany].includes(ttype) || multi) {
      empty = [];
    } else if (
      isDateTtype(ttype) ||
      [
        ModelFieldType.Boolean,
        ModelFieldType.Enum,
        ModelFieldType.MultiEnum,
        ModelFieldType.OneToOne,
        ModelFieldType.ManyToOne,
        ModelFieldType.Map
      ].includes(ttype)
    ) {
      empty = null;
    } else if (isNumberTtype(ttype)) {
      empty = undefined;
    } else if (isNumberTtype(ttype)) {
      empty = '';
    } else if (ModelFieldType.Map === ttype) {
      empty = {};
    }

    this.setValue(empty as any);
  }
}
