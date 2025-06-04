<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioPaginationProps } from '@oinone/kunlun-vue-ui-common';
import { Pagination as VanPagination } from 'vant';
import { isBoolean, isFunction } from 'lodash-es';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

const defaultShowTotal = (total: number): string => {
  const translate = Reflect.get(window, 'translate');
  return `${total} ${translate('条')}`;
};

export default defineComponent({
  name: 'OioPagination',
  components: {
    VanPagination
  },
  props: {
    ...OioPaginationProps,
    onChange: Function
  },
  slots: ['pageSizeOption'],
  emits: ['update:current-page', 'update:page-size'],
  render() {
    const { showTotal } = this;
    let finalShowTotal: ((total: number, range) => string) | undefined;
    if (isBoolean(showTotal)) {
      if (showTotal) {
        finalShowTotal = defaultShowTotal;
      }
    } else if (isFunction(showTotal)) {
      finalShowTotal = showTotal;
    }
    const props: Record<string, unknown> = {
      ...this.$attrs,
      modelValue: this.currentPage,
      mode: 'simple',
      itemsPerPage: this.pageSize,
      totalItems: this.total,
      showPageSize: this.pageSize || this.defaultPageSize,
      forceEllipses: true,
      disabled: this.disabled,
      'onUpdate:modelValue': (val) => this.$emit('update:current-page', val),
      class: [`${DEFAULT_PREFIX}-pagination-nav`]
    };
    const totalNode = createVNode(
      'div',
      { class: [`${DEFAULT_PREFIX}-pagination-total`] },
      `${this.total}${this.$translate('条')}`
    );
    return createVNode(
      'div',
      { class: StringHelper.append([`${DEFAULT_PREFIX}-pagination`], CastHelper.cast(this.$attrs.class)) },
      [
        this.showTotal ? totalNode : null,
        createVNode(
          VanPagination,
          {
            ...props,
            onChange: (currentPage: number) => {
              this.onChange?.(currentPage, props?.showPageSize);
            }
          },
          this.$slots
        )
      ]
    );
  }
});
</script>
