<template>
  <div class="search-preference">
    <a-popover
      placement="bottom"
      overlayClassName="search-preference-dropdown oio-popover"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode || document.body"
      @visible-change="onPopoverVisibleChange"
    >
      <template #content>
        <div class="search-preference-content">
          <div class="option-search">
            <oio-input v-model:value="searchKeywords" :placeholder="translateValueByKey('筛选方案搜索')">
              <template #prefix>
                <oio-icon icon="oinone-sousuo" size="14" />
              </template>
            </oio-input>
          </div>
          <div class="options-content oio-scrollbar">
            <oio-spin :loading="loading">
              <div v-for="item in filterOptions" class="option" :key="item.id" @click="onSelect(item)">
                <oio-icon icon="oinone-shoucang1" size="14px" />
                <span class="label">{{ item.name }}</span>
                <oio-icon class="delete" icon="oinone-a-ShapeCopy3" size="14px" @click.stop.prevent="onRemove(item)" />
              </div>
            </oio-spin>
          </div>
          <div class="options-divider"></div>
          <div class="options-action manager" :title="translateValueByKey('收藏当前条件')">
            <oio-button icon="oinone-shezhi" type="link" @click="onFavorCurrentVisibleChange(true)"
              >{{ translateValueByKey('收藏当前条件') }}
            </oio-button>
          </div>
          <div class="options-action collection" :title="translateValueByKey('筛选方案管理')">
            <oio-button icon="oinone-yingyongfenzu" type="link" @click="onManagerVisibleChange(true)"
              >{{ translateValueByKey('筛选方案管理') }}
            </oio-button>
          </div>
        </div>
      </template>
      <div class="search-preference-top-bar" tabindex="2" id="search-preference-top-bar">
        <div v-if="selected" class="selected">
          <oio-icon icon="oinone-shoucang1" size="14" color="var(--oio-primary-color)" />
          <span class="selected-option-label">{{ selected.name }}</span>
          <oio-icon icon="oinone-guanbi1" size="8" @click.stop="onUnselect" />
        </div>
        <oio-icon v-else icon="oinone-shoucang1" size="18" color="var(--oio-primary-color)" />
      </div>
    </a-popover>
    <oio-modal
      v-model:visible="favorCurrentVisible"
      :enter-callback="onFavorCurrentEnter"
      heigth="60%"
      :title="translateValueByKey('收藏当前条件')"
      width="560px"
    >
      <template #default="{ data }">
        <oio-form ref="favorCurrentForm" layout="vertical" :data="data">
          <oio-form-item :label="translateValueByKey('收藏方案名称')" name="name" :rules="favorCurrentFormRule">
            <oio-input
              v-model:value="data.name"
              :maxlength="50"
              :placeholder="translateValueByKey('将搜索视图的筛选条件收藏')"
            />
          </oio-form-item>
        </oio-form>
      </template>
    </oio-modal>
    <oio-modal
      :cancelText="translateValueByKey('关闭')"
      heigth="60%"
      :title="translateValueByKey('搜索方案管理')"
      width="560px"
      v-model:visible="managerVisible"
      :footer-invisible="true"
    >
      <oio-empty-data v-if="isEmptyManagerOptions" />
      <div class="search-preference-manager-modal" v-else>
        <span class="collection" v-for="item in managerOptions" :key="item.id">
          <oio-input
            v-if="currentEditOption && currentEditOption.id === item.id"
            class="label"
            v-model:value="currentEditOption.name"
            :maxlength="50"
          >
          </oio-input>
          <span v-else class="label" :title="item.name">{{ item.name }}</span>
          <span class="edit">
            <oio-icon
              v-if="currentEditOption && currentEditOption.id === item.id"
              icon="oinone-zhichi"
              @click="onCompleteEditOption()"
            />
            <oio-icon v-else icon="oinone-xiugai1" @click="onEditOption(item)" />
          </span>
        </span>
      </div>
    </oio-modal>
  </div>
</template>
<script lang="ts">
import {
  OioButton,
  OioEmptyData,
  OioForm,
  OioFormItem,
  OioIcon,
  OioInput,
  OioMessage,
  OioModal,
  OioSpin
} from '@oinone/kunlun-vue-ui-antd';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { Popover as APopover } from 'ant-design-vue';
import { cloneDeep, trim } from 'lodash-es';
import { computed, defineComponent, ref } from 'vue';
import { UserSearchPrefer } from '../../typing';
import { useInjectSearchPreferContext } from './context';

