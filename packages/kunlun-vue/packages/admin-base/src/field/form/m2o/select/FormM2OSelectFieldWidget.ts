import { ActiveRecord, ModelCache, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { IModel, isEmptyKeObject, isEmptyValue, ModelFieldType, ViewType } from '@kunlun/meta';
import { queryOne } from '@kunlun/service';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { debounce, isNil, isNumber, isString } from 'lodash-es';
import { FormFieldWidget, FormSelectComplexFieldWidget } from '../../../../basic';
import VueComponent from './SelectWidget.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne
  })
)
export class FormM2OSelectFieldWidget extends FormSelectComplexFieldWidget<ActiveRecord, RuntimeM2OField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(VueComponent);
    return this;
  }

  @Widget.Reactive()
  protected currentValueLabel!: string;

  @Widget.Method()
  public async handleSelectedValueLabel(val) {
    this.currentValueLabel = this.handleSelectOption([val], this.referencesModel)[0]?.label as string;
  }

  @Widget.Method()
  public change(value) {
    if (value == null) {
      this.m2oChange(null as any);
      this.handleEmpty();
      return;
    }
    if (JSON.stringify(value) === '{}') {
      this.m2oChange({});
      return;
    }
    if (isEmptyKeObject(value) && value.value == null) {
      this.m2oChange(null as any);
      return;
    }
    const selectedValue = this.dataList.find((d) => d[this.relationFieldKey] === value.value)! || value;
    this.m2oChange(selectedValue);
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    this.fillOptionsForSingle(dataList, insetDefaultValue);
  }

  public m2oChange(value: Record<string, unknown>) {
    super.change(value);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2O(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }

  protected async mounted() {
    await super.mounted();
    if (this.value) {
      this.watchValue();
    }
  }

  @Widget.Provide()
  @Widget.Reactive()
  public get value() {
    if (this.formData) {
      return this.getValue();
    }
    return undefined;
  }

  @Widget.Reactive()
  public get computeQueryOneKey() {
    return this.getDsl().computeQueryOneKey;
  }

  @Widget.Watch('formData', { deep: true })
  public async watchM2OValue() {
    this.delayUpdateM2oValue();
  }

  public delayUpdateM2oValue = debounce(() => {
    this.updateM2oValue();
  });

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

  protected computeQueryOneDefaultKey() {
    return 'id';
  }
}
