<template>
  <div class="expression-designer-cascader">
    <div class="expression-designer-cascader-menus ant-cascader-menus-placement-bottomLeft">
      <div class="expression-designer-cascader-header" v-if="$slots.header">
        <slot name="header" />
      </div>
      <div
        class="expression-designer-cascader-content"
        :class="{ 'expression-designer-cascader-content-single': optionsList.length === 1 }"
      >
        <slot name="empty">
          <div class="empty" v-if="!options || !options.length">
            {{ translateExpValue('没有可选数据') }}
          </div>
        </slot>
        <expression-cascader-menu
          v-for="(opts, index) in optionsList"
          :options="opts"
          :pagination="pagination"
          :on-pagination-change="onPaginationChange"
          :group-by-store="groupByStore"
          @click-option="(option, isMouse) => onClickOption(option, index, isMouse)"
          @load-data="(option) => onLoadData(option, index)"
        />
      </div>
      <div class="expression-designer-cascader-footer" v-if="footerTitle || footerDesc">
        <div class="expression-designer-cascader-footer-title" v-if="footerTitle">{{ footerTitle }}</div>
        <div class="expression-designer-cascader-footer-desc" v-if="footerDesc">{{ footerDesc }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { isNil } from 'lodash-es';
import { Pagination } from '@oinone/kunlun-engine';
import { ExpressionKeyword } from '@oinone/kunlun-expression';
import { isComplexTtype } from '@oinone/kunlun-meta';
import { translateExpValue } from '../../share';
import ExpressionCascaderMenu from './CascaderMenu.vue';
import { IExpSelectOption } from '../../types';

function appendOptions(options: IExpSelectOption[], optionsList: IExpSelectOption[][], maxDepth = 5) {
  if (!isNil(maxDepth) && maxDepth > 0 && optionsList?.length > maxDepth) {
  }
  optionsList.push(options);
  const children = getActiveOptionChildren(options);
  if (children.length) {
    appendOptions(children, optionsList, maxDepth);
  }
}

function getActiveOptionChildren(options) {
  const activeOption = options && options.find((a) => a.selected);
  return activeOption && activeOption.children ? activeOption.children : [];
}

function buildSelectedOptions(option: IExpSelectOption, currentDepth: number, optionsList: IExpSelectOption[][]) {
  const selectedOptions = [] as IExpSelectOption[];
  const length = optionsList.length;
  for (let i = 0; i < length; i++) {
    if (i > currentDepth) {
      break;
    }
    if (i < currentDepth) {
      const option = optionsList?.[i]?.find((a) => a.selected);
      option && selectedOptions.push(option);
    } else {
      selectedOptions.push(option);
    }
  }
  return selectedOptions;
}

// 界面设计器 计算公式 的第一级为视图数据对象本身，不支持直接选中，FIXME 建议逻辑迁到业务方
function isViewDataKeywords(field: string) {
  return [
    ExpressionKeyword.activeRecords,
    ExpressionKeyword.activeRecord,
    ExpressionKeyword.rootRecord,
    ExpressionKeyword.openerRecord
  ].includes(field as ExpressionKeyword);
}

export default defineComponent({
  name: 'expression-designer-cascader',
  components: { ExpressionCascaderMenu },
  props: {
    value: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    pagination: {
      type: Object as PropType<Pagination>,
      default: () => ({ current: 1 })
    },
    // 当此项为 true 时，点选每级菜单选项值都会发生变化
    changeOnSelect: {
      type: Boolean,
      default: false
    },
    onPaginationChange: Function,
    options: {
      type: Array as PropType<IExpSelectOption[]>,
      default: () => []
    },
    canSelectedComplexField: {
      type: Boolean,
      default: false
    },
    // 异步加载子节点的方法
    loadData: Function as PropType<(selectedOptions: IExpSelectOption[]) => void>,
    footerTitle: String,
    footerDesc: String,
    // 最大可选层级，小于1的表示不限制
    maxDepth: {
      type: Number,
      default: 0
    },
    groupByStore: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    const selectedValues = ref([] as string[]);

    const optionsList = computed(() => {
      const list = [] as IExpSelectOption[][];
      appendOptions(props.options, list, props.maxDepth);
      return list;
    });

    async function onLoadData(option: IExpSelectOption, currentDepth: number) {
      if (!props.changeOnSelect) {
        onClickOption(option, currentDepth);
        return;
      }
      const selectedOptions = buildSelectedOptions(option, currentDepth, optionsList.value);
      if (option.isChildrenLoaded === false) {
        await props.loadData?.(selectedOptions);
      }
    }

    async function onClickOption(option: IExpSelectOption, currentDepth: number, isMouse = false) {
      const selectedOptions = buildSelectedOptions(option, currentDepth, optionsList.value);
      selectedValues.value = selectedOptions.map((a) => a.value as unknown as string);
      if (option.isChildrenLoaded === false) {
        await props.loadData?.(selectedOptions);
      }

      if (isMouse || isViewDataKeywords(option.value as string)) {
        return;
      }

      const canSelectedComplexField =
        isComplexTtype(option.ttype!) && option.references && props.canSelectedComplexField;

      if (props.changeOnSelect || currentDepth === optionsList.value.length - 1 || canSelectedComplexField) {
        emit('update:value', selectedValues.value);
        emit('change', selectedValues.value, selectedOptions);
      }
    }
    watch(
      () => props.value,
      () => {
        if (props.value) {
          selectedValues.value = props.value as string[];
        }
      },
      { deep: true }
    );
    return {
      optionsList,
      selectedValues,
      onClickOption,
      onLoadData,
      translateExpValue
    };
  }
});
</script>
