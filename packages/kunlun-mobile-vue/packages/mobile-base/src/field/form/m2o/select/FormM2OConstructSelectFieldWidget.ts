import { ModelCache, RuntimeModelField } from '@kunlun/engine';
import { IBaseSelectWidgetConfig, isEmptyKeObject, ModelFieldType, ViewType } from '@kunlun/meta';
import { customQuery } from '@kunlun/service';
import { CastHelper, ObjectUtils } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormM2OSelectFieldWidget } from './FormM2OSelectFieldWidget';

interface FormM2OConstructSelectFieldWidgetConfig extends IBaseSelectWidgetConfig {
  // 绑定可选项数据加载函数, 提前与v3的参数名一致
  load?: string;
  // 响应返回的字段，默认只支持第一层
  responseFields?: string;
  // M2O的值发生更改时需要清理的字段，多个值用逗号分隔
  clearFields?: string;
  // 除了m2o的id外，需要提交的其他字段
  submitFields?: string;
  // form提交到后端的值从返回的哪个字段取
  submitValue?: string;
  // 请求的gql的深度
  maxDepth?: number;
}

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search, ViewType.Detail],
    ttype: ModelFieldType.ManyToOne,
    widget: ['SSConstructSelect']
  })
)
export class FormM2OConstructSelectFieldWidget extends FormM2OSelectFieldWidget {
  @Widget.Method()
  public async change(value) {
    const widgetConfig = this.getDsl() as FormM2OConstructSelectFieldWidgetConfig;
    if (value == null) {
      super.change(null as any);
      this.selfClearFieldsCallback(widgetConfig, {});
      return;
    }
    if (JSON.stringify(value) === '{}') {
      super.change({});
      this.selfClearFieldsCallback(widgetConfig, {});
      return;
    }
    if (isEmptyKeObject(value) && value.value == null) {
      super.change(null as any);
      this.selfClearFieldsCallback(widgetConfig, {});
      return;
    }
    let selectedValue = this.dataList.find((d) => d[this.relationFieldKey] === value.value)! || value;
    if (widgetConfig && widgetConfig.submitValue) {
      selectedValue = widgetConfig.submitValue.split(',').reduce((t, n) => ({ ...t, [n]: selectedValue[n] }), {});
    }
    super.change(selectedValue);
    this.selectedValue = selectedValue;
    const { model, field } = this;
    if (model && field) {
      const req: Record<string, unknown> = {
        [field.data]: {
          [this.relationFieldKey]: value.value
        }
      };
      if (widgetConfig && widgetConfig.submitFields) {
        const submitFields = widgetConfig.submitFields || '';
        submitFields.split(',').forEach((fieldName) => {
          if (this.formData[fieldName] != null) {
            req[fieldName] = this.formData[fieldName];
          }
        });
      }
      let fields: RuntimeModelField[] | undefined;
      if (widgetConfig && widgetConfig.responseFields) {
        const responseFields: string[] = widgetConfig.responseFields.split(',');
        responseFields.push(field.data);
        if (!model.modelFields || !model.modelFields.length) {
          const metaModel = await ModelCache.get(model.model);
          model.modelFields = metaModel?.modelFields || [];
        }
        fields = model.modelFields.filter((a) => responseFields.includes(a.data));
      }

      const { maxDepth = 1, load = 'constructMirror' } = widgetConfig;
      const dataSource: Record<string, unknown> = await customQuery(
        model.model,
        load,
        req,
        CastHelper.cast(fields),
        undefined,
        {
          maxDepth
        }
      );
      const _selectedValue = this.dataList.find((d) => d[this.relationFieldKey] === value.value)! || value;
      this.m2oChange(_selectedValue);
      this.selfClearFieldsCallback(widgetConfig, dataSource);
    }
  }

  protected selfClearFieldsCallback(
    widgetConfig: FormM2OConstructSelectFieldWidgetConfig,
    dataSource: Record<string, unknown>
  ) {
    const clearFieldsDict: Record<string, unknown> = {};
    if (widgetConfig && widgetConfig.clearFields) {
      widgetConfig.clearFields.split(',').forEach((name) => {
        clearFieldsDict[name] = null;
      });
    }
    // FIXME 先把值清空，用返回的formData
    ObjectUtils.shallowMerge(this.formData, clearFieldsDict);
    ObjectUtils.shallowMerge(this.formData, dataSource);
  }
}
