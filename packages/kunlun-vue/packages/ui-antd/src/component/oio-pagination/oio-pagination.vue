<script lang="ts">
import { OioPaginationProps, PatchFlags, PropRecordHelper } from '@kunlun/vue-ui-common';
import { Pagination as APagination } from 'ant-design-vue';
import { isBoolean, isFunction, toString } from 'lodash-es';
import { computed, createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioPagination',
  components: {
    APagination
  },
  props: {
    ...OioPaginationProps
  },
  slots: ['pageSizeOption'],
  emits: ['update:current-page', 'update:page-size', 'change'],
  setup(props, context) {
    const virtualTotal = computed(() => {
      const pageSize = props.pageSize || props.defaultPageSize;
      const currentPage = props.currentPage || props.defaultCurrentPage;
      const totalPage = props.total / pageSize;
      if (totalPage >= 1) {
        const diffPage = totalPage - currentPage;
        if (diffPage <= -1) {
          return currentPage * pageSize;
        }
      }
      return props.total;
    });

    const onUpdateCurrentPage = (val) => {
      context.emit('update:current-page', val);
    };

    const onUpdatePageSize = (val) => {
      context.emit('update:page-size', val);
    };

    const onChange = (currentPage: number, pageSize: number) => {
      context.emit('change', currentPage, pageSize);
    };

    return {
      virtualTotal,

      onUpdateCurrentPage,
      onUpdatePageSize,
      onChange
    };
  },
  render() {
    const { showTotal, showLastPage, onUpdateCurrentPage, onUpdatePageSize, onChange } = this;
    let finalShowTotal: ((total: number, range) => string) | undefined;
    if (isBoolean(showTotal)) {
      if (showTotal) {
        finalShowTotal = (total: number): string => {
          return `${total} ${this.$translate('条')}`;
        };
      }
    } else if (isFunction(showTotal)) {
      finalShowTotal = showTotal;
    }
    const className = `${DEFAULT_PREFIX}-pagination`;
    const props: Record<string, unknown> = {
      ...PropRecordHelper.collectionBasicProps(this.$attrs, [className, !showLastPage ? `${className}-simple` : '']),
      current: this.currentPage,
      defaultCurrent: this.defaultCurrentPage,
      pageSize: this.pageSize,
      defaultPageSize: this.defaultPageSize,
      pageSizeOptions: this.pageSizeOptions?.map((v) => toString(v)),
      total: this.virtualTotal,
      showTotal: (_, range) => finalShowTotal?.(this.total, range),
      showSizeChanger: this.showSizeChanger,
      showQuickJumper: this.showJumper,
      disabled: this.disabled,
      'onUpdate:current': onUpdateCurrentPage,
      'onUpdate:page-size': onUpdatePageSize,
      onChange,
      onShowSizeChange: onChange
    };
    let { pageSizeOption } = this.$slots;
    if (!pageSizeOption) {
      pageSizeOption = (option: { value: string }) => [
        createVNode('span', {}, `${option.value} ${this.$translate('条/页')}`, PatchFlags.TEXT)
      ];
    }
    props.buildOptionText = pageSizeOption;
    if (this.showJumper) {
      let locale: Record<string, unknown> | undefined = props.locale as Record<string, unknown>;
      if (!locale) {
        locale = {};
        props.locale = locale;
      }
      if (!locale.jump_to) {
        locale.jump_to = this.$translate('跳至');
      }
      if (!locale.page) {
        locale.page = this.$translate('页');
      }
    }
    return createVNode(APagination, props);
  }
});
</script>
