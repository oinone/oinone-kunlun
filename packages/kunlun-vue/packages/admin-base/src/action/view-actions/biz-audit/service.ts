import { http } from '@oinone/kunlun-service';

export const BizAuditRecordModel = 'data.audit.OperationLog';
export const BizAuditRecordCommonDetailName = '操作日志detail';

export async function loadBizRecord(dataId, dataModel) {
  const body = `
    query {
      operationLogQuery {
        fetchListByBizId(
          bizId: "${dataId}"
          model: "${dataModel}"
        ) {
          id
          operatorName
          operator{
            avatarUrl
          }
          operationName
          requestPosition
          deviceName
          model
          businessId
          businessCode
          businessName
          requestIp
          requestPosition
          createDate
          fieldRecordList {
            fieldCode
            fieldName
            type
            originFieldVal
            targetFieldVal
          }
          oneList {
            fieldCode
            fieldName
            type
            businessId
            businessCode
            businessName
            type
            fieldList {
              fieldCode
              fieldName
              type
              originFieldVal
              targetFieldVal
            }
          }
          manyList {
            fieldCode
            fieldName
            type
            businessId
            businessCode
            businessName
            fieldList {
              fieldCode
              fieldName
              type
              originFieldVal
              targetFieldVal
            }
          }
        }
      }
    }`;
  const result = await http.mutate('dataAudit', body);
  return result.data.operationLogQuery.fetchListByBizId;
}

export const queryAuditDetail = async (dataId?: string) => {
  const mutation = `{
	operationLogQuery {
		queryOne(query: { id: ${dataId} }) {
			id
        logConfig {
          id
          code
          logType
          model
          modelName
          name
          fieldsDisplayName
          variationDefinitionName
          active
          createDate
          writeDate
          createUid
          writeUid
        }
        operatorName
        deviceName
        model
        businessId
        businessCode
        businessName
        requestIp
        requestPosition
        createDate
        fieldRecordList {
          key
          fieldCode
          fieldName
          fieldTtype
          fieldLtype
          fieldModel
          fieldDictionary
          relationFields
          referenceFields
          type
          originFieldVal
          targetFieldVal
          isSelected
        }
        oneList {
          fieldCode
          fieldName
          type
          businessId
          businessCode
          businessName
          fieldList {
            fieldCode
            fieldName
            type
            originFieldVal
            targetFieldVal
          }
        }
        manyList {
          fieldCode
          fieldName
          type
          businessId
          businessCode
          businessName
          fieldList {
            fieldCode
            fieldName
            type
            originFieldVal
            targetFieldVal
          }
        }
        logConfigId
      }
    }
  }`;
  const result = await http.mutate('dataAudit', mutation);
  return result.data.operationLogQuery.queryOne;
};
