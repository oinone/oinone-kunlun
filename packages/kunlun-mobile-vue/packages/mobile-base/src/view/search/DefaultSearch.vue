<template>
  <div
    v-if="showBaseSearch || showSort || topCateFieldOptions.length"
    :class="`${DEFAULT_PREFIX}-default-search-view`"
    @click.stop=""
  >
    <div class="main-filter">
      <div class="main-filter-tabs">
        <van-tabs v-model:active="topCateActive" :duration="0" @change="onChangeTopCate">
          <van-tab v-for="cate in topCateFieldOptions" :title="cate.displayName" :key="cate.name"></van-tab>
        </van-tabs>
      </div>
      <div v-if="showBaseSearch || showSort" class="main-filter-icons">
        <oio-icon v-if="showBaseSearch" class="filter-icon" icon="oinone-filter" @click="showSearchPopup = true" />
        <oio-icon v-if="showSort" class="filter-icon" icon="oinone-paixu" @click="showSortPopup = true" />
      </div>
    </div>
    <div class="secondary-filter" v-if="secondCateFieldOptions && secondCateFieldOptions.length">
      <div
        :class="[secondCateActive === index && 'active', 'secondary-action']"
        :key="index"
        v-for="(item, index) in secondCateFieldOptions"
        @click="onChangeSecondaryCate(index)"
      >
        {{ item.displayName }}
      </div>
    </div>
  </div>

  <van-popup
    class="search-sort-popup"
    v-model:show="showSortPopup"
    closeable
    position="bottom"
    safe-area-inset-bottom
    :style="{ height: '60%' }"
  >
    <div class="search-sort-popup-title">
      <oio-icon class="filter-icon" icon="oinone-paixu" color="rgba(0, 0, 0)" size="16" />
      {{ translateValueByKey('排序') }}
    </div>
    <template v-if="sortType === 'TIME'">
      <div class="search-sort-popup-actions" v-if="sortType === 'TIME'">
        <div
          class="sort-popup-action"
          :class="{ active: isSelectedSort(item) }"
          :key="index"
          v-for="(item, index) in sortOptions"
          @click="singleSelectSortHandle(item)"
        >
          {{ item.label }}
          <i class="iconfont oinone-lujing" />
        </div>
        <oio-empty-data v-if="!sortOptions.length" />
      </div>
    </template>
    <template v-else>
      <div class="search-sort-popup-header">
        <div class="selected-sort-list">
          <div class="selected-sort-item" v-for="(item, index) in selectedSortList" :key="index">
            <div class="selected-sort-item-field">{{ item.label }}</div>
            <div class="selected-sort-item-direction">
              <div class="selected-sort-item-direction-inner">
                <i class="iconfont oinone-arrow-up" :class="{ active: item.value.direction === 'ASC' }" />
                <i class="iconfont oinone-xiala" :class="{ active: item.value.direction === 'DESC' }" />
              </div>
            </div>
            <i class="iconfont oinone-guanbi" @click="removeSortHandle(item)" />
          </div>
        </div>
      </div>
      <div class="search-sort-popup-actions">
        <div class="sort-popup-action" :key="index" v-for="(item, index) in multiSelectFields">
          {{ item.label || item.displayName }}
          <div class="sort-direction-select">
            <div
              class="sort-direction-item"
              :class="{ active: isSelectedSort(createSortSelectOption(item, 'ASC')) }"
              @click="multiSelectSortHandle(createSortSelectOption(item, 'ASC'))"
            >
              {{ translateValueByKey('正序') }}
            </div>
            <div
              class="sort-direction-item"
              :class="{ active: isSelectedSort(createSortSelectOption(item, 'DESC')) }"
              @click="multiSelectSortHandle(createSortSelectOption(item, 'DESC'))"
            >
              {{ translateValueByKey('倒序') }}
            </div>
          </div>
        </div>
        <oio-empty-data v-if="!multiSelectFields.length" />
      </div>
      <div :class="`${DEFAULT_PREFIX}-default-sort-action-bar`" v-if="sortType !== 'TIME'">
        <oio-button @click="clearSort"><van-icon name="replay" />{{ translateValueByKey('重置排序') }}</oio-button>
        <oio-button type="primary" @click="createSortBody">{{ translateValueByKey('确定') }}</oio-button>
      </div>
    </template>
  </van-popup>
  <div v-show="false">
    <base-search v-if="!showSearchPopup" v-bind="searchProps" />
  </div>
  <van-popup
    class="search-sort-popup"
    v-model:show="showSearchPopup"
    closeable
    position="bottom"
    safe-area-inset-bottom
    :style="{ height: '90%' }"
  >
    <div class="search-sort-popup-title">
      <oio-icon
        style="vertical-align: baseline"
        class="filter-icon"
        icon="oinone-filter"
        color="rgba(0, 0, 0)"
        size="16"
      />
      {{ translateValueByKey('搜索') }}
    </div>
    <div class="search-sort-popup-actions">
      <base-search v-bind="searchProps" />
    </div>
  </van-popup>

  <van-popup
    v-model:show="showKeywordSearchPopup"
    teleport="body"
    class="mobile-keyword-search-popup"
    position="bottom"
    style="width: 100%; height: 100%"
    safe-area-inset-top
    safe-area-inset-bottom
    @close="closeKeywordSearchPopup"
  >
    <van-search
      v-model="keyword"
      show-action
      :placeholder="`${translateValueByKey('输入')}${keywordPlaceholder}${translateValueByKey('搜索')}`"
      @search="onKeywordSearch"
      @cancel="onKeywordCancel"
    />
    <van-tabs
      v-if="showKeywordSearchCate"
      v-model:active="keywordModelFieldActive"
      @change="onChangeKeywordModelFieldActive"
    >
      <van-tab v-for="(field, index) in keywordModelFields" :title="field.label" :key="index"></van-tab>
    </van-tabs>
    <div class="mobile-keyword-search-popup-view">
      <!--      <oio-empty-data v-if="!domainRsql && !dataLength" description="输入关键字快速搜索" />-->
      <oio-empty-data
        v-if="!dataLength && !keywordSearching"
        :description="domainRsql ? translateValueByKey('暂无搜索结果') : translateValueByKey('输入关键字快速搜索')"
      />
      <div class="keyword-search-view" v-show="dataLength">
        <slot name="keywordSearchView" />
      </div>
    </div>
  </van-popup>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import {
  Icon as VanIcon,
  Popup as VanPopup,
  Search as VanSearch,
  Tab as VanTab,
  Tabs as VanTabs,
  Toast as VanToast
} from 'vant';
import { DslDefinition } from '@oinone/kunlun-dsl';
import { IListSortEnum, OioFormProps, OioIcon } from '@oinone/kunlun-vue-ui-common';
import { DEFAULT_PREFIX, OioButton, OioEmptyData } from '@oinone/kunlun-vue-ui-mobile-vant';
import { IModel, IModelField, isComplexTtype, isDateTtype, isNumberTtype, ModelFieldType } from '@oinone/kunlun-meta';
import { EDirection, ISort } from '@oinone/kunlun-service';
import { Condition, DefaultLogicalOperator } from '@oinone/kunlun-request';
import BaseSearch from './BaseSearch.vue';
import { UserSearchPrefer } from '../../typing';
import { CATE_ALL_NAME } from './types';
import { ActiveRecord, RuntimeModelField } from '@oinone/kunlun-engine';
import { translateValueByKey } from '@oinone/kunlun-engine';

