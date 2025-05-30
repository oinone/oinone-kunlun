<script lang="ts">
import { CastHelper, CSSStyle, StringHelper } from '@kunlun/shared';
import { OioGalleryItem, OioGalleryProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { isNil, isObject, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioCol, OioRow } from '../oio-block';
import { OioEmptyData } from '../oio-empty';
import { OioSpin } from '../oio-spin';

function generatorKey(data: Record<string, unknown>, itemKey: string): string | undefined {
  const key = data[itemKey];
  if (isString(key)) {
    return key;
  }
  return undefined;
}

export default defineComponent({
  name: 'OioGallery',
  inheritAttrs: false,
  components: {
    OioCol,
    OioEmptyData,
    OioRow,
    OioSpin
  },
  props: {
    ...OioGalleryProps
  },
  slots: ['default', 'header', 'footer'],
  setup(props) {
    const cols = computed(() => props.cols || 4);

    const gutter = computed(() => {
      if (props.gutter == null) {
        return '16,16';
      }
      return props.gutter;
    });

    const flexBasic = computed(() => {
      return 100 / cols.value;
    });

    const flex = computed(() => {
      return `1 0 ${flexBasic.value}%`;
    });

    const rowStyle = computed(() => {
      const style = {} as CSSStyle;
      if (cols.value === 1) {
        style.flexDirection = 'column';
        style.alignItems = 'center';
      }
      return style;
    });

    const colStyle = computed(() => {
      let style = {} as CSSStyle;
      const defaultWidth = `${flexBasic.value}%`;
      style.minWidth = defaultWidth;
      style.maxWidth = defaultWidth;
      if (isObject(props.itemStyle)) {
        const hasWidth = !isNil(props.itemStyle?.width);
        const hasMinWidth = !isNil(props.itemStyle?.minWidth);
        const hasMaxWidth = !isNil(props.itemStyle?.maxWidth);
        if (hasWidth) {
          style.minWidth = CastHelper.cast(null);
          style.maxWidth = CastHelper.cast(null);
        } else if (hasMaxWidth && !hasMinWidth) {
          style.minWidth = CastHelper.cast(null);
        }
        style = {
          ...style,
          ...props.itemStyle
        };
      }
      return style;
    });

    return {
      gutter,
      flex,
      rowStyle,
      colStyle
    };
  },
  render() {
    const {
      default: defaultSlot,
      header: headerSlot,
      footer: footerSlot
    } = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      { origin: 'header' },
      { origin: 'footer' }
    ]);
    const children: VNode[] = [];
    if (headerSlot) {
      children.push(createVNode('div', { class: `${DEFAULT_PREFIX}-gallery-header` }, headerSlot()));
    }
    const rowChildren: VNode[] = [];
    this.list?.forEach((data: Record<string, unknown>, index) => {
      const key = generatorKey(data, this.itemKey);
      const colChildren = defaultSlot({ key, data, index } as OioGalleryItem);
      rowChildren.push(
        createVNode(
          OioCol,
          {
            key,
            flex: this.flex,
            class: StringHelper.append([`${DEFAULT_PREFIX}-gallery-item`], CastHelper.cast(this.itemClassName)),
            style: this.colStyle
          },
          {
            default: () => colChildren
          }
        )
      );
    });
    if (rowChildren.length) {
      children.push(
        createVNode(
          OioRow,
          { class: `${DEFAULT_PREFIX}-gallery-content`, gutter: this.gutter, wrap: true, style: this.rowStyle },
          { default: () => rowChildren }
        )
      );
    } else {
      children.push(createVNode(OioEmptyData, { class: `${DEFAULT_PREFIX}-gallery-content` }));
    }
    if (footerSlot) {
      children.push(createVNode('div', { class: `${DEFAULT_PREFIX}-gallery-footer` }, footerSlot()));
    }
    const gallery = createVNode(
      'div',
      PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-gallery`]),
      children
    );
    if (isNil(this.loading)) {
      return gallery;
    }
    return createVNode(
      OioSpin,
      {
        class: 'default-main-view-spin',
        loading: this.loading,
        loadingIndicator: this.loadingIndicator,
        wrapperClassName: StringHelper.append([`${DEFAULT_PREFIX}-gallery-wrapper`], this.wrapperClassName)
      },
      {
        default: () => [gallery]
      }
    );
  }
});
</script>
