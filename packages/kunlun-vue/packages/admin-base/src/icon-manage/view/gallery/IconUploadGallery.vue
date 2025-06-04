<template>
  <div class="default-icon-draggable">
    <FileUpload
      @change="onFileUpload"
      :beforeUpload="beforeUpload"
      @reject="reject"
      :limit-size="limitSize"
      :accept="accept"
    >
      <div class="default-icon-draggable-content">
        <OioIcon icon="oinone-shangchuan1" class="default-icon-draggable-content-icon" size="48px"></OioIcon>
        <div class="default-icon-draggable-content-noData" v-if="uploadStatus !== 'uploading'">
          <div class="default-icon-draggable-content-text">{{ $translate('点击上传 或 拖拽上传图标文件') }}</div>
          <div class="default-icon-draggable-content-tip">
            {{
              $translate(
                '仅支持上传.zip文件，且zip中 .js，.css，.json必须同时存在，.tff，.woff，.woff2文件可选；目前只支持阿里iconfont的图标文件'
              )
            }}
          </div>
        </div>
        <div class="default-icon-draggable-content-uploading" v-else-if="uploadStatus === 'uploading'"></div>
      </div>
      <template #itemRender="{ file, actions }">
        <OioSpin :loading="true" v-if="uploadStatus === 'uploading'"></OioSpin>
        <div class="default-icon-draggable-upload-info" v-if="uploadStatus === 'uploading'">
          <div class="default-icon-draggable-upload-text">
            <span
              class=""
              :style="file.status === 'error' ? 'color: red' : 'color: var(--oio-info-color-hover)'"
              @click="actions.download"
              >{{ file.name }}</span
            >
            <OioIcon
              icon="oinone-guanbi1"
              size="10"
              color="var(--oio-info-color-hover)"
              @click="actions.remove"
            ></OioIcon>
          </div>
          <div class="default-icon-draggable-upload-progressBar">
            <div class="default-icon-upload-progress default-icon-upload-progress-gray"></div>
            <div
              class="default-icon-upload-progress default-icon-upload-progress-primary"
              :style="`width: calc(${file.percent ? file.percent : 100}%);`"
            ></div>
          </div>
        </div>
      </template>
    </FileUpload>
  </div>

  <div class="default-icon-upload-view">
    <!-- TODO 消除一层 -->
    <div class="default-icon-upload-gallery">
      <div class="default-icon-upload-gallery-group" v-if="uploadStatus === 'showData'">
        <OioManageGroup
          :currentGroup="currentGroup"
          :onChangeWidgetGroup="onChangeWidgetGroup"
          :widget-group="{}"
          :group-list="manageGroupList"
          :show-opt-buttons="false"
          :adaptive-width="100"
          :showDetail="false"
        >
        </OioManageGroup>
      </div>

      <OioSpin :loading="loading" :tip="uploadStatus === 'parsing' ? emptyText : ''">
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
import { ActiveRecord, Pagination } from '@oinone/kunlun-engine';
import {
  CommonGutterType,
  ListPaginationStyle,
  OioButton,
  OioEmptyData,
  OioIcon,
  OioPagination,
  OioSpin
} from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, PropType } from 'vue';
import { FileUpload, GroupListItem, OioManageGroup } from '../../../components';
import { GroupList } from '../../components';
import { IconGroup } from '../../service/IconManageService';
import { UploadStatus } from '../../typing';
import IconCard from '../card/IconCard.vue';

enum PanelType {
  SortPanel = 'SortPanel',
  ListPanel = 'ListPanel'
}

export default defineComponent({
  name: 'IconUploadGallery',
  components: {
    IconCard,
    FileUpload,
    OioButton,
    OioPagination,
    GroupList,
    OioSpin,
    OioIcon,
    OioEmptyData,
    OioManageGroup
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
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>
    },
    paginationStyle: {
      type: String as PropType<ListPaginationStyle>
    },
    onPaginationChange: {
      type: Function as PropType<(currentPage: number, pageSize: number) => void>
    },
    currentGroup: {
      type: Object as PropType<IconGroup>
    },
    onChangeWidgetGroup: {
      type: Function
    },
    manageGroupList: {
      type: Array as PropType<GroupListItem[]>
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
    beforeUpload: {
      type: Function
    },
    accept: {
      type: String
    },
    reject: {
      type: Function
    },
    // 限制上传的文本大小 单位:Mb
    limitSize: {
      type: Number,
      default: -1
    },
    uploadStatus: {
      type: String as PropType<UploadStatus>
    }
  },
  setup(props) {
    let lastUploadFileLen = 0;

    const handleDeleteGroup = () => {
      console.log('deleteGroup');
    };

    const onUpdateGroupDisplayName = () => {
      console.log('onUpdateGroupDisplayName');
    };

    const onFileUpload = (fileList: any[]) => {
      if (fileList.length < lastUploadFileLen) {
        return;
      }
      const urls: string[] = fileList.map((file) => '"' + file.url + '"');
      fileList.splice(0, lastUploadFileLen);
      props.onFileUpload?.(urls, fileList);
    };

    const beforeUpload = (file: any, fileList: any[]): boolean => {
      lastUploadFileLen = fileList.length;
      return props.beforeUpload?.(file, fileList);
    };

    return {
      ListPaginationStyle,
      PanelType,
      handleDeleteGroup,
      onUpdateGroupDisplayName,
      onFileUpload,
      beforeUpload
    };
  }
});
</script>
