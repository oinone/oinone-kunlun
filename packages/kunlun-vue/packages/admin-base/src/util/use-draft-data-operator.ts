import { GenericFunctionService } from '@oinone/kunlun-engine';

const draftModelModel = 'base.Draft';

interface DraftValueRecord {
  hasDraft: boolean;
  draftContent: string;
}

/**
 * 草稿操作API
 *
 * @package {string} viewDraftDataIdentifier 视图唯一标识符
 */
export const useDraftDataOperator = (viewDraftDataIdentifier: string) => {
  /**
   * 查询草稿
   */
  const queryDraft = async () => {
    return GenericFunctionService.INSTANCE.simpleExecuteByFun<DraftValueRecord>(
      draftModelModel,
      'queryDraft',
      viewDraftDataIdentifier
    );
  };

  /**
   * 创建/更新 草稿
   */
  const createOrUpdateDraft = async (data) => {
    await GenericFunctionService.INSTANCE.simpleExecuteByFun(draftModelModel, 'createOrUpdateDraft', {
      viewIdentifier: viewDraftDataIdentifier,
      draftContent: JSON.stringify(data || {})
    });
  };

  /**
   * 删除草稿
   */
  const deleteDraft = async () => {
    return GenericFunctionService.INSTANCE.simpleExecuteByFun(draftModelModel, 'deleteDraft', viewDraftDataIdentifier);
  };

  return { queryDraft, createOrUpdateDraft, deleteDraft };
};
