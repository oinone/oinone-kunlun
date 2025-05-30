import { IModelField, ModelFieldType } from '../metadata/types';

const isSimpleField = (field: IModelField): boolean => {
  switch (field.ttype) {
    case ModelFieldType.Boolean:
    case ModelFieldType.Integer:
    case ModelFieldType.Long:
    case ModelFieldType.Float:
    case ModelFieldType.Currency:
    case ModelFieldType.String:
    case ModelFieldType.Email:
    case ModelFieldType.Phone:
    case ModelFieldType.ID:
    case ModelFieldType.Date:
    case ModelFieldType.DateTime:
    case ModelFieldType.Time:
    case ModelFieldType.Year:
    case ModelFieldType.Enum:
    case ModelFieldType.MultiEnum:
    case ModelFieldType.HTML:
    case ModelFieldType.Map:
    case ModelFieldType.Text: {
      return true;
    }
    default: {
      return false;
    }
  }
};

const isComplexTtype = (ttype: ModelFieldType): boolean => {
  return [
    ModelFieldType.OneToOne,
    ModelFieldType.OneToMany,
    ModelFieldType.ManyToOne,
    ModelFieldType.ManyToMany
  ].includes(ttype);
};

const isDateTtype = (ttype: ModelFieldType): boolean => {
  return [ModelFieldType.Date, ModelFieldType.DateTime, ModelFieldType.Year, ModelFieldType.Time].includes(ttype);
};
const isNumberTtype = (ttype: ModelFieldType): boolean => {
  return [
    ModelFieldType.ID,
    ModelFieldType.UID,
    ModelFieldType.Integer,
    ModelFieldType.Long,
    ModelFieldType.Float,
    ModelFieldType.Currency
  ].includes(ttype);
};

const isStringTtype = (ttype: ModelFieldType) => {
  return [
    ModelFieldType.String,
    ModelFieldType.Text,
    ModelFieldType.HTML,
    ModelFieldType.Phone,
    ModelFieldType.Email
  ].includes(ttype);
};
export { isSimpleField, isComplexTtype, isDateTtype, isNumberTtype, isStringTtype };
