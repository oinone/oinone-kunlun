<script lang="ts">
import { createVNode, defineComponent, PropType, VNode } from 'vue';
import { TextInfoJustifyContent, TextInfoMediaType, TextInfoTemplateType } from './typing';
import DefaultTextInfoValue from './DefaultTextInfoValue.vue';
import DefaultTextInfoLabel from './DefaultTextInfoLabel.vue';
import Icon from '../../../tags/Icon.vue';
import Picture from '../../../tags/Picture.vue';

export default defineComponent({
  name: 'DefaultTextInfo',
  inheritAttrs: false,
  props: {
    mediaType: {
      type: String as PropType<TextInfoMediaType>
    },
    templateType: {
      type: String as PropType<TextInfoTemplateType>
    },
    justifyContent: {
      type: String as PropType<string>
    },
    fieldWidget: {
      type: Object as PropType<Record<string, any>>
    },
    picIconWidget: {
      type: Object as PropType<Record<string, any>>
    },
    fieldInvisible: {
      type: Boolean,
      default: undefined
    },
    label: {
      type: String
    },
    labelFontSize: {
      type: String
    },
    layout: {
      type: String
    }
  },
  render() {
    const picIconProperties = this.picIconWidget;
    const childrenVNode = [] as VNode[];
    let picIconVNode;
    if (this.mediaType === TextInfoMediaType.ICON_TEXT) {
      picIconVNode = createVNode(Icon, picIconProperties);
    } else if (this.mediaType === TextInfoMediaType.PICTURE_TEXT) {
      picIconVNode = createVNode(Picture, picIconProperties);
    }
    let valueJustifyContent = TextInfoJustifyContent.CENTER;
    let labelJustifyContent = TextInfoJustifyContent.CENTER;
    if (this.mediaType === TextInfoMediaType.ONLY_TEXT) {
      if (this.justifyContent === TextInfoTemplateType.LEFT) {
        valueJustifyContent = TextInfoJustifyContent.START;
        labelJustifyContent = TextInfoJustifyContent.START;
      } else if (this.justifyContent === TextInfoTemplateType.RIGHT) {
        valueJustifyContent = TextInfoJustifyContent.END;
        labelJustifyContent = TextInfoJustifyContent.END;
      } else if (this.justifyContent === TextInfoTemplateType.JUSTIFY) {
        valueJustifyContent = TextInfoJustifyContent.END;
        labelJustifyContent = TextInfoJustifyContent.START;
      }
    }

    const labelVNode = createVNode(
      'div',
      { class: 'label', style: `justify-content: ${labelJustifyContent?.toLowerCase()}` },
      [
        createVNode(DefaultTextInfoLabel, {
          label: this.label,
          labelFontSize: this.labelFontSize,
          invisible: this.fieldInvisible
        })
      ]
    );
    const valueVNode = createVNode(
      'div',
      { class: 'value', style: `justify-content: ${valueJustifyContent?.toLowerCase()}` },
      [
        createVNode(DefaultTextInfoValue, {
          fieldWidget: { ...this.fieldWidget, justifyContent: valueJustifyContent },
          invisible: this.fieldInvisible
        })
      ]
    );
    const picIconDiv = createVNode('div', { class: 'pic-icon' }, [picIconVNode]);
    const valueDiv = createVNode('div', { class: 'value' }, [valueVNode]);
    if ([TextInfoMediaType.ICON_TEXT, TextInfoMediaType.PICTURE_TEXT].includes(this.mediaType!)) {
      if (this.templateType === TextInfoTemplateType.VAL_HIGHLIGHT) {
        childrenVNode.push(createVNode('div', { class: 'runtime-val-highlight' }, [picIconDiv, valueDiv]));
        childrenVNode.push(createVNode('div', { class: 'runtime-val-highlight-label' }, [labelVNode]));
      } else if (this.templateType === TextInfoTemplateType.PIC_HIGHLIGHT) {
        childrenVNode.push(picIconVNode);
        childrenVNode.push(createVNode('div', { class: 'runtime-picture-highlight' }, [labelVNode, valueVNode]));
      } else if (this.templateType === TextInfoTemplateType.PIC_VAL_HIGHLIGHT) {
        childrenVNode.push(
          createVNode('div', { class: 'runtime-pic-val-highlight' }, [
            createVNode('div', { class: 'pic-icon' }, [picIconVNode]),
            createVNode('div', { class: 'label-value' }, [valueVNode, labelVNode])
          ])
        );
      }
    } else if (this.mediaType === TextInfoMediaType.ONLY_TEXT) {
      childrenVNode.push(
        createVNode('div', { class: 'runtime-only-text' }, [
          createVNode('div', { class: `label-value ${this.layout?.toLowerCase()}` }, [labelVNode, valueVNode])
        ])
      );
    }

    return createVNode('div', {}, childrenVNode);
  }
});
</script>
<style lang="scss">
@mixin commonFlex($width) {
  display: flex;
  justify-content: center;
  align-items: center;
  width: $width;
}
.runtime-picture-highlight {
  display: flex;

  .value {
    @include commonFlex(50%);
  }

  .label {
    @include commonFlex(50%);
  }
}

.runtime-value-highlight {
  display: flex;

  .value {
    @include commonFlex(50%);
  }

  .label {
    @include commonFlex(50%);
  }
}

.runtime-val-highlight {
  display: flex;

  .pic-icon {
    @include commonFlex(50%);
  }

  .value {
    @include commonFlex(50%);
  }

  .label {
    @include commonFlex(50%);
  }
}

.runtime-val-highlight-label {
  @include commonFlex(100%);
}

.runtime-pic-val-highlight {
  display: flex;

  .pic-icon {
    @include commonFlex(50%);
  }

  .label-value {
    display: flex;
    width: 50%;
    flex-direction: column;
    align-items: center;
    margin: auto;

    .label {
      @include commonFlex(100%);
    }

    .value {
      @include commonFlex(100%);
    }
  }
}

.runtime-only-text {
  display: flex;

  .label-value {
    width: 100%;

    &.vertical {
      flex-direction: column;

      .label {
        display: flex;
      }

      .value {
        display: flex;
      }
    }

    &.horizontal {
      align-items: center;
      display: flex;

      .label {
        display: flex;
        width: 50%;
      }

      .value {
        width: 50%;
        display: flex;
      }
    }
  }
}
</style>
