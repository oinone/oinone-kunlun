<script lang="ts">
import { ActiveRecord, ActiveRecordExtendKeys, Pagination } from '@kunlun/engine';
import { RowContext } from '../../ui';
import { CSSStyle } from '@kunlun/shared';
import {
  CommonGutterType,
  DEFAULT_PREFIX,
  OioGallery,
  OioGalleryItem,
  OioPagination,
  StyleHelper
} from '@kunlun/vue-ui-mobile-vant';
import { PropRecordHelper } from '@kunlun/vue-ui-common';
import { createVNode, defineComponent, PropType, VNode } from 'vue';
import { Icon as VanIcon } from 'vant';
import { DEFAULT_VIEW_CLASS } from '../../ui/theme';

export default defineComponent({
  name: 'DefaultGallery',
  components: {
    OioGallery,
    OioPagination
  },
  inheritAttrs: false,
  props: {
    dataSource: {
      type: Array as PropType<ActiveRecord[]>
    },
    cols: {
      type: Number
    },
    gutter: {
      type: [Number, String, Array, Object] as PropType<CommonGutterType>
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object as PropType<Pagination>
    },
    itemWidth: {
      type: Number
    },
    itemMinWidth: {
      type: Number
    },
    itemMaxWidth: {
      type: Number
    },
    selectMode: {
      type: String
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    onPaginationChange: {
      type: Function
    }
  },
  render() {
    const defaultSlot = PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default;
    const children: VNode[] = [];
    const galleryProps: Record<string, unknown> = {
      list: this.dataSource || [],
      itemKey: ActiveRecordExtendKeys.DRAFT_ID,
      loading: this.loading,
      cols: this.cols,
      gutter: this.gutter,
      wrapperClassName: `${DEFAULT_PREFIX}-scrollbar`
    };
    const itemStyle = {} as CSSStyle;
    let { itemWidth: widthVal, itemMinWidth: minWidthVal, itemMaxWidth: maxWidthVal } = this;
    if (widthVal) {
      widthVal += 24;
      const width = StyleHelper.px(widthVal);
      if (width) {
        itemStyle.width = width;
      }
    }
    if (minWidthVal) {
      minWidthVal += 24;
      const minWidth = StyleHelper.px(minWidthVal);
      if (minWidth) {
        itemStyle.minWidth = minWidth;
      }
    }
    if (maxWidthVal) {
      maxWidthVal += 24;
      const maxWidth = StyleHelper.px(maxWidthVal);
      if (maxWidth) {
        itemStyle.maxWidth = maxWidth;
      }
    }
    galleryProps.itemStyle = itemStyle;
    children.push(
      createVNode(
        'div',
        { class: ['default-gallery-content', this.showPagination && 'default-gallery-show-pagination'] },
        {
          default: () => [
            createVNode(OioGallery, galleryProps, {
              default: (item: OioGalleryItem) => {
                return defaultSlot({
                  key: item.key,
                  data: item.data,
                  index: item.index
                } as RowContext);
              }
            })
          ]
        }
      )
    );
    if (this.showPagination && this.pagination) {
      children.push(
        createVNode(
          'div',
          { class: 'default-gallery-pagination' },
          {
            default: () => [
              createVNode(
                OioPagination,
                {
                  currentPage: this.pagination?.current,
                  pageSize: this.pagination?.pageSize,
                  total: this.pagination?.total,
                  showTotal: true,
                  showJumper: true,
                  onChange: this.onPaginationChange,
                  onShowSizeChange: this.onPaginationChange
                },
                {
                  'prev-text': () => createVNode(VanIcon, { name: 'arrow-left' }),
                  'next-text': () => createVNode(VanIcon, { name: 'arrow' })
                }
              )
            ]
          }
        )
      );
    }
    return createVNode('div', { class: `mobile-default-gallery ${DEFAULT_VIEW_CLASS}` }, { default: () => children });
  }
});
</script>
