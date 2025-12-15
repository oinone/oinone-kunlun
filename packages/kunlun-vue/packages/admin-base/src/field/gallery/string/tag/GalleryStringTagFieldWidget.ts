import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { OioCardScope, useInjectOioCardContext } from '@oinone/kunlun-vue-ui-common';
import { isGalleryViewState, Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringTagFieldWidget } from '../../../detail';
import GalleryTag from './GalleryTag.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: [ModelFieldType.String, ModelFieldType.Integer],
    multi: true
  })
)
export class GalleryStringTagFieldWidget extends DetailStringTagFieldWidget {
  @Widget.Reactive()
  protected scope: string | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected rowIndex: number | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryTag);
    return this;
  }

  @Widget.Reactive()
  protected get displayNameList() {
    const tags: { label: string }[] = [];
    if (this.value && this.value.length) {
      for (let i = 0; i < this.value.length; i++) {
        tags.push({
          label: this.value[i]
        });
      }
    }
    return tags;
  }

  @Widget.Reactive()
  protected get wrap(): boolean {
    return this.scopeProps?.textWrap === 'wrap';
  }

  @Widget.Reactive()
  protected get scopeProps(): Record<string, unknown> | undefined {
    const { viewState, scope, rowIndex } = this;
    if (viewState && scope && rowIndex != null && isGalleryViewState(viewState)) {
      if (scope === OioCardScope.title) {
        return viewState.cards?.[rowIndex]?.titleProps;
      }
      if (scope === OioCardScope.content) {
        return viewState.cards?.[rowIndex]?.contentProps;
      }
    }
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.scope = useInjectOioCardContext().scope;
  }
}

/**
 * @deprecated please using GalleryStringTagFieldWidget
 */
export const GalleryStringTagWidget = GalleryStringTagFieldWidget;
