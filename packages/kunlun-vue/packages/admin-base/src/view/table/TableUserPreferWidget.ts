import { ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper, CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../basic';
import { UserPreferEventManager } from '../../service';
import { UserTablePrefer, VisibleField } from '../../typing';
import TableUserPrefer from './TableUserPrefer.vue';
import { nextTick } from 'vue';

interface DataOption {
  key: string;
  title: string;
  invisible?: boolean;
}

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Table,
    widget: ['userPrefer', 'user-prefer', 'UserPrefer']
  })
)
export class TableUserPreferWidget extends BaseElementWidget {
  protected userPreferEventManager: UserPreferEventManager | undefined;

  @Widget.Reactive()
  private userPrefer?: UserTablePrefer;

  @Widget.Reactive()
  private get internalVisibleFields(): VisibleField[] {
    return this.metadataRuntimeContext.model.modelFields
      .filter((f) => BooleanHelper.isFalse(f.invisible))
      .map((f) => {
        return {
          data: f.data,
          displayName: f.label || f.displayName || f.name
        } as VisibleField;
      });
  }

  @Widget.Reactive()
  private get fields(): DataOption[] {
    const fieldPrefer = (this.userPrefer?.fieldPrefer || []) as string[];
    const fieldOrder = (this.userPrefer?.fieldOrder || []) as string[];
    const mapping = (field: VisibleField): DataOption => {
      return {
        key: field.data!,
        title: field.displayName!,
        invisible: fieldPrefer.includes(field.data)
      };
    };
    const targetFields = [...this.internalVisibleFields];
    const fields: DataOption[] = [];
    for (const field of fieldOrder) {
      const index = targetFields.findIndex((v) => v.data === field);
      if (index >= 0) {
        fields.push(mapping(targetFields[index]));
        targetFields.splice(index, 1);
      }
    }
    return [...fields, ...targetFields.map(mapping)];
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(TableUserPrefer);
    return this;
  }

  @Widget.Reactive()
  public get invisible(): boolean {
    if (!this.userPrefer) {
      return true;
    }
    return super.invisible;
  }

  @Widget.Reactive()
  public get simple(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().simple);
  }

  @Widget.Method()
  public async enterCallback(
    allFields: DataOption[],
    invisibleFields: DataOption[],
    visibleFields: DataOption[]
  ): Promise<boolean> {
    let fieldPrefer: string[] | null = invisibleFields.map((v) => v.key);
    if (!fieldPrefer.length) {
      fieldPrefer = null;
    }
    let fieldOrder: string[] | null = allFields.map((v) => v.key);
    if (!fieldOrder.length) {
      fieldOrder = null;
    }
    await this.saveUserPrefer({ fieldOrder, fieldPrefer } as UserTablePrefer);
    await this.reloadUserPrefer({ fieldOrder: fieldOrder || [], fieldPrefer: fieldPrefer || [] });
    return true;
  }

  @Widget.Method()
  public async resetCallback(): Promise<boolean> {
    await this.saveUserPrefer({
      fieldOrder: null,
      fieldPrefer: null,
      fieldLeftFixed: null,
      fieldRightFixed: null,
      fieldWidth: null
    } as unknown as UserTablePrefer);
    await this.reloadUserPrefer({
      fieldOrder: [],
      fieldPrefer: [],
      fieldLeftFixed: [],
      fieldRightFixed: [],
      fieldWidth: []
    });
    return true;
  }

  protected async reloadUserPrefer(userPrefer: Partial<UserTablePrefer>) {
    await UserPreferEventManager.getNullable(this.rootHandle || this.currentHandle)?.reload(userPrefer);
  }

  protected async saveUserPrefer(userPrefer: Partial<UserTablePrefer>): Promise<void> {
    await UserPreferEventManager.getNullable(this.rootHandle || this.currentHandle)?.save(userPrefer);
  }

  private $reloadUserPrefer() {
    this.userPrefer = this.userPreferEventManager?.getData();
  }

  protected mountedProcess() {
    this.userPreferEventManager = UserPreferEventManager.getNullable(this.rootHandle || this.currentHandle);
    this.$reloadUserPrefer();
    if (!this.userPrefer) {
      return;
    }
    this.userPreferEventManager?.onReload(this.$reloadUserPrefer.bind(this));
  }

  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  protected $$mounted() {
    super.$$mounted();
    this.mountedCallChaining?.hook(this.path, () => {
      this.mountedProcess();
    });
    nextTick(() => {
      this.mountedProcess();
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
    this.userPreferEventManager?.clearOnReload(this.$reloadUserPrefer);
  }
}
