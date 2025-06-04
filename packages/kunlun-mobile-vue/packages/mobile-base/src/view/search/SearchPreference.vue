<template>
  <div class="search-preference">
    <a-popover
      placement="bottom"
      overlayClassName="search-preference-dropdown"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode || document.body"
    >
      <template #content>
        <div class="search-preference-content">
          <div class="option-search">
            <oio-input v-model:value="searchOptionKeyword" :placeholder="translateValueByKey('筛选方案搜索')">
              <template #prefix>
                <oio-icon icon="oinone-sousuo" size="14" />
              </template>
            </oio-input>
          </div>
          <div class="options-content oio-scrollbar">
            <div v-for="item in finalOptions" class="option" :key="item.id" @click="selectOption(item)">
              <oio-icon icon="oinone-shoucang1" size="14px" />
              <span class="label">{{ item.name }}</span>
              <oio-icon
                class="delete"
                icon="oinone-a-ShapeCopy3"
                size="14px"
                @click.stop.prevent="deletePrefer(item.id)"
              />
            </div>
          </div>
          <div class="options-divider"></div>
          <div class="options-action manager">
            <oio-button icon="oinone-shezhi" type="link" @click="changeConditionVisible(true)">{{
              translateValueByKey('收藏当前条件')
            }}</oio-button>
          </div>
          <div class="options-action collection">
            <oio-button icon="oinone-yingyongfenzu" type="link" @click="changeManagerVisible(true)"
              >{{ translateValueByKey('筛选方案管理') }}
            </oio-button>
          </div>
        </div>
      </template>
      <div
        class="search-preference-top-bar"
        tabindex="2"
        @click="changePopVisible(!popVisible)"
        id="search-preference-top-bar"
      >
        <div v-if="currentSelectedSearchPreferOption" class="selected">
          <oio-icon icon="oinone-shoucang1" size="14" color="var(--oio-primary-color)" />
          <span class="selected-option-label">{{ currentSelectedSearchPreferOption.name }}</span>
          <oio-icon icon="oinone-guanbi1" size="8" @click.stop="removeSelectedOption" />
        </div>
        <oio-icon v-else icon="oinone-shoucang1" size="18" color="var(--oio-primary-color)" />
      </div>
    </a-popover>
    <oio-modal
      :enter-callback="enterConditionForm"
      :cancel-callback="() => changeConditionVisible(false)"
      :visible="conditionVisible"
      heigth="60%"
      :title="translateValueByKey('收藏当前条件')"
      width="560px"
    >
      <oio-form ref="conditionForm" layout="vertical" :model="newCollectionConditionForm">
        <oio-form-item :label="translateValueByKey('收藏方案名称')" name="name" :rules="conditionRules">
          <oio-input
            v-model:value="newCollectionConditionForm.name"
            :maxlength="50"
            :placeholder="translateValueByKey('将搜索视图的筛选条件收藏')"
          />
        </oio-form-item>
      </oio-form>
    </oio-modal>
    <oio-modal
      :cancelText="translateValueByKey('关闭')"
      heigth="60%"
      :title="translateValueByKey('搜索方案管理')"
      width="560px"
      :cancel-callback="() => changeManagerVisible(false)"
      :visible="managerVisible"
      footer-invisible
    >
      <div v-if="collectionOptions && collectionOptions.length" class="search-preference-manager-modal">
        <span class="collection" v-for="item in collectionOptions" :key="item.id">
          <oio-input
            class="label"
            v-if="currentEditOption && currentEditOption.id === item.id"
            v-model:value="currentEditOption.name"
            :maxlength="50"
          >
          </oio-input>
          <div v-else class="label" :title="item.name">{{ item.name }}</div>
          <div class="edit">
            <oio-icon
              v-if="currentEditOption && currentEditOption.id === item.id"
              icon="oinone-zhichi"
              @click="completeEditOption(currentEditOption)"
            />
            <oio-icon v-else icon="oinone-xiugai1" @click="changeCurrentEditOption(item)" />
          </div>
        </span>
      </div>
      <oio-empty-data :description="translateValueByKey('暂无数据')" v-else />
    </oio-modal>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from 'vue';
