<template>
  <div class="icon-select-withGroup">
    <oio-input-search
      :placeholder="$translate(placeholder)"
      v-model:value="searchValue"
      @update:value="onUpdateValue"
      @search="onSearch"
    >
      <template #prefix>
        <oio-icon icon="oinone-sousuo" />
      </template>
    </oio-input-search>
    <oio-manage-group
      :widget-group="{}"
      :current-group="currentGroup"
      :group-list="groupList"
      :onChangeWidgetGroup="onChangeWidgetGroup"
      :showOptButtons="false"
      :showDetail="false"
    ></oio-manage-group>
    <OioSpin :loading="loading">
      <div
        class="icon-select-container"
        v-if="(icons && icons.length) || (initialSelectIcon && initialSelectIcon.id)"
        ref="scrollWrapperRef"
        @scroll="handleScroll"
      >
        <span
          class="icon-select-prefix"
          v-if="initialSelectIcon"
          :key="initialSelectIcon.id"
          @click="selectIconHandle(initialSelectIcon)"
          :class="{
            'icon-select-choosed': clickedIcon && clickedIcon.fullFontClass === initialSelectIcon.fullFontClass
          }"
        >
          <oio-icon :icon="initialSelectIcon.fullFontClass" color="var(--oio-text-color-secondary)" size="24" />
        </span>
        <span
          class="icon-select-prefix"
          v-for="opt in icons"
          :key="opt.id"
          @click="selectIconHandle(opt)"
          v-show="opt.id !== (initialSelectIcon && initialSelectIcon.id)"
          :class="{ 'icon-select-choosed': clickedIcon && clickedIcon.id === opt.id }"
        >
          <oio-icon :icon="opt.fullFontClass" color="var(--oio-text-color-secondary)" size="24" />
        </span>
      </div>
      <div v-else>
        <OioEmptyData></OioEmptyData>
      </div>
    </OioSpin>
  </div>
</template>
<script lang="ts">
import { Pagination, translateValueByKey } from '@kunlun/engine';
import { OioEmptyData, OioIcon, OioInputSearch, OioSpin } from '@kunlun/vue-ui-antd';
import { debounce } from 'lodash-es';
import { defineComponent, onBeforeMount, ref } from 'vue';
import { OioManageGroup } from '../../../components';
import {
  fetchGroupWithoutCount,
  IconData,
  IconGroup,
  queryIconsWithCondition,
  queryIconWithFullFontClass
} from '../../service/IconManageService';
import { GroupAll } from '../../typing';