interface ISelectOption {
  value: ISort;
  label: string;
  [key: string]: any;
}

enum IKeywordSearchTypeEnum {
  MIXED = 'MIXED',
  CATE = 'CATE'
}

export default defineComponent({
  name: 'DefaultSearch',
  components: { VanTab, VanTabs, VanIcon, VanPopup, VanSearch, BaseSearch, OioIcon, OioButton, OioEmptyData },
  inheritAttrs: false,
  props: {
    ...OioFormProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
    invisible: {
      type: Boolean
    },
    formData: {
      type: Object,
      default: () => {}
    },
    isExpand: {
      type: Boolean,
      default: false
    },
    onExpand: {
      type: Function as PropType<(expand: boolean) => void>
    },
    onSearch: {
      type: Function as PropType<() => void>
    },
    onReset: {
      type: Function as PropType<() => void>
    },
    translate: {
      type: Function as PropType<(key: string) => string>
    },
    showSearchPrefer: {
      type: Boolean,
      default: false
    },
    searchPreferOptions: {
      type: Array as PropType<UserSearchPrefer[]>
    },
    selectedPrefer: {
      type: Object as PropType<UserSearchPrefer>
    },
    onLoadSearchPreferOptions: {
      type: Function
    },
    onCreateSearchPrefer: {
      type: Function
    },
    onUpdateSearchPrefer: {
      type: Function
    },
    onRemoveSearchPrefer: {
      type: Function
    },
    onSelectSearchPrefer: {
      type: Function
    },
    onUnselectSearchPrefer: {
      type: Function
    },
    reloadActiveRecords: {
      type: Function
    },
    sortList: {
      type: Array as PropType<ISort[]>
    },
    onSort: {
      type: Function as PropType<(sorts: ISort[]) => void>
    },
    metadataModel: {
      type: Object as PropType<IModel>,
      default: () => {}
    },
    showKeywordSearchPopup: Boolean,
    changeKeywordSearchPopup: Function,
    changeKeywordSearch: Function,
    onKeywordSearch: Function,
    keywordSearching: Boolean,
    changeDataLength: Function,
    dataLength: {
      type: Number,
      default: 0
    },
    topCateModelField: {
      type: Object as PropType<RuntimeModelField>
    },
    secondCateModelField: {
      type: Object as PropType<RuntimeModelField>
    },
    topCateFieldOptions: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    secondCateFieldOptions: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    cateFields: {
      type: Array as PropType<string[]>
    },
    onCateSearch: {
      type: Function
    }
  },
  setup(props, context) {
    const showSearchPopup = ref(false);
    const showSortPopup = ref(false);

    const showBaseSearch = computed(() => {
      const widgets = (props.template as any)?.widgetList || props.template?.widgets;
      const searchFieldsWidget = widgets?.find((a) => a.name === 'searchFields');
      return !searchFieldsWidget ? widgets?.length > 0 : searchFieldsWidget?.widgets?.length > 0;
    });

    const sortType = computed(() => {
      return (props?.template as any)?.sortType as unknown as IListSortEnum;
    });

    function createUniqueModelFields() {
      const fieldNames = [] as string[];
      const modelFields = props?.metadataModel?.modelFields?.filter((a) => a.label || a.displayName);
      const list = [] as IModelField[];
      modelFields?.forEach((a) => {
        if (!fieldNames.includes(a.name)) {
          list.push(a);
          fieldNames.push(a.name);
        }
      });
      return list;
    }

    const timeFields = computed(() => {
      return createUniqueModelFields()?.filter((a) => isDateTtype(a.ttype));
    });

    const sortOptions = computed(() => {
      const list = [] as ISelectOption[];
      timeFields.value?.forEach((field) => {
        list.push({
          label: `${field.label || field.displayName} ${translateValueByKey('最早')}`,
          value: { sortField: field.name, direction: EDirection.ASC }
        });
        list.push({
          label: `${field.label || field.displayName} ${translateValueByKey('最新')}`,
          value: { sortField: field.name, direction: EDirection.DESC }
        });
      });
      return list;
    });

    function createSortSelectOption(field: any, direction: EDirection) {
      return { label: `${field.label || field.displayName}`, value: { sortField: field.name, direction } };
    }

    // 用户ID、整数、浮点数、金额、布尔型、文本、日期时间、年份、日期、时间、数据字典、手机、邮箱类型的字段
    const multiFields = computed(() => {
      return createUniqueModelFields()?.filter(
        (a) =>
          isDateTtype(a.ttype) ||
          isNumberTtype(a.ttype) ||
          [
            ModelFieldType.Enum,
            ModelFieldType.Boolean,
            ModelFieldType.String,
            ModelFieldType.Phone,
            ModelFieldType.Email
          ].includes(a.ttype!)
      );
    });

    const indexFields = computed(() => {
      const indexes = props?.metadataModel.indexes || ([] as string[]);
      const uniques = props?.metadataModel.uniques || ([] as string[]);
      const fields = [] as string[];
      [...indexes, ...uniques].forEach((indexGroup) => {
        const strArray = Array.isArray(indexGroup) ? indexGroup : (indexGroup || '').split(',');
        strArray.forEach((field) => {
          if (!fields.includes(field)) {
            fields.push(field);
          }
        });
      });
      return createUniqueModelFields()?.filter((a) => fields.includes(a.name) || a.index || a.unique);
    });

    const multiSelectFields = computed(() => {
      if (sortType.value === IListSortEnum.INDEX) {
        return indexFields.value;
      }
      if (sortType.value === IListSortEnum.MULTI) {
        return multiFields.value;
      }
      const modelFields = createUniqueModelFields();
      return modelFields?.filter((field) => {
        if (field.invisible) {
          return false;
        }
        // 非存储字段、复杂字段不允许排序
        if (field.store === false || isComplexTtype(field.ttype)) {
          return false;
        }
        return (field as any).template?.sortable === true;
      });
    });

    const selectedSortList = ref([] as ISelectOption[]);
    const sortBody = ref([] as ISort[]);
    function createSortBody() {
      showSortPopup.value = false;
      sortBody.value = selectedSortList.value.map((a) => a.value);
      props?.onSort?.(sortBody.value);
    }

    function singleSelectSortHandle(sortOption: ISelectOption) {
      selectedSortList.value = isSelectedSort(sortOption) ? [] : [sortOption];
      createSortBody();
    }

    function multiSelectSortHandle(sortOption: ISelectOption) {
      const existIndex = selectedSortList.value.findIndex(
        (a) => JSON.stringify(a.value) === JSON.stringify(sortOption)
      );
      if (existIndex > -1) {
        selectedSortList.value.splice(existIndex, 1);
      } else {
        const existFieldIndex = selectedSortList.value.findIndex(
          (a) => a.value.sortField === sortOption.value.sortField
        );
        if (existFieldIndex > -1) {
          selectedSortList.value.splice(existFieldIndex, 1, sortOption);
        } else {
          selectedSortList.value.push(sortOption);
        }
      }
    }

    function isSelectedSort(sortOption: ISelectOption) {
      return !!selectedSortList.value.find((a) => JSON.stringify(a.value) === JSON.stringify(sortOption.value));
    }

    function removeSortHandle(sortOption: ISelectOption) {
      const existIndex = selectedSortList.value.findIndex(
        (a) => JSON.stringify(a.value) === JSON.stringify(sortOption.value)
      );
      if (existIndex > -1) {
        selectedSortList.value.splice(existIndex, 1);
      }
    }

    function clearSort() {
      selectedSortList.value = [];
    }

    const showSort = computed(() => {
      if (sortType.value === IListSortEnum.TIME) {
        return !!sortOptions.value.length;
      }
      return !!multiSelectFields.value?.length;
    });

    watch(
      () => props.sortList,
      () => {
        initSelectedSorts(props.sortList!);
      },
      {
        immediate: true,
        deep: true
      }
    );

    function initSelectedSorts(sortList: ISort[]) {
      const fields = createUniqueModelFields();
      sortList = sortList || ([] as ISort[]);
      const list = [] as ISelectOption[];
      sortList.forEach((sort) => {
        const find = fields.find((b) => b.name === sort.sortField);
        if (find) {
          list.push(createSortSelectOption(find, sort.direction));
        }
      });
      selectedSortList.value = list;
    }

    const topCateActive = ref(0);
    const secondCateActive = ref(0);

    const onChangeTopCate = () => {
      onCateSearch();
    };
    const onChangeSecondaryCate = (index: number) => {
      secondCateActive.value = index;
      onCateSearch();
    };

    function onCateSearch() {
      const formData = {};
      if (props.topCateModelField) {
        const topCateName = props.topCateFieldOptions[topCateActive.value]?.name;
        if (topCateName !== CATE_ALL_NAME) {
          formData[props.topCateModelField.name] = props.topCateModelField.multi ? [topCateName] : topCateName;
        } else {
          formData[props.topCateModelField.name] = null;
        }
      }
      if (props.secondCateModelField) {
        const secondCateName = props.secondCateFieldOptions[secondCateActive.value]?.name;
        if (secondCateName !== CATE_ALL_NAME) {
          formData[props.secondCateModelField.name] = props.secondCateModelField.multi
            ? [secondCateName]
            : secondCateName;
        } else {
          formData[props.secondCateModelField.name] = null;
        }
      }
      props?.onCateSearch?.(formData);
    }

    const resetCateActive = (searchBody: ActiveRecord) => {
      if (props.topCateModelField) {
        let newTopName = searchBody?.[props.topCateModelField.name];
        newTopName = Array.isArray(newTopName) ? newTopName?.[0] : newTopName;
        topCateActive.value = newTopName ? props.topCateFieldOptions.findIndex((a) => a.name === newTopName) : 0;
      }
      if (props.secondCateModelField) {
        const newSecondName = searchBody?.[props.secondCateModelField.name];
        secondCateActive.value = newSecondName
          ? props.secondCateFieldOptions.findIndex((a) => a.name === newSecondName)
          : 0;
      }
    };

    watch(
      [() => props.formData, () => props.topCateModelField, () => props.secondCateModelField],
      () => {
        resetCateActive({ ...props.formData });
      },
      { immediate: true, deep: true }
    );

    // keyword search
    const keyword = ref('');
    const keywordModelFieldActive = ref(0);

    const keywordTtypes = [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email];
    const keywordSearchType = computed(() => {
      const { keywordSearchType: keywordSearchTypeEnum = IKeywordSearchTypeEnum.MIXED } = (props?.template ||
        {}) as any;
      return keywordSearchTypeEnum;
    });
    const keywordModelFields = computed((): IModelField[] => {
      const { keywordFields = '' } = (props?.template || {}) as any;
      let list = [] as IModelField[];
      if (keywordFields) {
        const keywordFieldList = keywordFields.split(',');
        list = createUniqueModelFields()?.filter(
          (a) => a && keywordTtypes.includes(a.ttype) && keywordFieldList.includes(a.name)
        )!;
      }
      return list || ([] as IModelField[]);
    });

    const keywordPlaceholder = computed(() => {
      return keywordModelFields.value?.map((a) => a.label).join(translateValueByKey('或'));
    });

    watch(
      keywordModelFields,
      () => {
        props?.changeKeywordSearch?.(!!keywordModelFields.value.length);
      },
      {
        immediate: true,
        deep: true
      }
    );

    const showKeywordSearchCate = computed(
      () => keywordSearchType.value === IKeywordSearchTypeEnum.CATE && keywordModelFields.value.length > 1
    );

    const domainRsql = ref('');
    function onKeywordSearch(keywordStr?: string) {
      if (!keyword.value) {
        domainRsql.value = '';
      } else {
        const rsqlList = [] as string[];
        if (keywordSearchType.value === IKeywordSearchTypeEnum.CATE) {
          const activeField = keywordModelFields.value[keywordModelFieldActive.value];
          if (activeField) {
            rsqlList.push(new Condition(activeField.name).like(keyword.value).toString());
          }
        } else {
          keywordModelFields.value.forEach((field) => {
            rsqlList.push(new Condition(field.name).like(keyword.value).toString());
          });
        }
        domainRsql.value = rsqlList.join(` ${DefaultLogicalOperator.OR} `);
      }
      props.onKeywordSearch?.(domainRsql.value);
    }

    function onKeywordCancel() {
      props.changeKeywordSearchPopup?.(false);
    }

    function onChangeKeywordModelFieldActive(index) {
      onKeywordSearch();
    }

    watch(
      () => props.keywordSearching,
      (keywordSearching) => {
        if (keywordSearching) {
          VanToast.loading({
            message: `${translateValueByKey('搜索中')}...`,
            forbidClick: true
          });
        } else {
          VanToast.clear();
        }
      }
    );

    function closeKeywordSearchPopup() {
      domainRsql.value = '';
      props.changeDataLength?.(0);
    }

    const searchProps = computed(() => {
      const onSearch = () => {
        showSearchPopup.value = false;
        props.onSearch?.();
      };
      const onReset = () => {
        showSearchPopup.value = false;
        props.onReset?.();
      };
      return { ...props, ...context.attrs, onSearch, onReset };
    });

    return {
      showBaseSearch,
      keyword,
      domainRsql,
      keywordModelFieldActive,
      onChangeKeywordModelFieldActive,
      closeKeywordSearchPopup,
      keywordSearchType,
      keywordModelFields,
      keywordPlaceholder,
      onKeywordSearch,
      onKeywordCancel,
      showKeywordSearchCate,
      sortType,
      multiFields,
      indexFields,
      multiSelectFields,
      singleSelectSortHandle,
      multiSelectSortHandle,
      removeSortHandle,
      createSortSelectOption,
      createSortBody,
      clearSort,
      showSort,
      selectedSortList,
      sortBody,
      isSelectedSort,
      searchProps,
      topCateActive,
      secondCateActive,
      showSearchPopup,
      showSortPopup,
      sortOptions,
      onChangeTopCate,
      onChangeSecondaryCate,
      DEFAULT_PREFIX,
      translateValueByKey
    };
  }
});
</script>
