import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { Image as VanImage } from 'vant';
import { createVNode, defineComponent, withModifiers } from 'vue';

import { BaseFieldWidget, BaseTableFieldWidget } from '../../../../basic';

const Component = defineComponent({
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  components: { VanImage },
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
          createVNode(VanImage, { src: url, style: { width: '32px', height: '32px', marginRight: '10px' } })
        )
      );
    }

    return [];
  }
});

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Table,
    ttype: ModelFieldType.String,
    multi: true,
    widget: 'UploadImg'
  })
)
export class TableStringUploadImgFieldWidget extends BaseTableFieldWidget {
  @Widget.Method()
  public renderDefaultSlot(context) {
    const value = this.compute(context);
    if (value) {
      return [createVNode(Component, { value })];
    }
    return [];
  }
}
