<template>
  <md-selection-base
    :title="title"
    class="md-selection-sub-inner"
    :class="{ 'md-selection-sub-inner-search': showSearch }"
  >
    <template #header v-if="$slots.header">
      <slot name="header" />
    </template>
    <template #content>
      <oio-input-search
        v-if="showSearch"
        class="keywords"
        v-model:value="innerKeyword"
        size="small"
        allow-clear
        :placeholder="searchPlaceholder"
        @change="onKeywordChange"
        @search="onKeywordChange"
      >
        <template #suffix>
          <oio-icon icon="oinone-sousuo" class="designer-input-search-btn" @click="onKeywordChange" />
        </template>
      </oio-input-search>
      <slot name="default"></slot>
    </template>
    <template #footer>
      <div class="selection-footer-btn" v-if="$slots.footerBtn">
        <slot name="footerBtn" />
      </div>
    </template>
  </md-selection-base>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import MdSelectionBase from './MdSelectionBase.vue';
import { OioInputSearch, OioIcon } from '@kunlun/vue-ui-antd';

export default defineComponent({
  components: { MdSelectionBase, OioInputSearch, OioIcon },
  props: {
    title: String,
    keyword: String,
    showSearch: {
      type: Boolean,
      default: true
    },
    searchPlaceholder: String
  },
  emits: ['keyword-change'],
  setup(props, context) {
    const innerKeyword = ref('');
    const onKeywordChange = (newKeyword) => {
      context.emit('keyword-change', innerKeyword.value);
    };
    watch(
      () => props.keyword,
      () => {
        innerKeyword.value = props.keyword!;
      },
      { immediate: true }
    );
    return {
      innerKeyword,
      onKeywordChange
    };
  }
});
</script>
<style lang="scss">
.md-selection-sub-inner {
  &.md-selection-sub-inner-search {
    padding: 16px 0;

    .selection-footer-btn {
      .ant-btn {
        padding: 0;
        height: auto;
      }
    }
  }
  .type-box--content {
    display: flex;
    flex-direction: column;
    .keywords {
    }
  }
  .footer {
    .selection-footer-btn {
      height: 52px;
      line-height: 52px;
      text-align: center;
    }
  }
}
</style>
