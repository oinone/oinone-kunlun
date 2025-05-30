import { PropType } from 'vue';

export const OioPaginationProps = {
  currentPage: {
    type: Number
  },
  defaultCurrentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number
  },
  defaultPageSize: {
    type: Number,
    default: 15
  },
  pageSizeOptions: {
    type: Array as PropType<(number | string)[]>,
    default: [10, 15, 30, 50, 100, 200]
  },
  total: {
    type: Number,
    default: 0
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  showTotal: {
    type: [Boolean, Function] as PropType<boolean | ((total: number, range) => string)>,
    default: false
  },
  showJumper: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showLastPage: {
    type: Boolean,
    default: true
  }
};
