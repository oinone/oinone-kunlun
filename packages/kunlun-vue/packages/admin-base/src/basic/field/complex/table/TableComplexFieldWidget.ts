import { ActiveRecords, ModelCache, RuntimeModel, RuntimeRelationField } from '@kunlun/engine';
import { isEmptyValue } from '@kunlun/meta';
import { CallChaining } from '@kunlun/shared';
import { autoFillByLabel, autoFillByLabelFields } from '@kunlun/vue-admin-layout';
import { Widget } from '@kunlun/vue-widget';
import { BaseTableFieldWidget, BaseTableFieldWidgetProps } from '../../../table-column';

export class TableComplexFieldWidget<
  Value = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends BaseTableFieldWidgetProps<Field> = BaseTableFieldWidgetProps<Field>
> extends BaseTableFieldWidget<Value, Field, Props> {
  @Widget.Reactive()
  protected get referencesModel(): RuntimeModel | undefined {
    return this.field.referencesModel;
  }

  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  public get labelFields(): string[] {
    return this.referencesModel?.labelFields || [];
  }

  @Widget.Reactive()
  public get searchFields(): string[] {
    return this.getDsl().searchFields || this.referencesModel?.labelFields;
  }

  @Widget.Reactive()
  public get separator() {
    return this.getDsl().separator || ', ';
  }

  @Widget.Reactive()
  protected get relationFieldKey(): string {
    // fixme @zbh 20230114 改版 使用string[] | undefined
    return this.referencesModel?.pks?.[0] || 'id';
  }

  protected handleTableLabel(dataEntity) {
    const realLabel = this.optionLabel || this.referencesModel?.label;
    let showValue;
    if (isEmptyValue(realLabel)) {
      showValue = autoFillByLabelFields(this.relationFieldKey, dataEntity, this.labelFields, this.separator);
    } else {
      showValue = autoFillByLabel(this.relationFieldKey, dataEntity, realLabel, this.optionLabelContextArgs);
    }
    return showValue.label;
  }

  @Widget.Reactive()
  protected get optionLabel() {
    const _optionLabel = this.getDsl().optionLabel;
    if (_optionLabel) {
      return _optionLabel;
    }
    return '';
  }

  @Widget.Reactive()
  protected get optionLabelContextArgs() {
    const _optionLabelContextArgs = this.getDsl().optionLabelContextArgs;
    if (_optionLabelContextArgs) {
      return _optionLabelContextArgs;
    }
    return '';
  }

  /**
   * 当所有referencesModel都能在field中进行获取后移除该方法
   * @protected
   */
  protected async resolveReferenceModel() {
    let { referencesModel } = this;
    if (!referencesModel) {
      const references = this.field.references;
      if (references) {
        referencesModel = await ModelCache.get(references);
        if (referencesModel) {
          this.field!.referencesModel = referencesModel;
        }
      }
    }
  }

  protected $$mounted() {
    super.$$mounted();
    this.parentMountedCallChaining?.hook(this.path, async () => {
      await this.resolveReferenceModel();
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.parentMountedCallChaining?.unhook(this.path);
  }
}
