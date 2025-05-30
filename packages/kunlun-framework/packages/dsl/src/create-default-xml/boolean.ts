import { ModelFieldType, IModelField, isComplexTtype, isSimpleField } from '@kunlun/meta';

const nativeFields = ['id', 'createUid', 'createDate', 'writeUid', 'writeDate'];

// 是否为平台内置的字段
const isNativeField = (field: IModelField): boolean => {
  return nativeFields.includes(field.name);
};

const isNullField = (field: IModelField): boolean => {
  return field.ttype === ModelFieldType.Null;
};

const isOneToOneField = (field: IModelField): boolean => {
  return field.ttype === ModelFieldType.OneToOne;
};

const isManyToOneField = (field: IModelField): boolean => {
  return field.ttype === ModelFieldType.ManyToOne;
};

const isOneToManyField = (field: IModelField): boolean => {
  return field.ttype === ModelFieldType.OneToMany;
};

const isManyToManyField = (field: IModelField): boolean => {
  return field.ttype === ModelFieldType.ManyToMany;
};

const isComplexField = (field: IModelField): boolean => {
  return isComplexTtype(field.ttype);
};

export {
  isSimpleField,
  isComplexField,
  isNullField,
  isOneToOneField,
  isManyToOneField,
  isOneToManyField,
  isManyToManyField,
  isNativeField
};
