import { ActiveRecord } from '@kunlun/engine';
import { http } from '@kunlun/service';

interface WorkflowTandemActionParams {
  workflowCode: string;
  model: string;
  modelDataList: ActiveRecord[];
}

export const executeMicroFlowTandemMutation = async (
  params: WorkflowTandemActionParams,
  sessionPath?: string
): Promise<{ workflowCode?: string }> => {
  const mutation = `mutation{
    microflowTriggerTransientMutation {
      startWorkflow(
        data: {
          workflowCode: "${params.workflowCode}"
          model: "${params.model}"
          modelDataList: ${JSON.stringify(JSON.stringify(params.modelDataList))}
        }
      ) {
        workflowCode
      }
    }
  }`;
  const result = await http.mutate('workflow', mutation, {
    path: sessionPath
  });
  return result.data.microflowTriggerTransientAction.startWorkflow;
};
