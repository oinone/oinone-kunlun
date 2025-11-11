import { DslDefinition, DslDefinitionHelper, DslDefinitionType, FieldDslDefinition } from '@oinone/kunlun-dsl';
import {
  ActiveRecord,
  getRealTtype,
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
import {
  deepClone,
  Entity,
  IModelField,
  isEmptyValue,
  ModelFieldType,
  SYSTEM_MODULE,
  ViewType
} from '@oinone/kunlun-meta';
import { buildSingleItemParam, http } from '@oinone/kunlun-service';
import { Optional, StandardString } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { autoFillByLabel, autoFillByLabelFields } from '@oinone/kunlun-vue-admin-layout';
import { TableEditorMode } from '@oinone/kunlun-vue-ui';
import { ListPaginationStyle } from '@oinone/kunlun-vue-ui-common';
import { DslDefinitionWidget, isTableViewState, OioTableViewState, Widget } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { BaseElementWidget, BaseFieldWidget, BaseTableFieldWidget, FormFieldWidget } from '../../basic';
import { createRuntimeContextForWidget } from '../../tags';
import {
  ResourceAddress,
  ResourceCity,
  ResourceCountry,
  ResourceDistrict,
  ResourceProvince,
  ResourceStreet,
  ValidatorStatus
} from '../../typing';
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
  values: string;
  failures: Failure[];
}

const fullAddressField = StaticMetadata.ResourceAddress.modelFields.filter((v) =>
  ['originCountry', 'originProvince', 'originCity', 'originDistrict', 'originStreet'].includes(v.data)
);

const fullAddressFieldMapping: [string, string][] = [
  ['originCountry', 'countryName'],
  ['originProvince', 'provinceName'],
  ['originCity', 'cityName'],
  ['originDistrict', 'districtName'],
  ['originStreet', 'streetName']
];

// ['originCountry', 'originProvince', 'originCity', 'originDistrict', 'originStreet'].includes(v.data)

// const errorAddressField = StaticMetadata.ResourceAddress.modelFields
//   .filter((v) => ['originCountry', 'originProvince', 'originCity', 'originDistrict', 'originStreet'].includes(v.data))
//   .map((v) => {
//     const originData = v.data.substring(6);
//     const data = `${originData.charAt(0).toLowerCase()}Name`;
//     return {
//       ...v,
//       data,
//       name: data
//     };
//   });

