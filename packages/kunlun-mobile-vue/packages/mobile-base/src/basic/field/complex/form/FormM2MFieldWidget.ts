import { RuntimeM2MField, SubmitRelationHandler, SubmitValue } from '@oinone/kunlun-engine';
import { FormComplexListFieldWidget } from '../FormComplexListFieldWidget';

export class FormM2MFieldWidget extends FormComplexListFieldWidget<RuntimeM2MField> {
  /**
   * <h3>多对多数据提交</h3>
   * - 当值为undefined时不提交
   * - 当值为空或为空数组时，提交null值进行置空处理
   * - 当字段无法获取、字段为存储且关联关系不存储、关联/关系字段未正确配置时，使用默认提交策略
   * - 其他情况均使用仅提交关联关系字段的方式
   */
  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2M(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }
}
