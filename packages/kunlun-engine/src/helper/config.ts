import { Entity } from '@oinone/kunlun-meta';
import { RuntimeModelField } from '../runtime-metadata';

const getLabelFieldList = (labelFieldsStr: string | undefined, modelLabelFields: string[]): string[] => {
  let labelFieldList = modelLabelFields || [];
  if (labelFieldsStr) {
    labelFieldList = labelFieldsStr.split(',');
  }
  return labelFieldList;
};
/**
 * 获取后端查询使用的是模型字段对象列表
 * @param labelFieldsStr 页面自定义的展示字段字符串，逗号分隔多个field.name
 * @param modelLabelFields 模型配置的展示字段列表
 * @param modelFields 模型所有的字段
 */
const getLabelFieldList4query = (
  labelFieldsStr: string | undefined,
  modelLabelFields: string[],
  modelFields: RuntimeModelField[]
): RuntimeModelField[] => {
  let labelFieldList = getLabelFieldList(labelFieldsStr, modelLabelFields);
  labelFieldList = [...labelFieldList, 'id', 'code'];
  return modelFields.filter((a) => labelFieldList.includes(a.data)) || [];
};

function createComplexConfig(config: Entity | undefined, modelLabelFields: string[] | undefined) {
  if (config) {
    modelLabelFields = modelLabelFields || [];
    if (config.labelField) {
      modelLabelFields = ((config.labelField as string) || '').split(',');
    }
    const separator = (config.separator || ',') as string;
    const labelFields = modelLabelFields;
    const searchFields = ((config.searchField as string) || '').split(',');
    return { separator, labelFields, searchFields };
  }
  return { separator: ',', labelFields: ['id'], searchFields: [] };
}

export { getLabelFieldList, getLabelFieldList4query, createComplexConfig };
