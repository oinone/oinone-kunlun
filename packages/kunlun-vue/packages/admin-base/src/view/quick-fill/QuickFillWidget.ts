import { isNil } from 'lodash-es';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import {
  isEnumerationField,
  isRelation2MField,
  isRelation2OField,
  isRelationField,
  RuntimeModelField,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { Entity, isEmptyValue } from '@oinone/kunlun-meta';
import { autoFillByLabel, autoFillByLabelFields } from '@oinone/kunlun-vue-admin-layout';
import { BaseElementWidget } from '../../basic';
import QuickFill from './QuickFill.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'QuickFill'
  })
)
export class QuickFillWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(QuickFill);
    return this;
  }

  @Widget.Reactive()
  public get editableModelFields() {
    return this.metadataRuntimeContext.model.modelFields.filter((f) => !!f.template?.independentlyEditable);
  }

  @Widget.Reactive()
  public showModal = false;

  @Widget.Method()
  public onToggleModal(show: boolean) {
    this.showModal = show;
  }

  @Widget.Method()
  public onSure() {
    this.showModal = false;
  }

  /**
   * 将表格数据，填充到excel中
   */
  @Widget.Method()
  public fillValueByDataSource() {
    // 处理空数据情况
    if (!this.dataSource?.length) {
      return {};
    }

    // 将表格数据转换为 Excel 单元格格式 {'行-列': '值'}
    const cells: Record<string, any> = {};

    this.dataSource.forEach((rowData, rowIndex) => {
      this.editableModelFields.forEach((field, colIndex) => {
        const fieldValue = rowData[field.name];
        if (!isNil(fieldValue)) {
          const cellKey = `${rowIndex + 1}-${colIndex + 1}`;
          cells[cellKey] = this.fillFieldValue(field, fieldValue);
        }
      });
    });

    return cells;
  }

  public fillFieldValue(field: RuntimeModelField, value) {
    // 枚举字段
    if (isEnumerationField(field)) {
      return field.options.find((opt) => opt.name === value)?.displayName || value;
    }

    // 复杂字段
    if (isRelationField(field)) {
      // m2o、o2o
      if (isRelation2OField(field)) {
        return this.handleRelationFieldLabel(field, value);
      }

      // m2m、o2m
      if (isRelation2MField(field) && Array.isArray(value)) {
        return value.map((v) => this.handleRelationFieldLabel(field, v)).join(',');
      }
    }

    return value;
  }

  /**
   * 获取复杂字段的显示值
   */
  public handleRelationFieldLabel(field: RuntimeRelationField, value) {
    const { optionLabel, separator = ', ' } = (field.template || {}) as Entity;
    const relationFieldKey = field.referencesModel?.pks?.[0] || 'id';
    const realLabel = (optionLabel || field.referencesModel?.label) as string;
    const labelFields = field.referencesModel?.labelFields || [];

    let showValue;
    if (isEmptyValue(realLabel)) {
      showValue = autoFillByLabelFields(relationFieldKey, value, labelFields, separator as string);
    } else {
      showValue = autoFillByLabel(relationFieldKey, value, realLabel);
    }
    return showValue?.label;
  }
}
