import { ActiveRecord } from '@oinone/kunlun-engine';
import { http } from '@oinone/kunlun-service';
import { GraphqlHelper } from '@oinone/kunlun-shared';

interface AiTandemActionParams {
  connectorCode: string;
  viewName: string;
  actionName: string;
  data: ActiveRecord;
}

export const executeAiTandemMutation = async (
  params: AiTandemActionParams,
  sessionPath?: string
): Promise<{ result?: ActiveRecord }> => {
  const mutation = `mutation{
    aiTaskMutation {
      execute(
        data: {
          connectorCode: "${params.connectorCode}"
          viewName: "${params.viewName}"
          actionName: "${params.actionName}"
          data: "${GraphqlHelper.serializableObject(params.data)}"
        }
      ) {
        result
      }
    }
  }`;
  const result = await http.mutate('aiX', mutation, {
    path: sessionPath
  });
  return result.data.aiTaskMutation.execute;
};
