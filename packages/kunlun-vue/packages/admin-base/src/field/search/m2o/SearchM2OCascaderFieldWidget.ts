import {
  ActiveRecord,
  getRefreshParameters,
  RefreshCallChainingScope,
  RuntimeM2OField,
  RuntimeSearchField,
  SubmitRelationHandler,
  SubmitValue
} from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { RSQLOperators } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { CascaderCheckedStrategy, SelectMode, TreeSelectCheckedStrategy } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormCascaderFieldWidget } from '../../cascader';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Cascader'
  })
)
export class SearchM2OCascaderFieldWidget extends FormCascaderFieldWidget<
  ActiveRecord | ActiveRecord[],
  RuntimeM2OField & RuntimeSearchField
> {
  @Widget.Reactive()
  protected get operator() {
    return this.field.operator;
  }

  @Widget.Reactive()
  protected get selectMode(): SelectMode {
    const { operator } = this;
    if (operator && RSQLOperators.isMulti(operator)) {
      return SelectMode.multiple;
    }
    return SelectMode.single;
  }

  @Widget.Reactive()
  protected get multipleCheckedStrategy() {
    return super.multipleCheckedStrategy || CascaderCheckedStrategy.SHOW_ALL;
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    if (this.selectMode === SelectMode.multiple) {
      let targetValues = value;
      if (targetValues && !Array.isArray(targetValues)) {
        targetValues = [targetValues];
      }
      return SubmitRelationHandler.O2M(
        field,
        itemName,
        submitValue,
        targetValues,
        viewMode,
        submitCache,
        submitType,
        relationUpdateType
      );
    }
    let targetValues = value;
    if (targetValues && Array.isArray(targetValues)) {
      [targetValues] = targetValues;
    }
    return SubmitRelationHandler.M2O(
      field,
      itemName,
      submitValue,
      targetValues,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }

  protected $$mounted() {
    super.$$mounted();
    this.refreshCallChaining?.hook(this.path, async (args) => {
      const refreshParameters = getRefreshParameters(args);
      if (refreshParameters.scope === RefreshCallChainingScope.searchReset) {
        await this.refreshProcess();
      }
    });
  }
}
