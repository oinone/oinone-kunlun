import { IQueryPageOption } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { watch } from 'vue';
import { FormFieldWidget } from '../../../../../basic';
import { FormM2MFieldSelectWidget } from '../../../../../field';

@SPI.ClassFactory(FormFieldWidget.Token({ widget: 'AppsModuleUpstreamSelect' }))
export class AppsModuleUpstreamSelectWidget extends FormM2MFieldSelectWidget {
  @Widget.Reactive()
  public get moduleOptionsField(): string {
    return this.getDsl().moduleOptionsField || '';
  }

  protected async loadOptions(param: IQueryPageOption = {}): Promise<any> {
    // do nothing.
  }

  @Widget.Method()
  protected async loadMore() {
    // do nothing.
  }

  protected async fillOptions(dataList: Record<string, unknown>[], insetDefaultValue = true) {
    this.dataList = dataList;
    this.options = this.handleSelectOption(this.dataList, this.referencesModel);
  }

  protected watchModuleOptions() {
    watch(
      () => this.formData[this.moduleOptionsField] as Record<string, unknown>[],
      (val) => {
        this.fillOptions(val);
      },
      { immediate: true }
    );
  }

  protected async mounted() {
    this.watchModuleOptions();
    await super.mounted();
  }
}
