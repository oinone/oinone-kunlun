import { IModel, IModelField, ViewType } from '@kunlun/meta';

import { isSimpleField, isComplexField, isManyToOneField } from './boolean';
import { getDefaultFieldRenderType } from './field';
import { convertToTemplate } from './converter';

const groupModelFields = (fields: IModelField[]) => {
  const tableFields: IModelField[] = [];

  const oneColumnFields: IModelField[] = [];

  fields.forEach((f: IModelField) => {
    const isManyToOne = isManyToOneField(f);

    if (isSimpleField(f) || isManyToOne) {
      oneColumnFields.push(f);
    } else if (isComplexField(f) && !isManyToOne) {
      tableFields.push(f);
    }
  });

  return {
    normal: oneColumnFields,
    table: tableFields
  };
};

const buildTabPaneTemplate = (field: IModelField, viewType: ViewType) => ({
  tag: 'group',
  props: {
    title: field.label || field.displayName || field.name
  },
  children: [buildFieldTemplate(field, viewType, -1, false)]
});

/**
 * 构建字段模板
 *
 * @param field 字段
 * @param viewType 视图类型
 * @param span 视觉占列数
 * @param label 是否显示文本标签
 */
const buildFieldTemplate = (field: IModelField, viewType: ViewType, span = -1, label = true) => {
  const renderType: string = getDefaultFieldRenderType(field, viewType);
  const attrs: any = { name: field.name, label: field.label || field.displayName };

  if (renderType) {
    attrs.widget = renderType;
  }

  if (span !== -1) {
    attrs.span = span;
  }

  if (label === false) {
    attrs.label = false;
  }

  if (field.name === 'id' || field.invisible) {
    attrs.invisible = true;
  }

  return { tag: 'field', props: attrs };
};

/**
 *
 * @param {IModel} model
 * @param {ViewType} type
 * @returns {string} XML
 */
const createDefaultXML = (model: IModel, type: ViewType, withActions = true, dependOnFields = false): string => {
  let fixedType = type;
  if (type.indexOf(ViewType.Table) >= 0) {
    fixedType = ViewType.Table;
  } else if (type.indexOf(ViewType.Form) >= 0) {
    fixedType = ViewType.Form;
  } else if (type.indexOf(ViewType.Detail) >= 0) {
    fixedType = ViewType.Detail;
  } else if (type.indexOf(ViewType.Custom) >= 0) {
    fixedType = ViewType.Custom;
  }

  // const currentModelFields: IModelField[] = [];

  // const childrenModels: any = {};

  const children: any[] = [];
  const cols = model.attributes ? model.attributes.layoutGrid : 12;

  // 分组
  const groupsModelFields: { title: string; fields: IModelField[] }[] = [];

  // 分组之外的字段
  const independentModelFields: IModelField[] = [];

  // 多Tabs
  const tabsModelFields: { title: string; fields: IModelField[] }[] = [];

  /**
   * 遍历字段，根据`layoutGroup`，进行分组排序
   */
  model.modelFields.forEach((f) => {
    const { layoutGroup, layoutTab } = f.attributes || {};

    if (layoutTab) {
      const index = tabsModelFields.findIndex((g) => g.title === layoutTab);

      if (index < 0) {
        tabsModelFields.push({ title: layoutTab, fields: [] });
        tabsModelFields[tabsModelFields.length - 1].fields.push(f);
      } else {
        tabsModelFields[index].fields.push(f);
      }
    } else if (layoutGroup) {
      const index = groupsModelFields.findIndex((g) => g.title === layoutGroup);

      if (index < 0) {
        groupsModelFields.push({ title: layoutGroup, fields: [] });
        groupsModelFields[groupsModelFields.length - 1].fields.push(f);
      } else {
        groupsModelFields[index].fields.push(f);
      }
    } else {
      independentModelFields.push(f);
    }
  });

  if (groupsModelFields.length) {
    const groupModelTemplates = groupsModelFields.map((g) => {
      return {
        tag: 'group',
        props: {
          title: g.title,
          cols
        },
        children: g.fields.map((field: IModelField) =>
          buildFieldTemplate(field, type, field.attributes ? field.attributes.layoutGrid : cols)
        )
      };
    });

    children.push(...groupModelTemplates);
  }

  if (tabsModelFields.length) {
    const tabsModelTemplates = {
      tag: 'group',
      props: {
        widget: 'tabs'
      },
      children: tabsModelFields.map((g) => {
        return {
          tag: 'group',
          props: {
            title: g.title,
            cols
          },
          children: g.fields.map((field: IModelField) =>
            buildFieldTemplate(field, type, field.attributes ? field.attributes.layoutGrid : cols)
          )
        };
      })
    };

    children.push(tabsModelTemplates);
  }

  if (independentModelFields.length) {
    const fieldModelTemplates = independentModelFields.map((field) =>
      buildFieldTemplate(field, type, field.attributes ? field.attributes.layoutGrid : 2)
    );

    children.push(...fieldModelTemplates);
  }

  return convertToTemplate({
    tag: 'view',
    props: { widget: fixedType },
    children
  });
};

export { createDefaultXML };
