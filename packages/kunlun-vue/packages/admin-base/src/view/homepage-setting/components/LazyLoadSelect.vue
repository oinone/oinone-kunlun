<template>
  <MultiSelect
    v-if="isMulti"
    v-model:value="value"
    :class="class"
    :options="options"
    :placeholder="placeholder"
    :showSearch="true"
    :search="search"
    :loadMoreLoading="loadMoreLoading"
    :loadMore="loadMore"
    :change="change"
    :dropdownVisibleChange="dropdownVisibleChange"
    :relationFieldKey="relationFieldKey"
    :blur="blur"
  ></MultiSelect>
  <SingleSelect
    v-else
    v-model:value="value"
    :allow-clear="allowClear"
    :class="class"
    :options="options"
    :placeholder="placeholder"
    :showSearch="true"
    :search="search"
    :loadMoreLoading="loadMoreLoading"
    :loadMore="loadMore"
    :change="change"
    :dropdownVisibleChange="dropdownVisibleChange"
    :relationFieldKey="relationFieldKey"
    :blur="blur"
  ></SingleSelect>
</template>
<script lang="ts">
import { Pagination } from '@oinone/kunlun-engine';
import { debounce, isEmpty } from 'lodash-es';
import { defineComponent, PropType, ref, watch } from 'vue';
import { FetchValueOptions, FetchValueReturnType } from '../typing';
import MultiSelect from './MultiSelect.vue';
import SingleSelect from './SingleSelect.vue';

export default defineComponent({
  name: 'LazyLoadSelect',
  components: { SingleSelect, MultiSelect },
  props: {
    class: {
      type: String,
      default: ''
    },
    value: {
      type: Object,
      default: undefined
    },
    placeholder: {
      type: String
    },
    fetchValue: {
      type: Function as PropType<(option: FetchValueOptions) => Promise<FetchValueReturnType>>
    },
    isMulti: {
      type: Boolean,
      default: false
    },
    change: {
      type: Function
    },
    relationFieldKey: {
      type: String,
      default: 'id'
    },
    validator: {
      type: Function as PropType<(value: any) => boolean>
    },
    queryOne: {
      type: Function as PropType<(value: any) => Promise<any>>
    },
    allowClear: {
      type: Boolean
    }
  },
  emits: ['update:resetValue'],
  setup(props, { emit }) {
    const totalPages = ref<number>(10000);
    const pagination = ref<Pagination>({ current: 1, pageSize: 15, total: 0 });
    const loadMoreLoading = ref<boolean>(false);
    const options = ref<Record<string, unknown>[]>([]);
    const validateState = ref<boolean>(true);

    const init = async () => {
      if (!isEmpty(props.value)) {
        if (Array.isArray(props.value)) {
          props.value.forEach(async (item: any) => {
            options.value.push(item.option || { label: item.label, value: item.value });
          });
        } else {
          options.value.push(props.value!.option || { label: props.value!.label, value: props.value!.value });
        }
      }
    };
    init();

    const search = debounce(async (searchValue: string, forceSearch = false) => {
      loadMoreLoading.value = true;
      pagination.value.current = 1;
      options.value = [];
      if (searchValue === '') {
        loadMore(true);
      } else {
        const res = await props.fetchValue?.({ searchValue, pagination: pagination.value });
        fillOptions(res);
        loadMoreLoading.value = false;
      }
    }, 400);

    const loadMore = async (forceLoad?: boolean) => {
      if (!forceLoad && pagination.value.current >= totalPages.value) {
        return;
      }
      loadMoreLoading.value = true;
      const res = await props.fetchValue?.({ pagination: pagination.value });
      fillOptions(res);
      pagination.value.current += 1;
      loadMoreLoading.value = false;
    };

    const dropdownVisibleChange = (visible: boolean) => {
      if (!visible) {
        return;
      }
      loadMore();
    };

    watch(
      () => props.fetchValue,
      () => {
        pagination.value.current = 1;
        totalPages.value = 10000;
        options.value = [];
        emit('update:resetValue');
      }
    );

    const fillOptions = (opts?: FetchValueReturnType) => {
      if (!opts || !opts.content) {
        return;
      }
      // 将opts.options中的数据去重后添加到options.value中
      options.value = options.value.concat(
        opts.options?.filter((item) => !options.value.some((option) => option.value === item.value)) || []
      );
      totalPages.value = opts.totalPages!;
    };

    const blur = () => {
      const res = props.validator?.(props.value);
      if (!res) {
        validateState.value = false;
      }
    };

    return { loadMoreLoading, options, fillOptions, search, loadMore, dropdownVisibleChange, blur, validateState };
  }
});
</script>
