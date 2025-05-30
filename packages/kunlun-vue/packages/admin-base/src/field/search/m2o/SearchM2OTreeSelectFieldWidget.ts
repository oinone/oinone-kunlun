import {
  ActiveRecord,
  getRefreshParameters,
  RefreshCallChainingScope,
  RuntimeM2OField,
  RuntimeSearchField,
  SubmitRelationHandler,
  SubmitValue
} from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { Optional, RSQLOperators } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { SelectMode, TreeSelectCheckedStrategy } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormTreeSelectFieldWidget } from '../../tree-select';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'TreeSelect'
  })
)
export class SearchM2OTreeSelectFieldWidget extends FormTreeSelectFieldWidget<
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
    return super.multipleCheckedStrategy || TreeSelectCheckedStrategy.SHOW_ALL;
  }

  @Widget.Reactive()
  protected get treeCheckStrictly() {
    return Optional.ofNullable(super.treeCheckStrictly).orElse(false);
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
