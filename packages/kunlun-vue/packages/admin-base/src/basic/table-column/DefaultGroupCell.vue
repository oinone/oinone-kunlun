<template>
  <div class="default-group-cell" ref="groupCellRef">
    <a-dropdown
      overlay-class-name="default-group-cell-dropdown"
      trigger="click"
      :visible="visible"
      :placement="placement"
      :get-popup-container="getPopupContainer"
      @visible-change="onVisibleChange"
    >
      <div
        class="default-group-cell-content"
        :class="[selectValue === GroupStatisticsEnum.NONE && 'default-group-cell-content-hide']"
      >
        <div class="default-group-cell-stander">
          {{ placeholder }}
          <oio-icon icon="oinone-caret-down-filled"></oio-icon>
        </div>
      </div>

      <template #overlay>
        <a-menu :selected-keys="[selectValue]">
          <a-menu-item v-for="option in dropdownOptions" :key="option.value" @click="onChangeValue(option.value)">
            {{ option.displayName }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script lang="ts">
import {
  ActiveRecord,
  IResourceDateTimeFormat,
  isDateField,
  isDateTimeField,
  isNumberField,
  isTimeField,
  isYearField,
  queryResourceDateTimeFormat,
  RuntimeModel,
  RuntimeModelField,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { GROUP_TREE_KEY, VxeTableRowContext } from '@oinone/kunlun-vue-ui';
import {
  DateFormatMap,
  DateTimeFormatMap,
  DateUtil,
  defaultDateFormatKey,
  defaultFormat,
  defaultTimeFormatKey,
  ObjectUtils,
  OioIcon,
  TimeFormatMap
} from '@oinone/kunlun-vue-ui-antd';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import dayjs from 'dayjs';
import { isNil, max, mean, min, round, sortBy, sum, uniq } from 'lodash-es';
import { computed, defineComponent, nextTick, onMounted, PropType, ref, watch } from 'vue';
import { GroupStatisticsEnum } from '../../service';

export default defineComponent({
  inheritAttrs: false,
  name: 'DefaultGroupCell',
  props: {
    context: {
      type: Object as PropType<VxeTableRowContext>,
      default: () => ({})
    },
    field: {
      type: Object as PropType<RuntimeModelField>,
      default: () => ({})
    },
    model: {
      type: Object as PropType<RuntimeModel>,
      default: () => ({})
    },
    groupViewFooterExpandControl: {
      type: Boolean,
      default: true
    },
    loadGroupData: {
      type: Function as PropType<(row: ActiveRecord) => Promise<ActiveRecord[]>>
    }
  },
  components: {
    OioIcon,
    ADropdown,
    AMenu,
    AMenuItem
  },
  setup(props) {
    // 后端返回的分组对应的数据源(懒加载的时候才会有)
    const backendGroupSource = ref();

    const dropdownOptions = computed(() => {
      const defaultOptions = [
        { displayName: translateValueByKey('不展示'), value: GroupStatisticsEnum.NONE },
        { displayName: translateValueByKey('记录总数'), value: GroupStatisticsEnum.COUNT },
        { displayName: translateValueByKey('未填写'), value: GroupStatisticsEnum.NULL },
        { displayName: translateValueByKey('已填写'), value: GroupStatisticsEnum.NOT_NULL },
        { displayName: translateValueByKey('唯一值'), value: GroupStatisticsEnum.UNIQUE },
        { displayName: translateValueByKey('未填写占比'), value: GroupStatisticsEnum.NULL_PERCENT },
        { displayName: translateValueByKey('已填写占比'), value: GroupStatisticsEnum.NOT_NULL_PERCENT },
        { displayName: translateValueByKey('唯一值占比'), value: GroupStatisticsEnum.UNIQUE_PERCENT }
      ];

      if (
        isDateTimeField(props.field) ||
        isDateField(props.field) ||
        isTimeField(props.field) ||
        isYearField(props.field)
      ) {
        const timeIOptions = [
          {
            displayName: translateValueByKey('最早时间'),
            value: GroupStatisticsEnum.EARLIEST_TIME
          },
          { displayName: translateValueByKey('最晚时间'), value: GroupStatisticsEnum.LATEST_TIME },
          { displayName: translateValueByKey('时间范围(日)'), value: GroupStatisticsEnum.TIME_RANGE_DAY },
          { displayName: translateValueByKey('时间范围(月)'), value: GroupStatisticsEnum.TIME_RANGE_MONTH },
          { displayName: translateValueByKey('时间范围(年)'), value: GroupStatisticsEnum.TIME_RANGE_YEAR }
        ];

        defaultOptions.push(...timeIOptions);
      }

      if (isNumberField(props.field)) {
        const timeIOptions = [
          {
            displayName: translateValueByKey('求和'),
            value: GroupStatisticsEnum.SUM
          },
          { displayName: translateValueByKey('平均值'), value: GroupStatisticsEnum.AVERAGE },
          { displayName: translateValueByKey('中位数'), value: GroupStatisticsEnum.MEDIAN },
          { displayName: translateValueByKey('最大值'), value: GroupStatisticsEnum.MAX },
          { displayName: translateValueByKey('最小值'), value: GroupStatisticsEnum.MIN }
        ];

        defaultOptions.push(...timeIOptions);
      }

      return defaultOptions;
    });

    const resourceDateTimeFormat = ref({} as IResourceDateTimeFormat);
    const placement = ref('bottom');
    const groupCellRef = ref<HTMLElement>();
    const visible = ref(false);
    const selectValue = ref(GroupStatisticsEnum.NONE);

    // 中位数
    const median = (arr: number[]): number => {
      if (!arr.length) return 0;
      // 从小到大排序
      const sorted = sortBy(arr);
      // 中间的数
      const mid = Math.floor(sorted.length / 2);
      // 如果数量是 奇数，中位数就是正中间的那个数
      // 如果数量是 偶数，中位数就是中间两个数的平均值
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    // 比例（保留一位小数）
    const formatRatio = (value: number) => round(value * 100, 1);

    // 平均值（保留两位小数）
    const formatMean = (value: number) => round(value, 2);

    const convertFormat = (format) => {
      if (isDateField(props.field)) {
        return DateFormatMap.get(format);
      }

      return DateTimeFormatMap.get(format);
    };

    const convertDateFormat = (format) => {
      return DateFormatMap.get(format);
    };

    const convertTimeFormat = (format) => {
      return TimeFormatMap.get(format);
    };

    const formatNumber = (value: any[]) => {
      const val = value.filter((v) => !isNaN(v));

      if (!val.length) {
        return [0];
      }

      return val;
    };

    const normalizeDateTime = (v: string) => {
      // 只有年份
      if (/^\d{4}$/.test(v)) {
        return dayjs(`${v}-01-01 00:00:00`).valueOf();
      }
      // 年月
      if (/^\d{4}-\d{2}$/.test(v)) {
        return dayjs(`${v}-01 00:00:00`).valueOf();
      }
      // 只有日期
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
        return dayjs(`${v} 00:00:00`).valueOf();
      }
      // 只有时间
      if (/^\d{2}:\d{2}:\d{2}$/.test(v)) {
        return dayjs(`1970-01-01 ${v}`).valueOf();
      }

      return dayjs(v).valueOf();
    };

    const dateFormat = computed(() => {
      const dateFormat =
        props.field.template?.dateFormat || isTimeField(props.field) ? undefined : defaultDateFormatKey;

      const timeFormat =
        props.field.template?.timeFormat || isDateField(props.field) ? undefined : defaultTimeFormatKey;

      const resourceDateFormat = ObjectUtils.toUpperSnakeCase(
        resourceDateTimeFormat.value.resourceDateFormat as unknown as Record<string, string>
      );

      const resourceTimeFormat = ObjectUtils.toUpperSnakeCase(
        resourceDateTimeFormat.value.resourceTimeFormat as unknown as Record<string, string>
      );

      const formatStr =
        props.field.template?.format ||
        [resourceDateFormat[dateFormat!], resourceTimeFormat[timeFormat!]].filter(Boolean).join(' ');

      const hasDateFormat = !isTimeField(props.field) && !isYearField(props.field);
      const hasTimeFormat = !isDateField(props.field) && !isYearField(props.field);

      let format = DateUtil.fetchDatetimeFormat(
        { hasDateFormat, hasTimeFormat },
        formatStr,
        dateFormat,
        timeFormat,
        convertFormat,
        convertDateFormat,
        convertTimeFormat
      );
      if (!format) {
        format = defaultFormat;
      }

      return format;
    });

    const getDataList = (list: ActiveRecord[]) => {
      const _list = [] as ActiveRecord[];

      list.forEach((item) => {
        if (!item[GROUP_TREE_KEY.CHILDREN_KEY]) {
          _list.push(item);
        } else {
          _list.push(...getDataList(item[GROUP_TREE_KEY.CHILDREN_KEY] as any));
        }
      });

      return _list;
    };

    const placeholder = computed(() => {
      // 如果是懒加载 & 接口还没返回数据 & 占位符不为空，则不展示
      if (
        !props.groupViewFooterExpandControl &&
        !backendGroupSource.value &&
        selectValue.value !== GroupStatisticsEnum.NONE
      ) {
        return;
      }

      const list = backendGroupSource.value
        ? backendGroupSource.value
        : getDataList(props.context.data[GROUP_TREE_KEY.CHILDREN_KEY] as ActiveRecord[]);

      // 总数量
      const total = list.length;
      // 值
      const values = list.map((item) => item[props.field.name]).filter((v) => !isNil(v)) as any[];
      // 已填写数量
      const filled = list.filter((item) => !isNil(item[props.field.name])).length;
      // 未填写数量
      const notFilled = total - filled;
      //唯一值数量
      const uniqueCount = uniq(values).length;

      switch (selectValue.value) {
        case GroupStatisticsEnum.COUNT: // 总数量
          return `${total}${translateValueByKey('条记录')}`;
        case GroupStatisticsEnum.NOT_NULL: // 已填写
          return `${translateValueByKey('已填写')}${filled}`;

        case GroupStatisticsEnum.NULL: // 未填写
          return `${translateValueByKey('未填写')}${notFilled}`;

        case GroupStatisticsEnum.UNIQUE: // 唯一值
          return `${translateValueByKey('唯一值')}${uniqueCount}`;

        case GroupStatisticsEnum.NOT_NULL_PERCENT: {
          // 已填写占比
          const val = total > 0 ? formatRatio(filled / total) : 0;
          return `${translateValueByKey('已填写占比')}${val}%`;
        }
        case GroupStatisticsEnum.NULL_PERCENT: {
          // 未填写占比
          const val1 = total > 0 ? formatRatio(notFilled / total) : 0;
          return `${translateValueByKey('未填写占比')}${val1}%`;
        }
        case GroupStatisticsEnum.UNIQUE_PERCENT: {
          // 唯一值占比
          const value = total > 0 ? formatRatio(uniqueCount / total) : 0;
          return `${translateValueByKey('唯一值占比')}${value}%`;
        }
        case GroupStatisticsEnum.EARLIEST_TIME: // 最早时间
          if (values.length) {
            const timestamps = values.map(normalizeDateTime);
            return `${translateValueByKey('最早时间')}${dayjs(min(timestamps)).format(dateFormat.value)}`;
          }
          break;
        case GroupStatisticsEnum.LATEST_TIME:
          if (values.length) {
            const d = dayjs;
            const timestamps = values.map((v) => d(v).valueOf());
            return `${translateValueByKey('最晚时间')}${dayjs(max(timestamps)).format(dateFormat.value)}`;
          }
          break;
        case GroupStatisticsEnum.TIME_RANGE_DAY:
          if (values.length) {
            const timestamps = values.map(normalizeDateTime);
            const minDate = dayjs(min(timestamps));
            const maxDate = dayjs(max(timestamps));

            return `${translateValueByKey('时间范围')}${maxDate.diff(minDate, 'day')}`;
          }
          break;
        case GroupStatisticsEnum.TIME_RANGE_MONTH:
          if (values.length) {
            const timestamps = values.map(normalizeDateTime);
            const minDate = dayjs(min(timestamps));
            const maxDate = dayjs(max(timestamps));

            return `${translateValueByKey('时间范围')}${maxDate.diff(minDate, 'month')}`;
          }
          break;
        case GroupStatisticsEnum.TIME_RANGE_YEAR:
          if (values.length) {
            const timestamps = values.map(normalizeDateTime);
            const minDate = dayjs(min(timestamps));
            const maxDate = dayjs(max(timestamps));

            return `${translateValueByKey('时间范围')}${maxDate.diff(minDate, 'year')}`;
          }
          break;
        case GroupStatisticsEnum.SUM: // 求和
          return sum(formatNumber(values));
        case GroupStatisticsEnum.AVERAGE: // 平均值
          return formatMean(mean(formatNumber(values)));
        case GroupStatisticsEnum.MEDIAN: // 中位数
          return median(formatNumber(values));
        case GroupStatisticsEnum.MAX: // 最大值
          return max(formatNumber(values));
        case GroupStatisticsEnum.MIN: // 最小值
          return min(formatNumber(values));
        case GroupStatisticsEnum.NONE:
        default:
          return translateValueByKey('统计');
      }

      return '';
    });

    const onVisibleChange = (val: boolean) => {
      const rect = groupCellRef.value?.getBoundingClientRect() || { bottom: 0 };

      if (val) {
        if (window.innerHeight - rect.bottom < 430) {
          placement.value = 'top';
        } else {
          placement.value = 'bottom';
        }
      }

      visible.value = val;
    };

    const onChangeValue = (val: GroupStatisticsEnum) => {
      selectValue.value = val;
      visible.value = false;
    };

    const getPopupContainer = (target: HTMLElement) => {
      return document.body;
    };

    watch(
      () => selectValue.value,
      async (val) => {
        // 分组一次性全部展开
        if (props.groupViewFooterExpandControl) {
          return;
        }

        const result = await props.loadGroupData?.(props.context.data);

        backendGroupSource.value = result;
      }
    );

    onMounted(async () => {
      await nextTick();
      resourceDateTimeFormat.value = await queryResourceDateTimeFormat();
    });

    return {
      dropdownOptions,
      placement,
      placeholder,
      groupCellRef,
      visible,
      selectValue,
      GroupStatisticsEnum,
      getPopupContainer,
      onVisibleChange,
      onChangeValue
    };
  }
});
</script>

<style lang="scss">
.oio-column {
  &:has(.default-group-cell) {
    .vxe-cell--tree-node,
    .vxe-tree-cell {
      height: 100%;
    }

    .vxe-cell,
    .oio-column-wrapper {
      height: 100%;
      padding-right: 0;
      display: block;
    }
  }
}

.default-group-compose-cell {
  height: 100%;
  display: flex;
  align-items: center;

  .default-group-compose-cell-content {
    flex: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &:hover {
    .default-group-cell-content {
      display: block;
    }
  }
}

.default-group-cell-dropdown {
  .ant-dropdown-menu-item-selected,
  .ant-dropdown-menu-submenu-title-selected {
    background: var(--oio-dropdown-background-hover);
    color: var(--oio-dropdown-color-hover);
  }
}

.default-group-cell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  .default-group-cell-content {
    padding: var(--oio-padding-md);
  }

  .default-group-cell-content-hide {
    display: none;
  }

  &:hover {
    .default-group-cell-content-hide {
      display: block;
    }
  }

  .default-group-cell-stander {
    cursor: pointer;

    display: flex;
    align-items: center;
    column-gap: 5px;
  }
}
</style>