const quickFillFields = [
  { name: 'model', ttype: ModelFieldType.String },
  { name: 'values', ttype: ModelFieldType.String },
  {
    name: 'fields',
    ttype: ModelFieldType.OneToMany,
    modelFields: [
      {
        name: 'field',
        ttype: ModelFieldType.String
      },
      {
        name: 'labelFields',
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
  protected viewState: OioTableViewState | undefined;

  protected tableWidget: TableWidget | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(QuickFill);
    return this;
  }

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
      const fieldWidget = Widget.select<BaseTableFieldWidget>(field);
      if (fieldWidget && !fieldWidget.invisible) {
        const f = { ...fieldWidget.field };
        const ttype = getRealTtype(f);
        if (f.isVirtual || ttype === ModelFieldType.Map) {
          continue;
        }
        const readonly = !fieldWidget.editable;
        f.readonly = readonly;
        if (isM2OField(f) && f.references === StaticMetadata.ResourceAddressModel) {
          fields.push(
            ...fullAddressField.map((v) => {
              const dd = `${f.data}#${v.data}`;
              return {
                ...v,
                data: dd,
                name: dd,
                label: `${f.label || f.displayName} - ${translateValueByKey(v.label || v.displayName)}`,
                readonly
              };
            })
          );
        } else {
          fields.push(f);
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
  public async onSure(headers: { label: string; value: string }[], rows: StandardString[][]) {
    const values = [] as Record<string, StandardString>[];

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
        const { value: name } = headers[columnIndex]!;
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

      if (Object.keys(rowValue).length > 0) {
        values.push(rowValue);
      }
    });

    /**
     *  values -> 可回填的数据
     *  failures -> 错误信息
     */
    const { values: resultValues, failures } = await this.validateExcelValue(JSON.stringify(values));

    const data = resultValues ? JSON.parse(resultValues) : [];

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
    const rows = this.tableWidget?.getData() || [];
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        const [name1, name2] = key.split('#');
        if (name2) {
          let value = row[name1] as object;
          if (!value) {
            value = {};
            row[name1] = value;
          }
          value[name2] = row[key];
          if (name2 === 'originCountry') {
            (value as ResourceAddress).countryCode = (row[key] as ResourceCountry).code;
            (value as ResourceAddress).countryName = (row[key] as ResourceCountry).name;
          } else if (name2 === 'originProvince') {
            (value as ResourceAddress).provinceCode = (row[key] as ResourceProvince).code;
            (value as ResourceAddress).provinceName = (row[key] as ResourceProvince).name;
          } else if (name2 === 'originCity') {
            (value as ResourceAddress).cityCode = (row[key] as ResourceCity).code;
            (value as ResourceAddress).cityName = (row[key] as ResourceCity).name;
          } else if (name2 === 'originDistrict') {
            (value as ResourceAddress).districtCode = (row[key] as ResourceDistrict).code;
            (value as ResourceAddress).districtName = (row[key] as ResourceDistrict).name;
          } else if (name2 === 'originStreet') {
            (value as ResourceAddress).streetCode = (row[key] as ResourceStreet).code;
            (value as ResourceAddress).streetName = (row[key] as ResourceStreet).name;
          }
          delete row[key];
        }
      }
    }
    this.updateO2MTableValue(rows);
    this.onToggleModal(false);
  }

  protected get fillValueFieldMapping(): [string, string][] {
    return fullAddressFieldMapping;
  }

  /**
   * 将表格数据，填充到excel中
   */
  @Widget.Method()
  public fillValueByDataSource(): { cells?: Record<string, unknown>; rowCount?: number } {
    // 处理空数据情况
    if (!this.dataSource?.length) {
      return {
        rowCount: 0
      };
    }

    // 将表格数据转换为 Excel 单元格格式 {'行-列': '值'}
    const cells: Record<string, any> = {};

    this.dataSource.forEach((rowData, rowIndex) => {
      const rowNum = rowIndex + 1;
      this.editableModelFields.forEach((field, colIndex) => {
        const { name } = field;
        let fieldValue;
        const [name1, name2] = name.split('#');
        if (name2) {
          const mappingField = this.fillValueFieldMapping.find((v) => v[0] === name2)?.[1];
          if (mappingField) {
            fieldValue = (rowData[name1] as ActiveRecord)?.[mappingField];
          } else {
            fieldValue = (rowData[name1] as ActiveRecord)?.[name2];
          }
          if (isNil(fieldValue)) {
            return;
          }
          const cellKey = `${rowNum}-${colIndex + 1}`;
          cells[cellKey] = fieldValue;
          return;
        }
        fieldValue = rowData[name];
        if (isNil(fieldValue)) {
          return;
        }
        const cellKey = `${rowNum}-${colIndex + 1}`;
        cells[cellKey] = this.fillFieldValue(field, fieldValue);
      });
    });

    console.log(cells);

    return { cells, rowCount: this.dataSource.length };
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
    } else if (field.multi && Array.isArray(value)) {
      return value.map((v) => `${v}`).join(',');
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
      const stack = [...detailList];
      while (stack.length) {
        const detail = stack.shift()!;

        let fieldInfo;
        this.viewState?.fields?.some((f) => {
          const fieldWidget = Widget.select<BaseFieldWidget>(f);
          if (fieldWidget?.field.data === detail.field) {
            fieldInfo = fieldWidget.field;
            return true;
          }
          return false;
        });

        if (fieldInfo && isM2OField(fieldInfo) && fieldInfo.references === StaticMetadata.ResourceAddressModel) {
          stack.push(
            ...fullAddressField.map((v) => {
              const dd = `${fieldInfo.data}#${v.data}`;
              return {
                ...detail,
                field: dd
              };
            })
          );
          continue;
        }

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
      }
      // detailList.forEach((detail) => {
      //   let formFieldWidget: FormFieldWidget | undefined;

      //   // 找到表格字段
      //   const index = widgets.findIndex((w) => w.itemData === detail.field);

      //   if (index > -1) {
      //     // 获取对应的表单字段
      //     formFieldWidget = widgets[index].getChildrenInstance()[rowNumber] as FormFieldWidget;
      //   }

      //   if (formFieldWidget) {
      //     formFieldWidget.validation = {
      //       message: detail.msg,
      //       status: ValidatorStatus.Error,
      //       path: formFieldWidget.dataPath
      //     };
      //   }
      // });
    });
  }

  /**
   * 修改o2m表格的值
   */
  public updateO2MTableValue(data: ActiveRecord[]) {
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
  public async validateExcelValue(values: string) {
    const fields: { field: string; labelFields?: string[] }[] = [];
    for (const editableModelField of this.editableModelFields) {
      const { data } = editableModelField;
      if (isRelationField(editableModelField)) {
        if (fullAddressField.some((f) => data.endsWith(`#${f.data}`))) {
          const [name] = data.split('#');
          if (!fields.some((v) => v.field === name)) {
            for (const field of this.viewState?.fields || []) {
              const addressField = Widget.select<BaseFieldWidget>(field)?.field as RuntimeM2OField;
              if (addressField && addressField.data === name) {
                fields.push({
                  field: addressField.data,
                  labelFields: addressField.referencesModel.labelFields
                });
              }
            }
          }
        } else {
          fields.push({
            field: data,
            labelFields: editableModelField.referencesModel.labelFields
          });
        }
      } else {
        fields.push({ field: data });
      }
    }

    const gqlStr = await buildSingleItemParam(quickFillFields, {
      model: this.model.model,
      fields,
      values
    });

    const body = `{
      quickFillingQuery {
        loadData(
          quickFilling: ${gqlStr}
        ) {
          values
          failures {
            rowNumber
            detailList {
              field
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
  protected createTableWidget(data) {
    if (this.tableWidget) {
      this.tableWidget.dispose();
      this.tableWidget = undefined;
    }

    const template = Optional.ofNullable(this.viewState)
      .filter<OioTableViewState>((v) => isTableViewState(v))
      .map((v) => v.table)
      .map((v) => Widget.select<DslDefinitionWidget>(v))
      .map((v) => v.getDsl())
      .map((v) => deepClone(v))
      .orElse(undefined);

    if (!template) {
      console.error('Invalid table template.', this.viewState);
      return;
    }

    template.editorMode = TableEditorMode.table;
    template.paginationStyle = ListPaginationStyle.HIDDEN;

    const map = new Map(this.editableModelFields.map((v) => [v.data, true]));
    const fieldDslList = this.collectionFieldDsl(template);
    template.widgets = fieldDslList.filter((w) => map.has(w.data));

    const runtimeContext = createRuntimeContextForWidget({
      type: ViewType.Table,
      model: this.model.model,
      modelName: this.model.name,
      name: 'quick-fill-error-table',
      dsl: template
    });
    const runtimeContextHandle = runtimeContext.handle;

    this.tableWidget = this.createWidget(TableWidget, 'table', {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      dataSource: data,
      activeRecords: data,
      template: runtimeContext.viewTemplate,
      inline: true
    });
  }

  protected collectionFieldDsl(dsl: DslDefinition, deep = 2): FieldDslDefinition[] {
    if (deep <= 0) {
      return [];
    }
    const { widgets } = dsl;
    const fields: FieldDslDefinition[] = [];
    for (const widget of widgets) {
      if (DslDefinitionHelper.isField(widget)) {
        if (widget.references === StaticMetadata.ResourceAddressModel) {
          let lastField: RuntimeModelField | undefined;
          for (const field of fullAddressField) {
            const dd = `${widget.data}#${field.data}`;
            const extraDsl: FieldDslDefinition = {
              ...field,
              dslNodeType: DslDefinitionType.FIELD,
              ttype: ModelFieldType.ManyToOne,
              data: dd,
              name: dd,
              label: `${widget.label} - ${translateValueByKey(field.label || field.displayName)}`,
              widget: 'Select',
              model: widget.model,
              modelName: widget.modelName,
              field,
              widgets: []
            };
            if (lastField) {
              if (field.data === 'originProvince') {
                extraDsl.domain = `countryCode == '\${activeRecord.${widget.data}#${lastField.data}.code}'`;
              } else if (field.data === 'originCity') {
                extraDsl.domain = `provinceCode == '\${activeRecord.${widget.data}#${lastField.data}.code}'`;
              } else if (field.data === 'originDistrict') {
                extraDsl.domain = `cityCode == '\${activeRecord.${widget.data}#${lastField.data}.code}'`;
              } else if (field.data === 'originStreet') {
                extraDsl.domain = `districtCode == '\${activeRecord.${widget.data}#${lastField.data}.code}'`;
              }
            }
            lastField = field;
            fields.push(extraDsl);
          }
        } else {
          fields.push(widget);
        }
      } else if (DslDefinitionHelper.isSlot(widget)) {
        fields.push(...this.collectionFieldDsl(widget, deep - 1));
      }
    }
    return fields;
  }
}
