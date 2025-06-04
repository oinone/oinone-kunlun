import { ActiveRecord } from '@oinone/kunlun-engine';
import { http } from '@oinone/kunlun-service';
import { GraphqlHelper } from '@oinone/kunlun-shared';

interface EipTandemActionParams {
  interfaceName: string;
  model: string;
  viewName: string;
  actionName: string;
  requestData: ActiveRecord;
}

export const executeEipTandemMutation = async (
  params: EipTandemActionParams,
  sessionPath?: string
): Promise<{ responseData?: ActiveRecord }> => {
  const mutation = `mutation {
    eipSendRequestTransientMutation {
        sendRequest(
            data: {
                interfaceName: "${params.interfaceName}"
                model: "${params.model}"
                viewName: "${params.viewName}"
                actionName: "${params.actionName}"
                requestData: "${GraphqlHelper.serializableObject(params.requestData)}"
            }
        ) {
            responseData
        }
    }
}`;
  const result = await http.mutate('eip', mutation, {
    path: sessionPath
  });
  return result.data.eipSendRequestTransientMutation.sendRequest;
};
