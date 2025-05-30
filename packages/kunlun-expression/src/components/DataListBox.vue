<template>
  <div class="data-list-wrapper">
    <div class="data-list-box">
      <slot>
        <template v-if="itemList && itemList.length > 0">
          <div class="data-item" v-for="(data, index) in itemList" :key="index" @click="onClickItem(data)">
            <i
              class="d-iconfont"
              style="color: var(--oio-primary-color); margin-right: 5px"
              v-if="showIcon && modelIcon[data.type]"
              :class="[modelIcon[data.type]]"
            ></i>
            <div class="display-name" :title="data.displayName">
              {{ data.displayName }}
            </div>
            <div
              class="remark"
              v-if="showRemark && data.displayName !== data.remark && data.remark"
              :title="data.remark"
            >
              {{ data.remark }}
            </div>
          </div>
        </template>
        <a-empty v-else class="empty" :description="translateExpValue('暂无数据')" />
      </slot>
    </div>
    <div class="page" v-if="itemList && itemList.length > 0">
      <md-pagination
        v-if="pagination && pagination.total"
        size="small"
        :current="pagination.current"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        @change="onPaginationChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { Entity } from '@kunlun/meta';
import { Pagination } from '@kunlun/engine';
import MdPagination from './pagination/MdPagination.vue';
import { translateExpValue } from '../share';

export default defineComponent({
  components: { MdPagination },
  props: {
    dataList: Array as PropType<Entity[]>,
    showIcon: {
      type: Boolean,
      default: false
    },
    pagination: { type: Object as PropType<Pagination> },
    onPaginationChange: Function,
    showRemark: {
      type: Boolean,
      default: true
    }
  },
  setup(props, context) {
    const onClickItem = (item) => {
      context.emit('clickItem', item);
    };

    const modelIcon = {
      STORE: 'oinone-cunchumoxing1',
      TRANSIENT: 'oinone-chuanshumoxing1',
      ABSTRACT: 'oinone-chouxiangmoxing1',
      PROXY: 'oinone-dailimoxing1'
    };

    const itemList = computed(() => {
      if (!props.dataList) {
        return [];
      }
      return props.dataList.map((a) => ({
        ...a,
        displayName: a.displayName || a.name || a.label,
        remark: a.summary || a.description
      }));
    });
    return {
      onClickItem,
      modelIcon,
      itemList,
      translateExpValue
    };
  }
});
</script>