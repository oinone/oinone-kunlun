<template>
  <div class="mobile-form-multi-select" :class="[!allowClear && 'hide-clear']">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <oio-select label-in-value mode="multiple" :title="fieldLabel" :value="selectedOptions" :options="optionList" />
    </div>
    <div v-else>
      <oio-select
        ref="selectRef"
        mode="multiple"
        show-search
        label-in-value
        :title="fieldLabel"
        :allow-clear="allowClear"
        :disabled="innerDisabled"
        :value="selectedOptions"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :loading-more="loadMoreLoading"
        :finished="!showMoreButton"
        :placeholder="innerReadonly || innerDisabled ? '' : placeholder"
        :get-popup-container="getPopupContainer"
        :dropdown-class-name="dropdownClassName"
        :allow-select-all="allowSelectAll"
        @change="innerChange"
        @search="search"
        @blur="blur"
        @focus="focus"
        @load-more="loadMoreHandle"
      >
        <!--        <template #dropdownRender="{ menuNode: menu }">-->
        <!--          <v-nodes :vnodes="menu" />-->
        <!--          <div class="form-relation-select-dropdown-spin">-->
        <!--            <a-spin v-if="loadMoreLoading" size="small" />-->
        <!--          </div>-->
        <!--        </template>-->
      </oio-select>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { OioSelect } from '@kunlun/vue-ui-mobile-vant';
import { isNil } from 'lodash-es';
import { relationSelectSetup, RelationSelectProps } from '../../../prop';

export default defineComponent({
  inheritAttrs: false,
  props: {
    ...RelationSelectProps,
    value: {
      type: Array as PropType<Record<string, unknown>[]>
    }
  },
  components: {
    OioSelect
  },
  setup(props) {
    const optionList = ref<Record<string, unknown>[]>([]);
    const getOptionList = (options: Record<string, unknown>[]) => {
      optionList.value = [...options];
    };

    watch(
      () => props.options,
      () => {
        if (props.options && props.options.length) {
          getOptionList((props.options || []).filter((o) => !isNil(o.value)));
        } else {
          optionList.value = [];
        }
      },
      { immediate: true }
    );

    watch(
      () => props.value,
      () => {
        if (!props.isInitOptions && props.value) {
          getOptionList(props.generatorSelectOption?.(props.value) || []);
        }
      },
      { immediate: true }
    );
    return {
      ...relationSelectSetup(props),
      optionList
    };
  }
});
</script>
