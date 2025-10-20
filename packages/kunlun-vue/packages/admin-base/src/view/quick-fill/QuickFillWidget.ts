import { DslDefinition } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  isEnumerationField,
  isM2OField,
  isRelation2MField,
  isRelation2OField,
  isRelationField,
  RuntimeM2OField,
  RuntimeModelField,
  RuntimeRelationField,
  StaticMetadata,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { deepClone, Entity, IModelField, isEmptyValue, ModelFieldType, SYSTEM_MODULE } from '@oinone/kunlun-meta';
import { buildSingleItemParam, http } from '@oinone/kunlun-service';
import { Optional, StandardString } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { autoFillByLabel, autoFillByLabelFields } from '@oinone/kunlun-vue-admin-layout';
import { TableEditorMode } from '@oinone/kunlun-vue-ui';
import { ListPaginationStyle } from '@oinone/kunlun-vue-ui-common';
import { isTableViewState, OioTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { BaseElementWidget, BaseFieldWidget, FormFieldWidget } from '../../basic';
import { ResourceAddress, ValidatorStatus } from '../../typing';
import { TableWidget } from '../table/TableWidget';
import QuickFill from './QuickFill.vue';
import { QuickFillType } from './type';

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

const fullAddressField = StaticMetadata.ResourceAddress.modelFields.filter((v) =>
  ['countryName', 'provinceName', 'cityName', 'districtName', 'streetName'].includes(v.data)
);

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
  protected get showAddBtn() {
    return false;
  }

  @Widget.Provide()
  @Widget.Reactive()
  protected get showQuickFill() {
    return false;
  }

  @Widget.Reactive()
  protected type: QuickFillType = QuickFillType.create;

  @Widget.Method()
  public onTypeChange(type: QuickFillType) {
    this.type = type;
  }

  @Widget.Reactive()
  public get editableModelFields() {
    const fields: RuntimeModelField[] = [];
    for (const field of this.viewState?.fields || []) {
      const fieldWidget = Widget.select<BaseFieldWidget>(field);
      if (fieldWidget && !fieldWidget.invisible) {
        const f = fieldWidget.field;
        if (isM2OField(f) && f.references === StaticMetadata.ResourceAddressModel) {
          fields.push(
            ...fullAddressField.map((v) => {
              const dd = `${f.data}#${v.data}`;
              return {
                ...v,
                data: dd,
                name: dd,
                label: `${f.label || f.displayName} - ${translateValueByKey(v.label || v.displayName)}`
              };
            })
          );
        } else {
          fields.push(fieldWidget.field);
        }
      }
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
  public async onSure(rows: StandardString[][]) {
    const valueStr = [] as Record<string, StandardString>[];

    /**
     * 将excel数据转换成提交的数据格式
     * [['值1', '值2'], ['值1', '值2']] -> [{name: '值1', code: '值2'}, {name: '值1', code: '值2'}]
     *
     */
    rows.forEach((row, rowIndex) => {
      const rowValue = {} as Record<string, StandardString>;
      // 国家、省、市、区、街道需合并
      const address: Record<string, ResourceAddress> = {};

      row.forEach((cell, columnIndex) => {
        if (!cell) {
          return;
        }
        const { name } = this.editableModelFields[columnIndex]!;
        if (fullAddressField.some((f) => name.endsWith(`#${f.name}`))) {
          const [name1, name2] = name.split('#');
          let target = address[name1];
          if (!target) {
            target = {};
            address[name1] = target;
          }
          target[name2] = cell;
        } else {
          rowValue[name] = cell;
        }
      });

      Object.keys(address).forEach((key) => {
        rowValue[key] = JSON.stringify(address[key]);
      });

      if (Object.keys(valueStr).length > 0) {
        valueStr.push(rowValue);
      }
    });

    /**
     *  valuesStr -> 可回填的数据
     *  failures -> 错误信息
     */
    const { valuesStr, failures } = await this.validateExcelValue(JSON.stringify(valueStr));

    const data = valuesStr ? JSON.parse(valuesStr) : [];

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
      const rowNum = rowIndex + 1;
      this.editableModelFields.forEach((field, colIndex) => {
        const fieldValue = rowData[field.name];
        if (!isNil(fieldValue)) {
          const cellKey = `${rowNum}-${colIndex + 1}`;
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
  public updateO2MTableValue(data: ActiveRecord[] | undefined) {
    if (!data) {
      return;
    }
    const tableWidget = Optional.ofNullable(this.viewState)
      .filter<OioTableViewState>((v) => isTableViewState(v))
      .map((v) => v.table)
      .map((v) => Widget.select<TableWidget>(v))
      .orElse(undefined);
    if (!tableWidget) {
      return;
    }
    if (this.type === QuickFillType.update) {
      for (let i = 0; i < data.length; i++) {
        const originRow = this.dataSource?.[i] || {};
        const targetRow = data[i];
        targetRow.__draftId = originRow.__draftId;
        targetRow._X_ROW_KEY = originRow._X_ROW_KEY as string;
      }
      this.reloadDataSource(data);
      tableWidget.updateSubviewFieldWidget({} as any, data);
    } else {
      tableWidget.createSubviewFieldWidget({} as any, data);
    }
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
    const fieldHeaders: { field: string; relationSelectFields?: string[] }[] = [];
    for (const editableModelField of this.editableModelFields) {
      const { data } = editableModelField;
      if (isRelationField(editableModelField)) {
        fieldHeaders.push({
          field: data,
          relationSelectFields: editableModelField.referencesModel.labelFields || ['id']
        });
      } else if (fullAddressField.some((f) => data.endsWith(`#${f.data}`))) {
        const [name] = data.split('#');
        if (!fieldHeaders.some((v) => v.field === name)) {
          for (const field of this.viewState?.fields || []) {
            const addressField = Widget.select<BaseFieldWidget>(field)?.field as RuntimeM2OField;
            if (addressField && addressField.data === name) {
              fieldHeaders.push({
                field: addressField.data,
                relationSelectFields: addressField.referencesModel.labelFields || ['id']
              });
            }
          }
        }
      } else {
        fieldHeaders.push({ field: data });
      }
    }

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

    const map = new Map(this.editableModelFields.map((v) => [v.name, true]));
    template.widgets = template.widgets.filter((w) => map.has(w.name));

    this.tableWidget = this.createWidget(TableWidget, 'table', {
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      dataSource: data,
      activeRecords: data,
      template,
      inline: true
    });
  }
}
