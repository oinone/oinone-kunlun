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
          <oio-spin :loading="state.loading" size="small">
            {{ statisticsValue }}
          </oio-spin>
          <oio-icon icon="oinone-caret-down-filled" />
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
  GroupStatisticsEnum,
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
import { VxeTableRowContext } from '@oinone/kunlun-vue-ui';
import {
  DateFormatMap,
  DateTimeFormatMap,
  DateUtil,
  defaultDateFormatKey,
  defaultFormat,
  defaultTimeFormatKey,
  ObjectUtils,
  OioIcon,
  OioSpin,
  TimeFormatMap
} from '@oinone/kunlun-vue-ui-antd';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import dayjs from 'dayjs';
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  name: 'DefaultGroupCell',
  props: {
    context: {
      type: Object as PropType<VxeTableRowContext>,
      default: () => ({})
    },
    model: {
      type: Object as PropType<RuntimeModel>,
      default: () => ({})
    },
    field: {
      type: Object as PropType<RuntimeModelField>,
      default: () => ({})
    },
    loadGroupStatistics: {
      type: Function as PropType<
        (
          row: ActiveRecord,
          field: RuntimeModelField,
          groupStatistics: GroupStatisticsEnum
        ) => Promise<string | undefined>
      >
    }
  },
  components: {
    OioIcon,
    OioSpin,
    ADropdown,
    AMenu,
    AMenuItem
  },
  setup(props) {
    const state = reactive({
      loading: false
    });

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
        (isDateTimeField(props.field) ||
          isDateField(props.field) ||
          isTimeField(props.field) ||
          isYearField(props.field)) &&
        !props.field.multi
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

      if (isNumberField(props.field) && !props.field.multi) {
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

    const normalizeDateTime = (v: string | number) => {
      if (typeof v === 'number') {
        return v;
      }
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

    const statisticsValue = ref(translateValueByKey('统计'));

    const convertStatisticsValue = (value: string | number): string => {
      switch (selectValue.value) {
        case GroupStatisticsEnum.COUNT:
          // 总数量
          return `${value} ${translateValueByKey('条记录')}`;
        case GroupStatisticsEnum.NOT_NULL:
          // 已填写
          return `${translateValueByKey('已填写')} ${value}`;
        case GroupStatisticsEnum.NULL:
          // 未填写
          return `${translateValueByKey('未填写')} ${value}`;
        case GroupStatisticsEnum.UNIQUE:
          // 唯一值
          return `${translateValueByKey('唯一值')} ${value}`;
        case GroupStatisticsEnum.NOT_NULL_PERCENT:
          // 已填写占比
          return `${translateValueByKey('已填写占比')} ${value}%`;
        case GroupStatisticsEnum.NULL_PERCENT:
          // 未填写占比
          return `${translateValueByKey('未填写占比')} ${value}%`;
        case GroupStatisticsEnum.UNIQUE_PERCENT:
          // 唯一值占比
          return `${translateValueByKey('唯一值占比')} ${value}%`;
        case GroupStatisticsEnum.EARLIEST_TIME:
          // 最早时间
          return `${translateValueByKey('最早时间')} ${dayjs(normalizeDateTime(value)).format(dateFormat.value)}`;
        case GroupStatisticsEnum.LATEST_TIME:
          return `${translateValueByKey('最晚时间')} ${dayjs(normalizeDateTime(value)).format(dateFormat.value)}`;
        case GroupStatisticsEnum.TIME_RANGE_DAY:
          return `${translateValueByKey('时间范围')} ${value} ${translateValueByKey('天')}`;
        case GroupStatisticsEnum.TIME_RANGE_MONTH:
          return `${translateValueByKey('时间范围')} ${value} ${translateValueByKey('月')}`;
        case GroupStatisticsEnum.TIME_RANGE_YEAR:
          return `${translateValueByKey('时间范围')} ${value}  ${translateValueByKey('年')}`;
        case GroupStatisticsEnum.SUM:
          // 求和
          return `${translateValueByKey('求和')} ${value}`;
        case GroupStatisticsEnum.AVERAGE:
          // 平均值
          return `${translateValueByKey('平均值')} ${value}`;
        case GroupStatisticsEnum.MEDIAN:
          // 中位数
          return `${translateValueByKey('中位数')} ${value}`;
        case GroupStatisticsEnum.MAX:
          // 最大值
          return `${translateValueByKey('最大值')} ${value}`;
        case GroupStatisticsEnum.MIN:
          // 最小值
          return `${translateValueByKey('最小值')} ${value}`;
        default:
          return translateValueByKey('统计');
      }
    };

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
      visible.value = false;
      nextTick(async () => {
        selectValue.value = val;
        if (val === GroupStatisticsEnum.NONE) {
          statisticsValue.value = translateValueByKey('统计');
          return;
        }
        try {
          state.loading = true;
          const result = await props.loadGroupStatistics?.(props.context.data, props.field, val);
          if (result) {
            statisticsValue.value = convertStatisticsValue(`${result}`);
          } else {
            statisticsValue.value = translateValueByKey('统计');
          }
        } finally {
          state.loading = false;
        }
      });
    };

    const getPopupContainer = (target: HTMLElement) => {
      return document.body;
    };

    onMounted(async () => {
      await nextTick();
      resourceDateTimeFormat.value = await queryResourceDateTimeFormat();
    });

    return {
      state,
      dropdownOptions,
      placement,
      statisticsValue,
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

    .oio-spin,
    .oio-spin-loading {
      width: 16px;
      height: 16px;
    }
  }
}
</style>
