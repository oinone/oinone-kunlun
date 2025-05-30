<template>
  <div class="default-icon-upload-view">
    <!-- TODO 消除一层 -->
    <div class="default-icon-upload-gallery">
      <OioSpin :loading="loading">
        <div v-if="!!(dataSource && dataSource.length)" class="default-icon-upload-gallery-show">
          <div class="default-icon-upload-gallery-content">
            <IconCard v-for="(data, index) in dataSource" :iconData="data" :rowIndex="index" :key="String(data.outId)">
              <slot name="rowActions"></slot>
            </IconCard>
          </div>
          <div class="default-gallery-pagination" v-if="showPagination && pagination">
            <OioPagination
              :currentPage="pagination.current"
              :pageSizeOptions="pageSizeOptions"
              :pageSize="pagination.pageSize"
              :total="pagination.total"
              :showTotal="true"
              :showJumper="paginationStyle != ListPaginationStyle.SIMPLE"
              :showLastPage="paginationStyle != ListPaginationStyle.SIMPLE"
              :onChange="onPaginationChange"
            ></OioPagination>
          </div>
        </div>
        <div class="default-icon-upload-gallery-empty" v-else>
          <OioEmptyData :description="emptyText" :image="emptyImage"></OioEmptyData>
        </div>
      </OioSpin>
    </div>
  </div>
</template>
<script lang="ts">
import { ActiveRecord, Pagination } from '@kunlun/engine';
import { CommonGutterType, ListPaginationStyle, OioPagination, OioSpin, OioEmptyData } from '@kunlun/vue-ui-antd';
import { defineComponent, PropType } from 'vue';
import IconCard from '../card/IconCard.vue';
import { UploadStatus } from '../../typing';

export default defineComponent({
  name: 'IconManageGallery',
  components: {
    IconCard,
    OioPagination,
    OioSpin,
    OioEmptyData
  },
  inheritAttrs: false,
  props: {
    dataSource: {
      type: Array as PropType<ActiveRecord[]>
    },
    cols: {
      type: Number
    },
    gutter: {
      type: [Number, String, Array, Object] as PropType<CommonGutterType>
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object as PropType<Pagination>
    },
    itemWidth: {
      type: Number
    },
    itemMinWidth: {
      type: Number
    },
    itemMaxWidth: {
      type: Number
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    paginationStyle: {
      type: String as PropType<ListPaginationStyle>
    },
    onPaginationChange: {
      type: Function as PropType<(currentPage: number, pageSize: number) => void>
    },
    showIconManage: {
      type: Boolean
    },
    onChangeWidgetGroup: {
      type: Function
    },
    manageGroupList: {
      type: Array
    },

    emptyText: {
      type: String,
      default: ''
    },
    emptyImage: {
      type: String,
      default: undefined
    },
    reloadActiveRecords: {
      type: Function
    },
    onFileUpload: {
      type: Function
    },
    uploadStatus: {
      type: String as PropType<UploadStatus>
    },
    onUploading: {
      type: Function
    }
  },
  setup() {
    return {
      ListPaginationStyle
    };
  }
});
</script>
