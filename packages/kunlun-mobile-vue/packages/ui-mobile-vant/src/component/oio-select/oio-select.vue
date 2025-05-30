<template>
  <div :class="classList" :style="style" @click="showPopup(true)">
    <template v-if="!readonly">
      <oio-custom-input
        v-if="mode === 'single' || !multiSelectLabel"
        :class="`${DEFAULT_PREFIX}-input van-field__control`"
        readonly
        :value="multiSelectLabel"
        :placeholder="placeholder"
      />
      <div v-else :class="`${DEFAULT_PREFIX}-selected-items`">
        <div class="selected-item" v-for="(item, index) in selectedOptions" :key="index">
          <div class="selected-item-field">{{ item.label }}</div>
          <i class="iconfont oinone-guanbi" style="color: var(--oio-primary)" @click.stop="removeHandle(item)" />
        </div>
      </div>
      <van-popup
        v-if="!readonly && !disabled"
        v-model:show="show"
        :class="popupClassName"
        round
        :style="{ maxHeight: '90%' }"
        position="bottom"
        safe-area-inset-bottom
        :teleport="popupTeleport"
        @close="cancelHandle"
      >
        <div class="van-picker">
          <div class="van-picker__toolbar">
            <button
              v-if="!selectFast"
              type="button"
              class="van-picker__cancel van-haptics-feedback"
              @click.stop="cancelHandle"
            >
              {{ $translate('取消') }}
            </button>
            <div class="van-picker__title van-ellipsis" :style="`${selectFast ? 'max-width: 100%;width: 100%;' : ''}`">
              {{ title }}
            </div>
            <button
              v-if="!selectFast"
              type="button"
              class="van-picker__confirm van-haptics-feedback"
              @click.stop="confirmHandle"
            >
              {{ $translate('确认') }}
            </button>
          </div>
          <div :class="`van-picker__columns ${DEFAULT_PREFIX}-select-content`">
            <slot>
              <div :class="`${DEFAULT_PREFIX}-select-content-group`">
                <div style="flex: 1">
                  <van-cell-group inset v-if="showSearch" :class="`${DEFAULT_PREFIX}-select-search-input`">
                    <van-field
                      class="search-keyword-input"
                      v-model="searchKeyword"
                      label=""
                      :placeholder="searchInputPlaceholder"
                    >
                      <template #right-icon>
                        <i
                          class="van-badge__wrapper van-icon van-icon-clear van-field__clear"
                          style="margin-right: 0"
                          v-if="searchKeyword.length"
                          @click="clearSearchKeyword"
                        ></i>
                        <i class="van-badge__wrapper search-icon iconfont oinone-sousuo" @click="onRefresh"></i>
                      </template>
                    </van-field>
                  </van-cell-group>
                </div>
                <span
                  class="allow-select-all"
                  :class="[didSelectAll && 'allow-select-all-active']"
                  @click="onToggleAll"
                  v-if="showSelectAllAction"
                >
                  <oio-icon icon="oinone-quanxuan"></oio-icon>
                  {{ $translate('全选') }}
                </span>
              </div>
              <div :class="`${DEFAULT_PREFIX}-select-list-container`">
                <div v-if="loading && realOptions.length === 0" :class="`${DEFAULT_PREFIX}-select-loading-wrapper`">
                  <van-loading type="spinner" />
                </div>
                <template v-else>
                  <van-pull-refresh
                    v-model="refreshing"
                    @refresh="onRefresh(false, true)"
                    v-if="realOptions && realOptions.length"
                  >
                    <van-list
                      v-model:loading="loading"
                      :finished="showSearch ? finished : true"
                      :offset="loadMoreOffset"
                      finished-text=""
                      @load="onLoad"
                    >
                      <van-checkbox-group v-model="checkedList" ref="checkboxGroupRef">
                        <van-cell-group inset>
                          <van-cell
                            v-for="(option, index) in realOptions"
                            clickable
                            :class="{ checked: checkedList.includes(option.value) }"
                            :key="option.value"
                            :title="option.label"
                            @click="toggle(index, option.value)"
                          >
                            <template #right-icon>
                              <van-checkbox
                                :name="option.value"
                                :ref="(el) => (checkboxRefs[index] = el)"
                                @click="toggle(index, option.value)"
                              >
                                <template #icon="props">
                                  <van-icon v-if="props.checked" name="success" />
                                </template>
                              </van-checkbox>
                            </template>
                          </van-cell>
                        </van-cell-group>
                      </van-checkbox-group>
                    </van-list>
                  </van-pull-refresh>
                  <div v-else>
                    <slot name="empty-view">
                      <van-empty :description="emptyViewText" />
                    </slot>
                  </div>
                </template>
              </div>
            </slot>
          </div>
        </div>
      </van-popup>
    </template>
    <div class="readonly" v-else-if="readonly && multiSelectLabel">{{ multiSelectLabel }}</div>
    <div class="readonly empty-value" v-else-if="readonly && !multiSelectLabel">-</div>
  </div>
