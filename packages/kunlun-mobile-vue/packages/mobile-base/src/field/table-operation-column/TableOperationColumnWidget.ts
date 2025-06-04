import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseTableColumnWidget } from '../../basic';
import { UserPreferService } from '../../service';
import { OperateEntity, UserTablePrefer, VisibleField } from '../../typing';
import TableOperationColumn from './TableOperationColumn.vue';

function hasAction(dsl: DslDefinition | undefined) {
  const widgets = dsl?.widgets || [];
  for (const widget of widgets) {
    switch (widget.dslNodeType as DslDefinitionType) {
      case DslDefinitionType.VIEW:
      case DslDefinitionType.TEMPLATE:
        continue;
      case DslDefinitionType.ACTION:
        return true;
    }
    if (hasAction(widget)) {
      return true;
    }
  }
  return false;
}

export class TableOperationColumnWidget extends BaseTableColumnWidget {
  @Widget.Reactive()
  protected showActionPopup = false;

  @Widget.Method()
  @Widget.Provide()
  protected onShowActionsPopup(show: boolean) {
    this.showActionPopup = show;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(TableOperationColumn);
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected operation = true;

  @Widget.Reactive()
  public get invisible() {
    const invisible = BooleanHelper.toBoolean(this.getDsl().invisible);
    if (invisible) {
      return true;
    }
    if (!hasAction(this.template)) {
      return true;
    }
    return !this.operation;
  }

  @Widget.Reactive()
  public get itemData(): string {
    return '$$internalOperator';
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected userPrefer?: UserTablePrefer;

  @Widget.Reactive()
  protected get needOperateEntity(): OperateEntity {
    return {
      visibleFields: this.visibleFields,
      prefer: this.userPrefer,
      inline: this.inline
    } as OperateEntity;
  }

  @Widget.Reactive()
  protected get visibleFields(): VisibleField[] {
    return this.metadataRuntimeContext.model.modelFields
      .filter((f) => BooleanHelper.isFalse(f.invisible))
      .map((f) => {
        return {
          data: f.data,
          displayName: f.label || f.displayName || f.name
        } as VisibleField;
      });
  }

  @Widget.Method()
  @Widget.Inject()
  public reloadUserPrefer;

  @Widget.Method()
  public async saveUserPrefer(userPrefer: UserTablePrefer): Promise<void> {
    const viewName = userPrefer.viewName || this.metadataRuntimeContext.view.name;
    if (viewName) {
      const saveUserPrefer: UserTablePrefer = {
        ...userPrefer,
        model: userPrefer.model || this.metadataRuntimeContext.model.model,
        viewName
      };
      await UserPreferService.savePreferForTable(saveUserPrefer);
    }
  }
}
