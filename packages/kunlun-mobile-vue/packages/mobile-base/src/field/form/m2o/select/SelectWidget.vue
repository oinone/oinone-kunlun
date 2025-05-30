<template>
  <div class="mobile-form-single-select">
    <div class="readonly" v-if="innerReadonly && !innerDisabled">
      <oio-select label-in-value :title="fieldLabel" :value="currentValue" :options="optionList" />
    </div>

    <div v-else>
      <oio-select
        label-in-value
        :title="fieldLabel"
        :show-search="showSearch"
        :allow-clear="allowClear"
        :single-select-fast="false"
        :disabled="innerDisabled"
        :value="currentValue"
        :filter-option="false"
        :default-active-first-option="false"
        :options="optionList"
        :loading-more="loadMoreLoading"
        :finished="!showMoreButton"
        :placeholder="innerReadonly || innerDisabled ? '' : placeholder"
        :getPopupContainer="getPopupContainer"
        :dropdownClassName="dropdownClassName"
        @change="change"
        @search="search"
        @select="innerSelect"
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
        <!--        <template #menuItemSelectedIcon>-->
        <!--          <CheckOutlined />-->
        <!--        </template>-->
      </oio-select>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { OioSelect } from '@kunlun/vue-ui-mobile-vant';
import { relationSelectSetup, RelationSelectProps } from '../../../prop';
import { isNil } from 'lodash-es';

export default defineComponent({
  inheritAttrs: false,
  props: {
    ...RelationSelectProps,
    value: Object,
    currentValueLabel: String,
    handleSelectedValueLabel: Function
  },
  components: {
    OioSelect
  },
  setup(props) {
    const currentValue = computed(() => {
      if (props.value && props.value[props.relationFieldKey]) {
        return props.selectedOptions?.[0];
      }

      return null;
    });

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
          getOptionList(props.generatorSelectOption?.([props.value]) || []);
        }
      },
      { immediate: true }
    );

    return {
      ...relationSelectSetup(props),
      currentValue,
      optionList
    };
  }
});
</script>
