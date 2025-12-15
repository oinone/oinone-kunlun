import { GQLRequestParameterBuilder } from '@oinone/kunlun-request';
import { isRelatedField, isRelationField, RequestModelField } from '../../runtime-context';
import { RuntimeModelField } from '../../runtime-metadata';
import { StaticRequestModelFieldsCache } from '../FunctionService';
import { CommonGQLFields } from '../typing';

export class RequestHelper {
  public static convertRequestFields(fields: RuntimeModelField[]): RequestModelField[] {
    return (fields || []).map((field) => {
      const requestField: RequestModelField = { field };
      if (isRelationField(field)) {
        requestField.referencesFields = this.convertRequestFields(field.referencesModel?.modelFields || []);
      }
      return requestField;
    });
  }

  public static buildCommonGQLFields(fields: RequestModelField[]): CommonGQLFields {
    const { normalFields, relationFields } = RequestHelper.resolveRequestModelFields(fields);
    const gqlFields: CommonGQLFields = { fields: normalFields };
    if (relationFields.length) {
      const referenceGQLFields: CommonGQLFields[] = [];
      for (const field of relationFields) {
        const referenceField = RequestHelper.buildCommonGQLFields(field.referencesFields!);
        referenceField.field = field.field.data;
        referenceGQLFields.push(referenceField);
      }
      gqlFields.referenceFields = referenceGQLFields;
    }
    return gqlFields;
  }

  public static buildGQLRequestParameterFields(builder: GQLRequestParameterBuilder, fields: RequestModelField[]): void {
    const { normalFields, relationFields } = RequestHelper.resolveRequestModelFields(fields);
    builder.stringParameter('fields', normalFields);
    if (relationFields.length) {
      builder.buildArrayParameter('relationFields', relationFields, (builder, field) => {
        builder.stringParameter('field', field.field.data);
        RequestHelper.buildGQLRequestParameterFields(builder, field.referencesFields!);
      });
    }
  }

  private static resolveRequestModelFields(fields: RequestModelField[]) {
    const normalFields: string[] = [];
    const relationFields: RequestModelField[] = [];
    for (const field of fields) {
      const { field: modelField } = field;
      let { referencesFields } = field;
      if (isRelatedField(modelField)) {
        normalFields.push(modelField.data);
        continue;
      }
      if (isRelationField(modelField)) {
        const { references } = modelField;
        if (references) {
          const staticResponseModelFields = StaticRequestModelFieldsCache.INSTANCE.get(references);
          if (staticResponseModelFields) {
            referencesFields = staticResponseModelFields;
          }
        }
      }
      if (referencesFields?.length) {
        relationFields.push({
          field: modelField,
          referencesFields
        });
      } else {
        normalFields.push(modelField.data);
      }
    }
    return {
      normalFields,
      relationFields
    };
  }
}