export default defineComponent({
  name: 'SearchPrefer',
  components: {
    OioModal,
    OioSpin,
    OioInput,
    OioForm,
    OioFormItem,
    OioButton,
    OioIcon,
    OioEmptyData,
    APopover
  },
  inheritAttrs: false,
  props: {
    // fixme @zbh 20230427 ts组件导致响应式丢失, 无法更新; 临时使用useInjectSearchPreferContext传递响应式变量
    // selected: {
    //   type: Object as PropType<UserSearchPrefer>
    // },
    // options: {
    //   type: Array as PropType<UserSearchPrefer[]>
    // },
    onLoad: {
      type: Function
    },
    onCreate: {
      type: Function
    },
    onUpdate: {
      type: Function
    }
  },
  emits: ['select', 'unselect', 'remove'],
  setup(props, context) {
    const searchPreferContext = useInjectSearchPreferContext();

    const selected = computed(() => searchPreferContext?.selected.value);

    const loading = ref(false);

    const searchKeywords = ref('');

    const filterOptions = computed(() => {
      const values = searchPreferContext?.options.value || [];
      const keywords = searchKeywords.value;
      const selectedId = searchPreferContext?.selected.value?.id;
      if (keywords) {
        return values.filter((v) => v.id !== selectedId && v.name.indexOf(keywords) !== -1);
      }
      return values.filter((v) => v.id !== selectedId);
    });

    const onPopoverVisibleChange = async (visible: boolean) => {
      if (visible && !searchPreferContext?.options.value?.length) {
        loading.value = true;
        try {
          await props.onLoad?.();
        } finally {
          loading.value = false;
        }
      }
    };

    const favorCurrentVisible = ref(false);

    const onFavorCurrentVisibleChange = (visible: boolean) => {
      favorCurrentVisible.value = visible;
    };

    const favorCurrentForm = ref();
    const favorCurrentFormRule = [
      {
        validator: (rule, value) => {
          if (trim(value).length === 0) {
            return Promise.reject(translateValueByKey('必填'));
          }
          return Promise.resolve();
        }
      }
    ];

    const onFavorCurrentEnter = async (e, data: UserSearchPrefer) => {
      return await favorCurrentForm.value.validate().then(async () => {
        await props.onCreate?.(data);
        return true;
      });
    };

    const managerVisible = ref(false);

    const managerOptions = computed(() => {
      return searchPreferContext?.options.value || [];
    });

    const isEmptyManagerOptions = computed(() => {
      return !managerOptions.value.length;
    });

    const onManagerVisibleChange = (visible: boolean) => {
      managerVisible.value = visible;
    };

    const currentEditOption = ref<UserSearchPrefer>();

    const onEditOption = (data: UserSearchPrefer) => {
      if (currentEditOption.value) {
        OioMessage.warning(translateValueByKey('请先完成上一个方案的编辑'));
      } else {
        currentEditOption.value = cloneDeep(data);
      }
    };

    const onCompleteEditOption = async () => {
      const data = currentEditOption.value;
      if (data && trim(data.name).length > 0) {
        await props.onUpdate?.(data);
      }
      currentEditOption.value = undefined;
    };

    const onSelect = (selected: UserSearchPrefer) => {
      context.emit('select', selected);
    };

    const onUnselect = () => {
      context.emit('unselect');
    };

    const onRemove = (selected: UserSearchPrefer) => {
      context.emit('remove', selected);
    };

    return {
      selected,

      loading,
      searchKeywords,
      filterOptions,

      onPopoverVisibleChange,

      favorCurrentVisible,
      onFavorCurrentVisibleChange,
      favorCurrentForm,
      favorCurrentFormRule,
      onFavorCurrentEnter,

      managerVisible,
      managerOptions,
      isEmptyManagerOptions,
      onManagerVisibleChange,

      currentEditOption,
      onEditOption,
      onCompleteEditOption,

      onSelect,
      onUnselect,
      onRemove,
      translateValueByKey
    };
  }
});
</script>

<style lang="scss">
.search-preference {
  cursor: pointer;

  .search-preference-top-bar {
    .selected {
      padding: 4px 8px 4px 8px;
      display: flex;
      height: var(--oio-height);
      align-items: center;
      background-color: rgba(var(--oio-primary-color-rgb), 0.1);
      border-radius: 4px;
      max-width: 120px;

      .selected-option-label {
        margin-right: 4px;
        margin-left: 8px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: var(--oio-text-color);
      }
    }
  }
}

.search-preference-dropdown {
  width: 204px;
  z-index: 1000;

  .ant-popover-inner-content {
    padding: 0;
  }

  .search-preference-content {
    .option-search {
      width: 180px;
      padding-top: 8px;
      padding-bottom: 4px;
      margin: auto;
    }

    .options-content {
      max-height: 170px;
      overflow: hidden;

      &:hover {
        overflow: auto;
      }

      .option {
        padding: 0 12px 0 12px;
        height: 34px;
        cursor: pointer;
        display: flex;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        .label {
          width: 120px;
          flex: 0 0 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--oio-text-color);
        }

        .delete {
          display: none;
        }

        .oio-icon {
          margin-right: 8px;
        }

        &:hover {
          background-color: rgba(var(--oio-primary-color-rgb), 0.1);
          color: var(--oio-primary-color);

          .delete {
            display: unset;
            margin-left: 16px;
          }

          .oio-icon {
            color: var(--oio-primary-color);
          }
        }
      }
    }

    .options-divider {
      height: 1px;
      background-color: var(--oio-border-color);
      margin: 4px 0 4px 0;
    }

    .options-action {
      padding: 0 12px 0 12px;

      .oio-button {
        overflow: hidden;
        display: flex;
        justify-content: flex-start;
        span {
          &:last-child {
            flex: 1;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
        }
      }

      .oio-icon {
        margin-right: 8px !important;
      }

      height: 34px;
      display: flex;
      align-items: center;

      &.manager {
      }

      &.collection {
      }
    }
  }
}

.search-preference-manager-modal {
  display: flex;
  flex-wrap: wrap;

  .collection {
    align-items: center;
    display: flex;
    height: 40px;
    margin: 0 16px 16px 0;
    border-radius: 4px;
    background-color: rgba(var(--oio-primary-color-rgb), 0.1);

    .label {
      max-width: 100px;
      line-height: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 8px 0 8px;
      color: var(--oio-primary-color);
    }

    .edit {
      display: flex;
      cursor: pointer;
      margin-right: 8px;
    }

    .oio-input.ant-input-affix-wrapper {
      height: 30px;
    }
  }
}
</style>
