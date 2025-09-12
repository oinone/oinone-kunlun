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
          <div class="empty" v-if="isEmpty">
            {{ translateExpValue('没有可选数据') }}
          </div>
        </slot>
        <div v-if="searchKeyWords === '' && !isEmpty">
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
        <div v-if="searchKeyWords !== '' && !isEmpty">
          <expression-cascader-menu
            :options="searchFilterOptions"
            :pagination="pagination"
            :on-pagination-change="onPaginationChange"
            @click-option="searchOptionClick"
          />
        </div>
      </div>
      <div class="expression-designer-cascader-footer" v-if="footerTitle || footerDesc">
        <div class="expression-designer-cascader-footer-title" v-if="footerTitle">{{ footerTitle }}</div>
        <div class="expression-designer-cascader-footer-desc" v-if="footerDesc">{{ footerDesc }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onUpdated, PropType, ref, watch } from 'vue';
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
    },
    searchKeyWords: {
      type: String,
      default: ''
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    const selectedValues = ref([] as string[]);

    // 搜索过滤-仅前端
    const searchFilterOptions = ref([]);

    const optionsList = computed(() => {
      const list = [] as IExpSelectOption[][];
      appendOptions(props.options, list, props.maxDepth);
      return list;
    });

    const isEmpty = computed(() => {
      return (
        !props.options ||
        !props.options.length ||
        (props.searchKeyWords !== '' && searchFilterOptions.value.length === 0)
      );
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

    watch(
      () => props.searchKeyWords,
      (newValue) => {
        if (newValue !== '') {
          searchFilterOptions.value = optionsSearchWalk(newValue, props.options);
        }
      }
    );

    /**
     * @param keyword 搜索关键字
     * @param optionsList option列表
     * @param walkList 祖先列表-保存根节点到当前节点的所有节点
     * @param res 返回值数组
     * @desc 遍历所有叶子节点，找到包含keyword的options返回
     * @returns Record<string,any>[]
     */
    function optionsSearchWalk(keyword, optionsList, parent = null, walkList = [], res = []) {
      if (optionsList === []) {
        return [];
      }
      optionsList.forEach((ch) => {
        if (!ch.children) {
          if (
            ch.label.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
            ch.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
          ) {
            res.push(ch);
          }
          return;
        }
        const tempObj = {
          ...ch,
          parent
        };
        walkList.push(ch.label);
        if (
          ch?.children?.length === 0 &&
          (ch.label.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
            ch.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1)
        ) {
          const displayLabel = walkList.join(' / ');
          res.push({
            ...ch,
            label: displayLabel,
            parent
          });
        } else {
          optionsSearchWalk(keyword, tempObj.children, tempObj, walkList, res);
        }
        walkList.pop();
      });
      return res;
    }

    async function buildStartOptions(options, deep: number = 0, loadOptionsList = []) {
      if (deep >= 3) {
        return;
      }
      for (let i = 0; i < options.length; i++) {
        const tempList = [...loadOptionsList, options[i]];
        await props.loadData?.(tempList);
        if (options[i]?.children !== undefined && options[i]?.children?.length !== 0) {
          await buildStartOptions(options[i].children, deep + 1, tempList);
        }
      }
    }

    function buildSubmitOptions(targetOption) {
      let res = [];
      let ob = targetOption;
      while (ob !== null) {
        res.push(ob);
        ob = ob.parent;
      }
      res = res.reverse();
      return res;
    }

    function searchOptionClick(option: IExpSelectOption, isMouse = false) {
      if (isMouse || isViewDataKeywords(option.value as string)) {
        return;
      }

      const selectedOptions = buildSubmitOptions(option);
      selectedValues.value = selectedOptions.map((a) => a.value as string);

      emit('update:value', selectedValues.value);
      emit('change', selectedValues.value, selectedOptions);
    }

    onUpdated(() => {
      buildStartOptions(optionsList.value[0], 0, []);
    });
    return {
      optionsList,
      selectedValues,
      searchFilterOptions,
      isEmpty,
      onClickOption,
      onLoadData,
      translateExpValue,
      searchOptionClick
    };
  }
});
</script>
