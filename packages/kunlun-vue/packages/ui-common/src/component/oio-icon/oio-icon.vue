<script lang="ts">
import { CSSStyle, NumberHelper } from '@kunlun/shared';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { PropRecordHelper, StyleHelper } from '../../util';
import { IconTypeEnum, OioIconProps } from './props';

export default defineComponent({
  name: 'OioIcon',
  inheritAttrs: false,
  props: {
    ...OioIconProps
  },
  slots: ['default'],
  setup(props) {
    const rotateNumber = computed(() => NumberHelper.toNumber(props.rotate));

    const isImage = computed(() => {
      const value = props.icon || '';
      return value.includes('://') || value.includes(':\\');
    });

    return {
      rotateNumber,
      isImage
    };
  },
  render() {
    const { rotateNumber, isImage, type } = this;
    const iconClassList = [`${DEFAULT_PREFIX}-icon`];
    if (this.loading) {
      if (this.loadingReverse) {
        iconClassList.push(`${DEFAULT_PREFIX}-icon-loading-reverse`);
      } else {
        iconClassList.push(`${DEFAULT_PREFIX}-icon-loading`);
      }
    }
    const style = {} as CSSStyle;
    style[`--${DEFAULT_PREFIX}-icon-font-size`] = StyleHelper.px(this.size)!;
    style[`--${DEFAULT_PREFIX}-icon-color`] = this.color;

    if (!isNil(rotateNumber)) {
      style.transform = `rotate(${rotateNumber}deg)`;
    }
    if (isImage) {
      style.width = StyleHelper.px(this.size)!;
      return createVNode(
        'span',
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, iconClassList)
        },
        [
          createVNode('img', {
            style,
            src: this.icon
          })
        ]
      );
    }
    if (type === IconTypeEnum.unicode) {
      iconClassList.push(`${DEFAULT_PREFIX}-iconfont-font-class`);
      return createVNode('span', {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, iconClassList, style),
        innerHTML: this.icon
      });
    }
    iconClassList.push(`${DEFAULT_PREFIX}-icon-${this.icon}`);
    if (type === IconTypeEnum.font) {
      iconClassList.push(`${DEFAULT_PREFIX}-iconfont-font-class`, `${this.icon}`);
      return createVNode('i', PropRecordHelper.collectionBasicProps(this.$attrs, iconClassList, style));
    }
    return createVNode(
      'span',
      PropRecordHelper.collectionBasicProps(this.$attrs, iconClassList, style),
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          default: () => [
            createVNode(
              'svg',
              {
                class: [`${DEFAULT_PREFIX}-iconfont`, `${this.icon}`],
                role: 'img',
                'aria-label': 'pushpin',
                'aria-hidden': 'true'
              },
              {
                default: () => [
                  createVNode('use', {
                    'xlink:href': `#${this.icon}`
                  })
                ]
              }
            )
          ]
        }
      ])
    );
  }
});
</script>
