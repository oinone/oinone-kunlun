import { http } from '@kunlun/service';

export async function fetchAuditFieldList(modelId, modelModel) {
  const body = `
    query{
      operationLogConfigQuery {
        constructMirror(
          data: {
            modelDefinition: {
              id: "${modelId}"
              model: "${modelModel}"
            }
          }
        ) {
          id
          code
          logType
          modelDefinition {
            id
            model
            displayName
            name
          }
          fieldList {
            key
            fieldCode
            fieldName
            fieldTtype
            fieldModel
            fieldList {
              key
              fieldCode
              fieldName
              fieldTtype
              fieldModel
              isSelected
            }
            isSelected
          }
        }
      }
    }
  `;
  const result = await http.mutate('dataAudit', body);
  return result.data.operationLogConfigQuery.constructMirror;
}

export const collectSelectedKeys = (keys, fieldList) => {
  if (fieldList) {
    fieldList.forEach((f) => {
      if (f.isSelected) {
        keys.push(f.key);
      }
      collectSelectedKeys(keys, f.fieldList);
    });
  }
};
