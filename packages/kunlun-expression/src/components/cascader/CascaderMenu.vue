<template>
  <div class="ant-cascader-menu expression-designer-cascader-menu">
    <div class="expression-designer-cascader-menu-inner">
      <div class="expression-designer-cascader-menu-inner-header" v-if="$slots.header">
        <slot name="header" />
      </div>
      <div class="expression-designer-cascader-menu-inner-content">
        <div
          v-for="option in realOptions"
          :key="option.value"
          class="ant-cascader-menu-item ant-cascader-menu-item-expand"
          :class="{
            'ant-cascader-menu-item-group': option.optType === 'group',
            'ant-cascader-menu-item-grouped': option.optType !== 'group' && groupByStore,
            'ant-cascader-menu-item-active': option.selected,
            'ant-cascader-menu-item-expand': option.children && option.children.length,
            'ant-cascader-menu-item-disabled': option.show === 'INACTIVE'
          }"
          :title="
            option.optType === 'group'
              ? ''
              : `${option.label}${
                  option.show === 'INACTIVE' ? `${translateExpValue('已废弃')}` : getTtypeDisplayName(option)
                }`
          "
          role="menuitem"
          @mouseenter="onClickOption(option, true)"
          @click="onClickOption(option)"
        >
          <div class="ant-cascader-menu-item-content">
            <i
              v-if="option.optType !== 'group' && getTtypeIcon(option)"
              :class="getTtypeIcon(option)"
              class="iconfont menu-icon"
            />
            {{ option.label }}
          </div>
          <div class="ant-cascader-menu-item-expand-icon" v-if="showArrowRight(option)" @click.stop="loadData(option)">
            <span role="img" aria-label="right" class="anticon anticon-right">
              <svg
                focusable="false"
                class=""
                data-icon="right"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
                viewBox="64 64 896 896"
              >
                <path
                  d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"
                ></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
      <!--      暂不支持分页-->
      <div class="expression-designer-cascader-menu-inner-page" v-if="false">
        <oio-pagination
          v-if="pagination"
          simple
          size="small"
          :current="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          @change="onPaginationChange"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { ExpActiveType, ExpTtypeInfoMap, IExpSelectOption } from '../../types';
import { Pagination } from '@oinone/kunlun-engine';
import { OioPagination } from '@oinone/kunlun-vue-ui-antd';
import { isComplexTtype } from '@oinone/kunlun-meta';
import { translateExpValue } from '../../share';
import { groupBy } from 'lodash-es';

export default defineComponent({
  components: {
    OioPagination
  },
  name: 'expression-cascader-menu',
  props: {
    options: {
      type: Array as PropType<IExpSelectOption[]>,
      default: () => [] as IExpSelectOption[]
    },
    pagination: {
      type: Object as PropType<Pagination>
    },
    // 当此项为 true 时，点选每级菜单选项值都会发生变化
    changeOnSelect: {
      type: Boolean,
      default: false
    },
    onPaginationChange: Function,
    footerTitle: String,
    footerDesc: String,
    groupByStore: {
      type: Boolean,
      default: false
    }
  },
  emits: ['ClickOption', 'loadData'],
  setup(props, { emit }) {
    const onClickOption = (option, isMouse) => {
      if (option.show == ExpActiveType.INACTIVE || option.optType === 'group') {
        return;
      }
      props.options.forEach((a) => {
        a.selected = false;
      });
      option.selected = true;

      emit('ClickOption', option, isMouse);
    };

    function loadData(option) {
      if (option.show == ExpActiveType.INACTIVE) {
        return;
      }
      props.options.forEach((a) => {
        a.selected = false;
      });
      option.selected = true;
      emit('loadData', option);
    }

    function getTtypeIcon(item: IExpSelectOption) {
      return ExpTtypeInfoMap.get(item.ttype!)?.icon;
    }

    function getTtypeDisplayName(item: IExpSelectOption) {
      const displayName = ExpTtypeInfoMap.get(item.ttype!)?.displayName;
      return displayName ? `(${translateExpValue(displayName)})` : '';
    }

    function showArrowRight(option: IExpSelectOption) {
      if (option.optType === 'group') {
        return false;
      }
      if (option.children && option.children.length) {
        return true;
      }
      if (option.ttype && isComplexTtype(option.ttype!)) {
        if (option.isChildrenLoaded) {
          return false;
        }
        return true;
      }
      return false;
    }

    const realOptions = computed(() => {
      if (props.groupByStore) {
        const map = groupBy(props.options, (a) => !!a.store);
        const opts = [] as IExpSelectOption[];
        if (map.true && map.true.length) {
          opts.push({ label: translateExpValue('存储字段'), value: translateExpValue('存储字段'), optType: 'group' });
          opts.push(...map.true);
        }
        if (map.false && map.false.length) {
          opts.push({
            label: translateExpValue('非存储字段'),
            value: translateExpValue('非存储字段'),
            optType: 'group'
          });
          opts.push(...map.false);
        }
        return opts;
      }
      return props.options;
    });

    return {
      realOptions,
      onClickOption,
      loadData,
      getTtypeIcon,
      getTtypeDisplayName,
      showArrowRight,
      translateExpValue
    };
  }
});
</script>