export default defineComponent({
  components: {
    OioIcon,
    OioInputSearch,
    OioManageGroup,
    OioEmptyData,
    OioSpin
  },
  props: {
    placeholder: {
      type: String,
      default: '搜索'
    },
    value: {
      type: String
    },
    pageSize: {
      type: Number,
      default: 91
    }
  },
  emits: ['update:value'],
  setup(props, context) {
    const searchValue = ref<string>('');
    const loading = ref<boolean>(false);

    const onUpdateValue = (val) => {
      searchValue.value = val;
      onSearch();
    };

    let storeQueryIconWithFullFontClass: { id: string; groupId: string; fullFontClass: string } | undefined = undefined;
    const initialSelectIcon = ref<IconData | undefined>(undefined);
    const clickedIcon = ref<IconData | undefined>(undefined);
    const selectIconHandle = (opt: IconData) => {
      clickedIcon.value = opt;
      context.emit('update:value', opt.fullFontClass);
    };

    const scrollWrapperRef = ref<HTMLElement | null>(null);
    const handleScroll = debounce(async () => {
      const scrollWrapper = scrollWrapperRef.value;
      if (scrollWrapper) {
        const { scrollTop, clientHeight, scrollHeight } = scrollWrapper;
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          if (pagination.value.current < currentTotalPages.value) {
            pagination.value.current++;
            const res = await requestIcons();

            icons.value.push(...res.content);
            currentTotalPages.value = res.totalPages;
          }
        }
      }
    }, 400);
    const pagination = ref<Pagination>({
      current: 1,
      pageSize: props.pageSize
    } as Pagination);

    const icons = ref<IconData[]>([]);
    const currentTotalPages = ref<number>(0);
    const currentGroup = ref<IconGroup | undefined>(undefined);
    const groupList = ref<IconGroup[]>([]);

    const onSearch = debounce(async () => {
      pagination.value.current = 1;
      const res = await requestIcons();

      icons.value = res.content;
      currentTotalPages.value = res.totalPages;
    }, 400);

    // 切换分组
    const onChangeWidgetGroup = async (g: IconGroup) => {
      currentGroup.value = g;
      pagination.value.current = 1;
      if (currentGroup.value.id === storeQueryIconWithFullFontClass?.groupId) {
        initialSelectIcon.value = {
          id: storeQueryIconWithFullFontClass?.id,
          fullFontClass: storeQueryIconWithFullFontClass?.fullFontClass
        };
      } else {
        initialSelectIcon.value = undefined;
      }
      const res = await requestIcons();

      icons.value = res.content;
      currentTotalPages.value = res.totalPages;
    };

    const requestIcons = async () => {
      loading.value = true;
      let condition = '';
      if (searchValue.value && currentGroup.value?.id !== '-1') {
        condition = `(1==1) and ((((1==1) and (displayName=like='${searchValue.value}')) and (groupId=='${currentGroup.value?.id}')) and (show==true))`;
      } else if (searchValue.value) {
        condition = `(1==1) and (((1==1) and (displayName=like='${searchValue.value}')) and (show==true))`;
      } else if (currentGroup.value?.id !== '-1') {
        condition = `(1==1) and (((1==1) and (groupId=='${currentGroup.value?.id}')) and (show==true))`;
      } else {
        condition = '(1==1) and ((1==1) and (show==true))';
      }
      const res = await queryIconsWithCondition({
        model: 'resource',
        pagination: { current: pagination.value.current, pageSize: pagination.value.pageSize } as Pagination,
        condition
      });

      loading.value = false;

      return {
        content: res.content,
        totalPages: res.totalPages
      };
    };

    const fetchAllGroupList = async () => {
      const groups = await fetchGroupWithoutCount('resource');
      groupList.value.push(...groups);
      GroupAll.name = translateValueByKey(GroupAll.name);
      groupList.value.unshift(GroupAll);
    };

    const setIconWithFullFontClass = async () => {
      if (props.value) {
        storeQueryIconWithFullFontClass = await queryIconWithFullFontClass({
          model: 'resource',
          fullFontClass: props.value
        });
        if (storeQueryIconWithFullFontClass && Object.keys(storeQueryIconWithFullFontClass).length) {
          initialSelectIcon.value = {
            id: storeQueryIconWithFullFontClass.id,
            fullFontClass: props.value
          };
          clickedIcon.value = {
            id: storeQueryIconWithFullFontClass.id,
            fullFontClass: props.value
          };
          currentGroup.value = groupList.value.find((group) => group.id === storeQueryIconWithFullFontClass!.groupId);
        }
      }
      if (!currentGroup.value) {
        currentGroup.value = GroupAll;
      }
    };

    onBeforeMount(async () => {
      await fetchAllGroupList();
      await setIconWithFullFontClass();
      await onChangeWidgetGroup(currentGroup.value!);
    });

    return {
      loading,
      searchValue,
      onSearch,
      onUpdateValue,
      initialSelectIcon,
      clickedIcon,
      selectIconHandle,
      icons,
      currentGroup,
      groupList,
      onChangeWidgetGroup,
      scrollWrapperRef,
      handleScroll
    };
  }
});
</script>
<style lang="scss">
.icon-select-withGroup {
  display: flex;
  flex-direction: column;
  gap: var(--oio-row-gap);
  width: 100%;

  & > .oio-input-search {
    width: 100%;
    border-radius: 0 4px 4px 0;

    .ant-input-group-addon {
      display: none;
    }
  }

  .oio-default-manage-group-box {
    height: 40px;
    padding-top: 0;
  }

  .oio-button-link {
    margin-top: 8px;
  }

  .icon-select-container {
    min-height: 238px;
    max-height: 238px;
    overflow: scroll;

    display: flex;
    row-gap: var(--oio-row-gap);
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-start;
    align-items: flex-start;

    & > .icon-select {
      &-prefix {
        flex: 0 0 calc(100% / 13);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        & > .oio-icon {
          padding: 5px;
          border-radius: var(--oio-border-radius);

          &:hover {
            color: var(--oio-primary-color-hover);
            background-color: rgba(var(--oio-primary-color-rgb), 0.1);
          }
        }
      }

      &-choosed {
        & > .oio-icon {
          color: var(--oio-primary-color-hover);
          background-color: rgba(var(--oio-primary-color-rgb), 0.1);
        }
      }
    }
  }
}
</style>