</template>
<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import {
  defaultSelectProperties,
  fillSelectItemProperties,
  OioSelectProps,
  SelectItem,
  SelectProperties,
  OioIcon
} from '@kunlun/vue-ui-common';
import {
  Loading as VanLoading,
  Field as VanField,
  Popup as VanPopup,
  PullRefresh as VanPullRefresh,
  List as VanList,
  Cell as VanCell,
  CellGroup as VanCellGroup,
  CheckboxGroup as VanCheckboxGroup,
  Checkbox as VanCheckbox,
  Icon as VanIcon,
  Empty as VanEmpty
} from 'vant';

import { isNil, isObject } from 'lodash-es';
import { computed, defineComponent, nextTick, onBeforeUpdate, PropType, ref, watch } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { callInterceptor } from '../../utils';
import OioCustomInput from '../oio-input/oio-custome-input.vue';

function isSingle(mode: string) {
  return mode === 'single';
}

export default defineComponent({
  name: 'OioSelect',
  components: {
    VanLoading,
    VanField,
    VanPopup,
    VanPullRefresh,
    VanList,
    VanCell,
    VanCellGroup,
    VanCheckboxGroup,
    VanCheckbox,
    VanIcon,
    VanEmpty,
    OioCustomInput,
    OioIcon
  },
  inheritAttrs: false,
  props: {
    ...OioSelectProps,
    loadingMore: Boolean,
    finished: Boolean,
    title: String,
    allowSelectAll: {
      type: Boolean,
      default: false
    },
    // 选中后就完成交互，不需要再点"确认"按钮
    singleSelectFast: {
      type: Boolean,
      default: true
    },
    searchOnShow: {
      type: Boolean,
      default: true
    },
    searchInputPlaceholder: {
      type: String,
      default: ''
    },
    emptyViewText: {
      type: String,
      default: ''
    },
    loadMoreOffset: {
      type: Number,
      default: 20
    },
    style: {
      type: Object as PropType<CSSStyleDeclaration>,
      default: () => ({} as CSSStyleDeclaration)
    },
    beforeConfirm: {
      type: Function as PropType<(() => Promise<boolean>) | (() => boolean)>
    },
    popupTeleport: {
      type: [String, HTMLElement],
      default: 'body'
    }
  },
  slots: ['dropdownRender', 'removeIcon', 'clearIcon', 'suffixIcon', 'menuItemSelectedIcon'],
  emits: ['update:value', 'change', 'search', 'load-more', 'close', 'focus'],
  setup(props, { emit, attrs, expose }) {
    const searchKeyword = ref('');
    const loading = ref(false);
    // const finished = ref(false);
    const refreshing = ref(false);
    const realProperties = computed<SelectProperties>(() => {
      return {
        ...defaultSelectProperties,
        ...(props.properties || {})
      };
    });

    const realOptions = computed<SelectItem<unknown>[]>(() => {
      const options: SelectItem<unknown>[] = [];
      props.options?.forEach((value, index) => {
        const option = fillSelectItemProperties(value, index, realProperties.value, props.customFillProperties);
        if (option) {
          options.push(option);
        }
      });
      return options;
    });

    const selectedOptions = ref([] as any[]);
    function processValue(value) {
      return isObject(value) ? (value as any)[defaultSelectProperties.valueProp] : value;
    }
    function createSelectedOptions() {
      if (isNil(props.value)) {
        return [];
      }
      const valueList = isSingle(props.mode) || !Array.isArray(props.value) ? [props.value] : props.value;
      return valueList.map((a) => {
        const find = realOptions.value.find((b) => processValue(a) == processValue(b));
        return find || (isObject(a) ? a : { [defaultSelectProperties.valueProp]: a });
      });
    }

    const multiSelectLabel = computed(() => {
      return selectedOptions.value.map((a) => a[defaultSelectProperties.labelProp]).join(',');
    });

    const didSelectAll = computed(() => checkedList.value.length === realOptions.value.length);

    const showSelectAllAction = computed(() => props.allowSelectAll && !isSingle(props.mode));

    function removeHandle(item: SelectItem<unknown>) {
      const findIndex = checkedList.value.findIndex((a) => a == item.value);
      checkedList.value.splice(findIndex, 1);
      const selectedList = selectedOptions.value.filter((v) => checkedList.value.includes(v.value));
      if (isSingle(props.mode)) {
        emit('change', selectedList && selectedList[0]);
        emit('update:value', selectedList && selectedList[0]);
      } else {
        emit('change', selectedList);
        emit('update:value', selectedList);
      }
    }

    function setSearchKey(value: string) {
      searchKeyword.value = value;
    }

    function clearSearchKeyword() {
      searchKeyword.value = '';
      onRefresh();
    }

    function onLoad() {
      // console.log('onLoad');
      if (props.finished || !props.showSearch) {
        return;
      }
      // 异步更新数据
      emit('load-more');
      // FIXME 临时方案 loading状态需要支持外部控制
      // setTimeout(() => {
      //   if (refreshing.value) {
      //     refreshing.value = false;
      //   }
      //   // 加载状态结束
      //   loading.value = false;
      // }, 2000);
    }

    function onRefresh(forceSearch = false, reload = false) {
      // console.log('onRefresh');
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      loading.value = true;
      searchHandle(forceSearch, reload);
      // setTimeout(() => {
      //   refreshing.value = false;
      //   loading.value = false;
      // }, 2000);
    }

    function searchHandle(forceSearch = false, reload = false) {
      emit('search', searchKeyword.value, forceSearch, reload);
    }

    const selectFast = computed(() => props.singleSelectFast && isSingle(props.mode));

    watch(
      () => props.loadingMore,
      (val) => {
        if (refreshing.value && !val) {
          refreshing.value = false;
        }
        loading.value = val;
      }
    );

    watch(
      () => props.value,
      () => {
        selectedOptions.value = createSelectedOptions();
      },
      {
        deep: true,
        immediate: true
      }
    );

    const checkedList = ref([] as any[]);
    const checkboxGroupRef = ref(null);
    const checkboxRefs = ref([]);

    const onToggleAll = () => {
      (checkboxGroupRef.value! as any).toggleAll(!didSelectAll.value);
    };

    const toggle = (index, value) => {
      const currentValueHasChecked = !checkedList.value.includes(value);

      if (isSingle(props.mode)) {
        (checkboxGroupRef.value! as any).toggleAll(false);
      }
      nextTick(() => {
        if (checkboxRefs.value[index]) {
          (checkboxRefs.value[index] as any).toggle(currentValueHasChecked);
        }

        if (selectFast.value) {
          confirmHandle();
        }
      });
    };

    function cancelHandle() {
      searchKeyword.value = '';
      show.value = false;
      refreshing.value = false;
      loading.value = false;
      emit('close');
    }

    function confirmHandle() {
      callInterceptor(props.beforeConfirm, {
        done() {
          show.value = false;

          const selectedList = realOptions.value.filter((v) => checkedList.value.includes(v.value));
          if (isSingle(props.mode)) {
            emit('change', selectedList && selectedList[0]);
            emit('update:value', selectedList && selectedList[0]);
          } else {
            // 把之前选中的，且不在本次搜索结果中出现且选中的数据合并进去

            selectedOptions.value
              .filter((a) => {
                return !realOptions.value.find((r) => r.value === a.value);
              })
              .forEach((a) => {
                if (!selectedList.find((b) => a.value === b.value)) {
                  selectedList.unshift(a);
                }
              });
            emit('change', selectedList);
            emit('update:value', selectedList);
          }
        },
        canceled() {}
      });
    }

    onBeforeUpdate(() => {
      checkboxRefs.value = [];
    });

    const popupClassName = StringHelper.append(
      [`${DEFAULT_PREFIX}-select-popup`],
      CastHelper.cast(props.dropdownClassName)
    ).join(' ');

    const classList = computed(() => {
      return StringHelper.append([`${DEFAULT_PREFIX}-select`], CastHelper.cast(attrs?.class));
    });

    const show = ref(false);

    function showPopup(value = true) {
      if (!props.disabled && !props.readonly) {
        show.value = value;
      }
      if (value) {
        checkedList.value = selectedOptions.value.map((a) => a.value!);
      }
      emit('focus');
      nextTick(() => {
        props.searchOnShow && onRefresh(true);
      });
    }

    expose({
      showPopup,
      setSearchKey
    });

    return {
      checkboxGroupRef,
      searchKeyword,
      clearSearchKeyword,
      cancelHandle,
      confirmHandle,
      toggle,
      checkedList,
      checkboxRefs,
      loading,
      onLoad,
      onRefresh,
      searchHandle,
      DEFAULT_PREFIX,
      refreshing,
      classList,
      popupClassName,
      realProperties,
      realOptions,
      selectedOptions,
      multiSelectLabel,
      show,
      selectFast,
      showPopup,
      removeHandle,
      onToggleAll,
      didSelectAll,
      showSelectAllAction
    };
  }
});
</script>
