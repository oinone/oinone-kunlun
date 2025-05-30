import { isRelationField, RequestModelField } from '../../runtime-context';
import { RuntimeModelField } from '../../runtime-metadata';

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
}
