import { Widget } from '@kunlun/vue-widget';
import { ModelCache } from '@kunlun/engine';
import { isRelationTtype } from '@kunlun/meta';
import { queryAction } from './service';
import {
  SelectInstance,
  SelectListType,
  SelectWidgetType,
  SelectType,
  SourceDataCollection,
  FormValue
} from './typing';
// eslint-disable-next-line import/no-cycle
import { FormFieldWidget } from '../../../basic';

export abstract class SelectFieldActionWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    return this;
  }

  @Widget.Reactive()
  protected get filterRelation() {
    return this.getDsl().filterRelation ?? false;
  }

  @Widget.Reactive()
  protected get labelEditable() {
    return this.getDsl().labelEditable;
  }

  @Widget.Reactive()
  protected abstract widgetType: SelectWidgetType;

  @Widget.Reactive()
  @Widget.Inject()
  protected currentInstance: SelectInstance | undefined;

  @Widget.Inject()
  protected fieldsCommit: ((field: string) => void) | undefined;

  @Widget.Reactive()
  protected fieldActionOptionsList: SourceDataCollection = {
    [SelectWidgetType.FIELD]: [],
    [SelectWidgetType.ACTION]: []
  };

  @Widget.Reactive()
  protected get valueFlattend(): SelectListType {
    return this.flattenList(this.value as SelectListType);
  }

  @Widget.Reactive()
  protected get fieldActionOptionsListFlattend(): SourceDataCollection {
    return {
      [SelectWidgetType.FIELD]: this.flattenList(this.fieldActionOptionsList[SelectWidgetType.FIELD]),
      [SelectWidgetType.ACTION]: this.flattenList(this.fieldActionOptionsList[SelectWidgetType.ACTION])
    };
  }

  @Widget.Reactive()
  protected get unSelectedOptionList(): SourceDataCollection {
    let selectFieldList = [...this.fieldActionOptionsList[SelectWidgetType.FIELD]];
    let selectActionList = [...this.fieldActionOptionsList[SelectWidgetType.ACTION]];
    selectFieldList = this.filterListByValue(selectFieldList, this.value as FormValue);
    selectActionList = this.filterListByValue(selectActionList, this.value as FormValue);
    return {
      [SelectWidgetType.FIELD]: selectFieldList,
      [SelectWidgetType.ACTION]: selectActionList
    };
  }

  @Widget.Reactive()
  protected get selectedOptionList(): SourceDataCollection {
    let selectFieldList = [...this.fieldActionOptionsList[SelectWidgetType.FIELD]];
    let selectActionList = [...this.fieldActionOptionsList[SelectWidgetType.ACTION]];
    selectFieldList = this.getListByValue(this.value as FormValue, SelectWidgetType.FIELD);
    selectActionList = this.getListByValue(this.value as FormValue, SelectWidgetType.ACTION);
    return {
      [SelectWidgetType.FIELD]: selectFieldList,
      [SelectWidgetType.ACTION]: selectActionList
    };
  }

  @Widget.Method()
  protected onFormChange(payload, deep = false) {
    const emitValue = this.mergeChild(payload).map((value) => {
      if (!value || !value.name) {
        return value;
      }
      if (deep) {
        const res = {
          ...value,
          type: value.type ?? this.widgetType,
          children: value.children?.map((child) => this.deepCopy(child)) ?? null
        };
        delete res.modelDefinition;
        return res;
      }
      return {
        name: value.name,
        label: value.label,
        model: value.model,
        type: value.type ?? this.widgetType,
        sort: value.sort,
        properties: value.properties ?? null,
        children: value.children?.map((child) => this.slimDeepCopy(child)) ?? null
      };
    });
    this.change(emitValue);
  }

  @Widget.Method()
  protected async queryReferences(model: string, type = this.widgetType) {
    if (type === SelectWidgetType.FIELD) {
      return this.queryFieldsByModel(model);
    }
    if (type === SelectWidgetType.ACTION) {
      return this.queryActionsByModel(model);
    }
  }

  @Widget.Method()
  protected updateExsitValue(field) {
    const tempList = (this.value as FormValue).map((o) => this.deepCopy(o));
    this.onFormChange(this.updateUniqueValue(tempList as FormValue, field), true);
  }

  private updateUniqueValue(list: FormValue, field: SelectType, parentName?: string): FormValue {
    return list.map((i) => {
      if (i.name === field.name && i.model === field.model && (parentName ?? null) === (field.parentName ?? null)) {
        return field;
      }
      if (i.children?.length) {
        i.children = this.updateUniqueValue(i.children, field, i.name);
      }
      return i;
    }) as FormValue;
  }

  private mergeChild(list): SelectListType {
    const resArr: SelectListType = [];
    list.forEach((l) => {
      if (!l || !l?.name) {
        resArr.push(l);
        return;
      }
      const index = resArr.findIndex((i) => {
        return i.name === l.name;
      });
      if (index > -1) {
        resArr.splice(index, 1, { ...resArr[index], children: resArr[index].children?.concat(l.children) });
      } else {
        resArr.push(l);
      }
    });
    return resArr;
  }

  private deepCopy(item): SelectType {
    if (!item) {
      return item;
    }
    const res = {
      ...item,
      type: item.type ?? this.widgetType,
      children: item.children ? item.children.map((c) => this.deepCopy(c)) : null
    } as SelectType;
    delete res.modelDefinition;
    return res;
  }

  private slimDeepCopy(item): SelectType {
    if (!item) {
      return item;
    }
    return {
      name: item.name,
      model: item.model,
      label: item.label,
      sort: item.sort,
      type: item.type ?? this.widgetType,
      properties: item.properties ?? null,
      children: item.children ? item.children.map((c) => this.slimDeepCopy(c)) : null
    } as SelectType;
  }

  private flattenList(
    list: SelectListType,
    parentModel: string | undefined = undefined,
    parentName: string | undefined = undefined
  ) {
    if (!list?.length) {
      return [];
    }
    const result: SelectListType = [];
    list
      .filter((v) => {
        return v !== null && v !== undefined;
      })
      .forEach((l) => {
        if (l.children?.length) {
          result.push(...this.flattenList(l.children, l.model, l.name));
        }
        result.push({ ...l, parentModel, parentName, children: [] });
      });
    return result;
  }

  private getListByValue(value: FormValue, type: SelectWidgetType): SelectListType {
    if (!this.fieldActionOptionsListFlattend[type]?.length) {
      return [];
    }
    if (!value?.length) {
      return [];
    }
    return value
      .filter((v) => {
        return v !== null && v !== undefined;
      })
      .map((v) => {
        const val = this.fieldActionOptionsListFlattend[type].find((option) => {
          return option.name === v.name && option.model === v.model && type === v.type;
        });
        const children = v.children?.length ? this.getListByValue(v.children, type) : [];
        if (!val) {
          return { ...v, displayName: v.label, deleted: true, isLeaf: !children.length, children };
        }
        return { ...val, children };
      });
  }

  private filterListByValue(list, value) {
    if (!list?.length) {
      return null;
    }
    if (!value?.length) {
      return list;
    }
    return list
      .filter((l) => {
        const hasChildren = l.children?.length;
        const finded = value.findIndex((val) => {
          return val.name === l.name && val.model === l.model;
        });
        if (!hasChildren) {
          return finded < 0;
        }
        if (finded > -1) {
          if (value[finded].children?.length === l.children?.length) {
            return false;
          }
        }
        return true;
      })
      .map((l) => {
        const finded = value.findIndex((val) => {
          return val.name === l.name && val.model === l.model;
        });
        const hasChildren = l.children?.length && value[finded]?.children?.length;
        return {
          ...l,
          children: hasChildren ? this.filterListByValue(l.children, value[finded].children) : l.children
        };
      });
  }

  private queryReferencesWithIdle(modelList: SelectType[], type: SelectWidgetType) {
    let index = 0;
    const queryTasks = () => {
      this.setReferencesChildren(modelList[index], type);
      index++;
      if (index < modelList.length) {
        requestIdleCallback(queryTasks);
      }
    };
    requestIdleCallback(queryTasks);
  }

  private async setReferencesChildren(model: SelectType, type: SelectWidgetType) {
    if (!model.references) {
      return;
    }
    const targetIndex = this.fieldActionOptionsList[type].findIndex((option) => option.name === model.name);
    if (!this.fieldActionOptionsList[type][targetIndex]) {
      return;
    }
    if (targetIndex > -1 && this.fieldActionOptionsList[type][targetIndex].children) {
      return;
    }
    if (targetIndex < 0) {
      return;
    }
    const resModel = await this.queryReferences(model.references, type);
    this.fieldActionOptionsList[type][targetIndex].children = resModel?.filter((m) => !m.references);
  }

  private async queryFieldsByModel(model: string) {
    const fields = await ModelCache.get(model);
    return this.withPreHandle((fields?.modelFields ?? []) as SelectListType, SelectWidgetType.FIELD);
  }

  private async queryActionsByModel(model: string) {
    const content = await queryAction(model);
    return this.withPreHandle((content ?? []) as SelectListType, SelectWidgetType.ACTION);
  }

  private withPreHandle(fieldList: SelectListType, type: SelectWidgetType) {
    if (!fieldList?.length) {
      return [];
    }
    const referencesModel: SelectType[] = [];
    let resData: SelectType[] = [...fieldList];
    if (this.filterRelation) {
      resData = resData.filter((field) => {
        return !isRelationTtype(field.ttype);
      });
    }
    resData = resData.map((field) => {
      const isLeaf = !isRelationTtype(field.ttype);
      if (!isLeaf && field.references) {
        referencesModel.push(field);
      }
      return {
        ...field,
        label: field.label || field.displayName,
        isLeaf
      };
    });
    if (referencesModel.length) {
      this.queryReferencesWithIdle(referencesModel, type);
    }
    return resData;
  }

  private async getSelectOptions(): Promise<void> {
    const { model, referenceModel } = this.currentInstance?.element ?? {};
    if (!model) {
      return;
    }
    if (this.widgetType === SelectWidgetType.FIELD_ACTION) {
      if (!this.fieldActionOptionsList[SelectWidgetType.FIELD].length) {
        const fieldList = await this.queryFieldsByModel(referenceModel ?? model);
        this.fieldActionOptionsList[SelectWidgetType.FIELD] = fieldList;
      }
      if (!this.fieldActionOptionsList[SelectWidgetType.ACTION].length) {
        const actionList = await this.queryActionsByModel(referenceModel ?? model);
        this.fieldActionOptionsList[SelectWidgetType.ACTION] = actionList;
      }
      return;
    }
    let selectOptionList: SelectListType = [];
    if (this.widgetType === SelectWidgetType.FIELD) {
      if (!this.fieldActionOptionsList[SelectWidgetType.FIELD].length) {
        selectOptionList = await this.queryFieldsByModel(referenceModel ?? model);
        this.fieldActionOptionsList[SelectWidgetType.FIELD] = selectOptionList;
      }
    }
    if (this.widgetType === SelectWidgetType.ACTION) {
      if (!this.fieldActionOptionsList[SelectWidgetType.ACTION].length) {
        selectOptionList = await this.queryActionsByModel(referenceModel ?? model);
        this.fieldActionOptionsList[SelectWidgetType.ACTION] = selectOptionList;
      }
    }
  }

  private setMetaDataFields(): void {
    if (this.fieldsCommit) {
      this.fieldsCommit(this.itemData);
    }
  }

  protected mounted() {
    super.mounted();
    this.getSelectOptions();
    this.setMetaDataFields();
  }
}
