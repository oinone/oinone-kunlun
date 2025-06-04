import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { Image as AImage } from 'ant-design-vue';
import { createVNode, defineComponent, withModifiers } from 'vue';

import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';

const Component = defineComponent({
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  components: { AImage },
  render() {
    const { value } = this.$props;

    if (value && value.length) {
      return createVNode(
        'div',
        {
          style: {
            height: '100%'
          },
          onClick: withModifiers(() => {}, ['stop'])
        },
        value.map((url) =>
          createVNode(AImage, { src: url, style: { width: '32px', height: '32px', marginRight: '10px' } })
        )
      );
    }

    return [];
  }
});

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    multi: true,
    widget: 'UploadImg'
  })
)
export class TableStringMultiUploadImageFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(Component, { value })];
    }
    return [];
  }
}

/**
 * @deprecated please using TableStringMultiUploadImageFieldWidget
 */
export const TableStringUploadImgFieldWidget = TableStringMultiUploadImageFieldWidget;