import {
  OioButton,
  OioForm,
  OioFormItem,
  OioIcon,
  OioInput,
  OioMessage,
  OioModal,
  OioEmptyData
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { ActiveRecordExtendKeys, translateValueByKey } from '@oinone/kunlun-engine';
import { deepClone } from '@oinone/kunlun-meta';
import {
  createUserQueryPrefer,
  deleteUserQueryPrefer,
  injectSearchPreferFun,
  querySearchPreferByUserId,
  updateUserQueryPreferName
} from './service.ts';

export default defineComponent({
  name: 'SearchPreference',
  components: {
    OioModal,
    OioInput,
    OioForm,
    OioFormItem,
    OioButton,
    OioEmptyData,
    OioIcon
  },
  setup() {
    const {
      currentSelectedSearchPreferOption,
      fetchUserQueryPreferEntity,
      preferSearch,
      searchReset,
      genUserQueryPreferKey,
      collectionOptions
    } = injectSearchPreferFun();
    const mainBlur = (e) => {
      if (e.relatedTarget.id !== 'search-preference-top-bar') {
        popVisible.value = false;
      }
    };
    const popVisible = ref(false);
    const changePopVisible = (val) => {
      popVisible.value = val;
    };

    const selectOption = (val) => {
      currentSelectedSearchPreferOption.value = val;
      preferSearch(val.searchPrefer);
      popVisible.value = false;
    };
    const removeSelectedOption = () => {
      currentSelectedSearchPreferOption.value = undefined;
      searchReset();
    };

    const searchOptionKeyword = ref('');
    const conditionForm = ref();
    const conditionRules = [{ required: true, message: translateValueByKey('必填') }];
    const newCollectionConditionForm = ref({});
    const managerVisible = ref(false);
    const conditionVisible = ref(false);

    const changeManagerVisible = (val) => {
      managerVisible.value = val;
    };
    const changeConditionVisible = (val) => {
      conditionVisible.value = val;
      if (!val) {
        newCollectionConditionForm.value = {};
        conditionForm.value.resetFields();
      }
    };

    const finalOptions = computed(() => {
      return (collectionOptions.value || []).filter((o) => {
        if (o && currentSelectedSearchPreferOption.value && o.id === currentSelectedSearchPreferOption.value.id) {
          currentSelectedSearchPreferOption.value = o;
          return false;
        }
        if (o && o.name) {
          return o.name.indexOf(searchOptionKeyword.value) > -1;
        }
        return true;
      });
    });
    const refreshOptions = async () => {
      const { resModel, resViewName } = genUserQueryPreferKey();
      collectionOptions.value = await querySearchPreferByUserId(resModel, resViewName);
    };
    onMounted(() => {
      if (!collectionOptions.value && collectionOptions.value.length) {
        return;
      }
      const entity = fetchUserQueryPreferEntity();
      for (const valueElement of collectionOptions.value) {
        entity.searchBody[ActiveRecordExtendKeys.DRAFT_ID] = undefined;
        const valueSearchBody = JSON.parse(valueElement.searchPrefer).searchBody;
        valueSearchBody[ActiveRecordExtendKeys.DRAFT_ID] = undefined;
        if (JSON.stringify(entity.searchBody) === JSON.stringify(valueSearchBody)) {
          currentSelectedSearchPreferOption.value = valueElement;
        }
      }
    });

    const popVisibleChange = (val) => {
      if (val === true) {
        refreshOptions();
      }
    };

    const enterConditionForm = () => {
      conditionForm.value.validate().then((e) => {
        const entity = fetchUserQueryPreferEntity();
        createUserQueryPrefer(e.name, JSON.stringify(JSON.stringify(entity)), entity.resModel, entity.resViewName).then(
          () => {
            refreshOptions();
            changeConditionVisible(false);
          }
        );
      });
    };

    const deletePrefer = (id) => {
      deleteUserQueryPrefer(id).then(() => {
        refreshOptions();
      });
    };

    const currentEditOption = ref();
    const changeCurrentEditOption = (val) => {
      if (currentEditOption.value) {
        OioMessage.warning(translateValueByKey('请先完成上一个方案的编辑'));
      } else {
        currentEditOption.value = deepClone(val);
      }
    };
    const completeEditOption = (val) => {
      updateUserQueryPreferName(val.id, val.name).then(() => {
        currentEditOption.value = undefined;
        refreshOptions();
      });
    };

    return {
      currentSelectedSearchPreferOption,
      mainBlur,
      popVisible,
      changePopVisible,
      removeSelectedOption,
      searchOptionKeyword,
      conditionForm,
      conditionRules,
      newCollectionConditionForm,
      collectionOptions,
      finalOptions,
      managerVisible,
      conditionVisible,
      enterConditionForm,
      selectOption,
      changeManagerVisible,
      changeConditionVisible,
      popVisibleChange,
      deletePrefer,
      currentEditOption,
      changeCurrentEditOption,
      completeEditOption,
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
      height: 40px;
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
      }
    }
  }
}

.search-preference-dropdown {
  .ant-popover-inner-content {
    padding: 0;
  }

  width: 204px;

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
