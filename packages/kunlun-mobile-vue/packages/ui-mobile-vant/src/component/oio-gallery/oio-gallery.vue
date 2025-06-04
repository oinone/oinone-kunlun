<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioGalleryItem, OioGalleryProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import OioSpin from '../oio-spin/oio-spin.vue';
import { isNil, isObject, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, VNode, ref, provide } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioCol, OioRow } from '../oio-block';
import { OioEmptyData } from '../oio-empty';
import { OioGalleryInjectContext, OioGalleryInjectKey } from './index';

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
    OioRow,
    OioCol,
    OioSpin,
    OioEmptyData
  },
  props: {
    ...OioGalleryProps
  },
  slots: ['default', 'header', 'footer'],
  setup(props, { expose }) {
    const checkedRowMap = ref({} as { [key: string]: any });
    provide(OioGalleryInjectKey, {
      ...OioGalleryInjectContext,
      onRowCheckboxChange: ({ checked, row, rowIndex }: { checked: boolean; row: any; rowIndex: number }) => {
        const keys = Object.keys(checkedRowMap.value);
        if (checked) {
          if (!keys.includes(rowIndex + '')) {
            checkedRowMap.value[rowIndex] = row;
          }
        } else {
          if (keys.includes(rowIndex + '')) {
            delete checkedRowMap.value[rowIndex];
          }
        }
        props?.checkboxChange?.({ records: Object.values(checkedRowMap.value) });
      },
      activeRows: computed(() => props.activeRows || [])
    });

    const cols = computed(() => props.cols || 5);

    const flexBasic = computed(() => {
      return 100 / cols.value;
    });

    const flex = computed(() => {
      return `1 0 ${flexBasic.value}%`;
    });

    const colStyle = computed(() => {
      let style = {} as CSSStyleDeclaration;
      const width = `${flexBasic.value}%`;
      style.minWidth = width;
      style.maxWidth = width;
      if (isObject(props.itemStyle)) {
        style = {
          ...style,
          ...props.itemStyle
        };
      }
      return style;
    });

    return { flex, colStyle };
  },
  render() {
    const {
      default: defaultSlot,
      header: headerSlot,
      footer: footerSlot
    } = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default' },
      { origin: 'header' },
      { origin: 'footer' }
    ]);
    let children: VNode[] = [];
    if (headerSlot) {
      children = children.concat(headerSlot());
    }
    if (defaultSlot) {
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
        children.push(createVNode(OioRow, { gutter: this.gutter, wrap: true }, { default: () => rowChildren }));
      } else {
        children.push(createVNode(OioEmptyData));
      }
    }
    if (footerSlot) {
      children = children.concat(footerSlot());
    }
    const gallery = createVNode(
      'div',
      PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-gallery`]),
      { default: () => children }
    );
    if (isNil(this.loading)) {
      return gallery;
    }
    return createVNode(
      OioSpin,
      {
        spinning: this.loading,
        indicator: this.loadingIndicator,
        wrapperClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-gallery-wrapper`],
          CastHelper.cast(this.wrapperClassName)
        ).join(' ')
      },
      {
        default: () => [gallery]
      }
    );
  }
});
</script>
