import { SPI } from '@oinone/kunlun-spi';
import { IModelField, IModelFieldOption, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActiveRecord, RuntimeModelField } from '@oinone/kunlun-engine';
import { BooleanHelper, CallChaining } from '@oinone/kunlun-shared';
import DefaultSearchTab from './DefaultSearchTab.vue';
import { BaseElementWidget } from '../../basic';
import { CATE_ALL_OPTION } from './types';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Search,
    widget: 'SearchTab'
  })
)
export class SearchTabWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultSearchTab);
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject()
  public formData: ActiveRecord | undefined;

  @Widget.Reactive()
  protected get cateFields(): string[] {
    const { cateFields = [] } = this.getDsl();
    return cateFields as unknown[] as string[];
  }

  @Widget.Reactive()
  protected get topCateModelField(): RuntimeModelField | undefined {
    const cateField = this.cateFields?.[0];
    if (!cateField) {
      return undefined;
    }
    return this.rootRuntimeContext?.model.modelFields?.find(
      (a) => a && a.ttype === ModelFieldType.Enum && a.name === cateField
    );
  }

  @Widget.Reactive()
  protected get showTopCateAll(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().showTopCateAll) || true;
  }

  @Widget.Reactive()
  protected get topCateFieldOptions(): IModelFieldOption[] {
    const topCateModelField = this.topCateModelField as unknown as IModelField;
    const options = (topCateModelField?.options || []).filter((a) => !a.invisible);
    return options.length ? [...(this.showTopCateAll ? [CATE_ALL_OPTION] : []), ...options] : [];
  }

  @Widget.Reactive()
  protected get secondCateModelField(): RuntimeModelField | undefined {
    const [topCateField, secondCateField] = this.cateFields!;
    if (!secondCateField || topCateField === secondCateField) {
      return undefined;
    }
    return this.rootRuntimeContext?.model.modelFields?.find(
      (a) => a && a.ttype === ModelFieldType.Enum && a.name === secondCateField
    );
  }

  @Widget.Reactive()
  protected get showSecondCateAll(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().showSecondCateAll) || true;
  }

  @Widget.Reactive()
  protected get secondCateFieldOptions(): IModelFieldOption[] {
    const secondCateModelField = this.secondCateModelField as unknown as IModelField;
    const options = (secondCateModelField?.options || []).filter((a) => !a.invisible);
    return options.length ? [...(this.showSecondCateAll ? [CATE_ALL_OPTION] : []), ...options] : [];
  }

  @Widget.Method()
  @Widget.Inject()
  public onCateSearch;

  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining<boolean> | undefined;

  protected $$mounted() {
    super.$$mounted();
    this.mountedCallChaining?.hook(this.path, () => {
      this.initCate();
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
  }

  private initCate() {
    if (this.formData) {
      this.initCateSearchField(this.topCateModelField, this.topCateFieldOptions, this.showTopCateAll);
      this.initCateSearchField(this.secondCateModelField, this.secondCateFieldOptions, this.showSecondCateAll);
    }
  }

  private async initCateSearchField(
    field: RuntimeModelField | undefined,
    fieldOptions: IModelFieldOption[],
    isShowAll: boolean
  ) {
    if (this.formData && field && fieldOptions.length && !isShowAll) {
      const initialValue = await this.rootRuntimeContext.getInitialValue();
      const defaultVal = initialValue[field.name];
      if (!defaultVal) {
        const { name } = fieldOptions[0];
        this.formData[field.name] = field.multi ? [name] : name;
      } else {
        this.formData[field.name] = defaultVal;
      }
    }
  }
}
