import { isNil } from 'lodash-es';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import {
  isEnumerationField,
  isRelation2MField,
  isRelation2OField,
  isRelationField,
  RuntimeM2OField,
  RuntimeModelField,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { deepClone, Entity, IModelField, isEmptyValue, ModelFieldType, SYSTEM_MODULE } from '@oinone/kunlun-meta';
import { autoFillByLabel, autoFillByLabelFields } from '@oinone/kunlun-vue-admin-layout';
import { TableEditorMode } from '@oinone/kunlun-vue-ui';
import { ListPaginationStyle } from '@oinone/kunlun-vue-ui-common';
import { BaseElementWidget, FormFieldWidget } from '../../basic';
import QuickFill from './QuickFill.vue';
import { ValidatorStatus } from '../../typing';
import { TableWidget } from '../table/TableWidget';
import { DslDefinition } from '@oinone/kunlun-dsl';
import { buildSingleItemParam, http } from '@oinone/kunlun-service';
import { fullAddressField } from './fulladdress-field';

type MayBeEmptyString = string | null | undefined;

interface Failure {
  rowNumber: number;
  detailList: {
    field: string;
    code: string;
    msg: string;
  }[];
}

interface QuickFillResponse {
  valuesStr: string;
  failures: Failure[];
}

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

  public tableWidget: TableWidget | undefined;

  @Widget.Provide()
  @Widget.Reactive()
  protected get gotoO2MCreateRow() {
    return false;
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected get gotoO2MQuickFilling() {
    return false;
  }

  protected get addressFieldIndex() {
    return this.modelFields.findIndex((f) => (f as RuntimeM2OField).references === 'resource.ResourceAddress');
  }

  @Widget.Reactive()
  public get editableModelFields() {
    const fields = this.modelFields.filter((f) => !!f.template?.independentlyEditable);

    if (this.addressFieldIndex > -1) {
      const newFields = [...fields];
      newFields.splice(this.addressFieldIndex, 1, ...fullAddressField);
      return newFields;
    }

    return fields;
  }

  @Widget.Reactive()
  public showModal = false;

  @Widget.Reactive()
  public step = 0;

  @Widget.Method()
  public onStepChange(step: number) {
    this.step = step;
  }

  @Widget.Method()
  public onToggleModal(show: boolean) {
    this.showModal = show;

    if (!show) {
      this.step = 0;
      this.tableWidget?.dispose();
      this.tableWidget = undefined;
    }
  }

  /**
   * 确认提交,校验excel数据
   */
  @Widget.Method()
  public async onSure(cells: MayBeEmptyString[][]) {
    const valueStr = [] as Record<string, MayBeEmptyString>[];

    /**
     * 将excel数据转换成提交的数据格式
     * [['值1', '值2'], ['值1', '值2']] -> [{name: '值1', code: '值2'}, {name: '值1', code: '值2'}]
     *
     */
    cells.forEach((row) => {
      const rowValue = {} as Record<string, MayBeEmptyString>;
      // 国家、省、市、区、街道需合并
      const addressStr = [] as { [key: string]: MayBeEmptyString }[];

      row.forEach((cell, index) => {
        const { name } = this.editableModelFields[index]!;
        if (fullAddressField.some((f) => f.name === name)) {
          addressStr.push({
            field: name,
            value: cell
          });
        } else {
          rowValue[name] = cell;
        }
      });

      if (this.addressFieldIndex > -1) {
        rowValue[this.modelFields[this.addressFieldIndex].name] = JSON.stringify(addressStr);
      }

      valueStr.push(rowValue);
    });

    /**
     *  valuesStr -> 可回填的数据
     *  failures -> 错误信息
     */
    const { valuesStr, failures } = await this.validateExcelValue(JSON.stringify(valueStr));

    let data = valuesStr ? JSON.parse(valuesStr) : [];

    /**
     * 如果存在错误，则展示表格，将后端返回数据回填到表格
     */
    if (failures.length) {
      this.step = 1;
      this.createTableWidget(data);

      setTimeout(() => {
        this.validateTableField(failures);
      });
    } else {
      this.showModal = false;
      this.updateO2MTableValue(data);
    }
  }

  /**
   * 继续提交
   */
  @Widget.Method()
  public onSubmit() {
    this.updateO2MTableValue(this.tableWidget?.getData());
    this.onToggleModal(false);
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
      if (field.multi && Array.isArray(value)) {
        return value.map((val) => field.options.find((opt) => opt.name === val)?.displayName || val).join(',');
      }
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
   * 触发表格字段的校验
   */
  public validateTableField(failures: Failure[]) {
    // 获取表格字段
    const widgets = this.tableWidget?.getColumnWidgets(true).filter((v) => v.getChildrenInstance().length) || [];
    failures.forEach(({ rowNumber, detailList }) => {
      detailList.forEach((detail) => {
        let formFieldWidget: FormFieldWidget | undefined;

        // 找到表格字段
        const index = widgets.findIndex((w) => w.itemData === detail.field);

        if (index > -1) {
          // 获取对应的表单字段
          formFieldWidget = widgets[index].getChildrenInstance()[rowNumber] as FormFieldWidget;
        }

        if (formFieldWidget) {
          formFieldWidget.validation = {
            message: detail.msg,
            status: ValidatorStatus.Error,
            path: formFieldWidget.dataPath
          };
        }
      });
    });
  }

  /**
   * 修改o2m表格的值
   */
  public updateO2MTableValue(data) {
    this.reloadDataSource(data);

    const parent = this.getParentWidget() as TableWidget;

    parent.updateSubviewFieldWidget(
      {
        data
      } as any,
      {}
    );
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

  /**
   * 调接口校验excel数据
   */
  public async validateExcelValue(valuesStr: string) {
    const quickFillFields = [
      { name: 'model', ttype: ModelFieldType.String },
      { name: 'valuesStr', ttype: ModelFieldType.String },
      {
        name: 'fieldHeaders',
        ttype: ModelFieldType.OneToMany,
        modelFields: [
          {
            name: 'field',
            ttype: ModelFieldType.String
          },
          {
            name: 'relationSelectFields',
            ttype: ModelFieldType.String,
            multi: true
          }
        ]
      }
    ] as IModelField[];

    const fieldHeaders = this.modelFields
      .filter((f) => !!f.template?.independentlyEditable)
      .map((field) => {
        if (isRelationField(field)) {
          return {
            field: field.name,
            relationSelectFields: field.template?.searchFields?.split?.(',') || ['name']
          };
        }

        return { field: field.name };
      });

    const gqlStr = await buildSingleItemParam(quickFillFields, {
      model: this.model.model,
      fieldHeaders,
      valuesStr
    });

    const body = `{
      quickFillingQuery {
        loadData(
          quickFilling: ${gqlStr}
        ) {
          valuesStr
          failures {
            rowNumber
            detailList {
              field
              code
              msg
            }
          }
        }
      }
    }`;

    const rst = await http.query(SYSTEM_MODULE.BASE, body);

    return rst.data.quickFillingQuery.loadData as unknown as QuickFillResponse;
  }

  /**
   * 创建表格
   */
  public createTableWidget(data) {
    if (this.tableWidget) {
      this.tableWidget.dispose();
      this.tableWidget = undefined;
    }

    const parentWidget = this.getParentWidget() as TableWidget;

    const template = deepClone((parentWidget as any).template) as DslDefinition;
    template.editorMode = TableEditorMode.table;
    template.paginationStyle = ListPaginationStyle.HIDDEN;

    const fields = this.modelFields.filter((f) => !!f.template?.independentlyEditable);
    const map = new Map(fields.map((v) => [v.name, true]));
    template.widgets = template.widgets.filter((w) => map.has(w.name));

    this.tableWidget = this.createWidget(TableWidget, 'table', {
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      dataSource: data,
      activeRecords: data,
      template: template,
      inline: true
    });
  }
}
