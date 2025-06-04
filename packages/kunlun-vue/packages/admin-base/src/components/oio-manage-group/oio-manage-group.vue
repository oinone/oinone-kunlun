<template>
  <div class="oio-default-manage-group">
    <div
      class="oio-default-manage-group-box"
      ref="groupBoxRef"
      :class="[(expandGroup || !showExpand) && 'oio-default-manage-group-box-expand']"
    >
      <div
        class="oio-default-manage-group-box-cate"
        v-for="(g, index) in groupList"
        :class="[currentGroup && g.id === currentGroup.id && 'active']"
        :style="boxRowLastList[index]"
      >
        <div v-if="g.sys && showDetail" class="oio-default-manage-group-sys">{{ $translate('系统') }}</div>
        <span
          :title="`${g.displayName || g.name} ${showDetail ? '（' + (g.iconNum || g.itemNum || totalItem) + '）' : ''}`"
          class="cate-name"
          @click="onChangeWidgetGroup(g)"
          >{{ g.displayName || g.name }} {{ showDetail ? '（' + (g.iconNum || g.itemNum || totalItem) + '）' : '' }}
        </span>
      </div>
    </div>
    <oio-button
      v-if="showExpand"
      type="link"
      style="margin-right: var(--oio-margin)"
      @click="expandGroup = !expandGroup"
    >
      {{ !expandGroup ? $translate('展开') : $translate('收起') }}

      <oio-icon
        icon="oinone-xiala"
        color="var(--oio-primary-color)"
        size="12"
        :style="{
          transform: expandGroup ? 'rotate(180deg)' : 'rotate(0deg)'
        }"
      />
    </oio-button>
    <slot></slot>
    <oio-button v-if="showOptButtons" type="link" @click="visibleGroupDialog = true">
      <oio-icon icon="oinone-bianji" color="var(--oio-primary-color)" size="12" />
      {{ $translate('管理分组') }}
    </oio-button>
  </div>

  <!-- 操作分组弹窗 -->
  <oio-modal
    v-if="showOptButtons"
    v-model:visible="visibleGroupDialog"
    footer-invisible
    :cancel-callback="onCloseGroupModal"
    :title="$translate('分组管理')"
    width="820px"
  >
    <div class="oio-default-manage-group-tag-list" ref="groupTagRef">
      <div
        class="oio-default-manage-group-tag-container"
        v-for="(g, index) in groupList"
        :key="g.id"
        :style="tagRowLastList[index]"
      >
        <div v-if="g.sys && !g.refEditing" class="oio-default-manage-group-sys">{{ $translate('系统') }}</div>
        <a-tag
          class="oio-default-manage-group-tag"
          :class="[
            g.refEditing ? 'oio-default-manage-group-tag-editing' : '',
            g.sys == false && g.id > '0' && !g.refEditing ? 'oio-default-manage-group-tag-closable' : ''
          ]"
          :closable="g.sys == false && g.id > '0' && !g.refEditing"
          @close.prevent="handleDeleteGroup(g.id)"
          @dblclick="startEditing(g)"
          :title="`${g.displayName || g.name} ${showDetail ? '（' + (g.iconNum || g.itemNum || totalItem) + '）' : ''}`"
        >
          <template v-if="!g.refEditing">
            {{ g.displayName || g.name }}
            {{ showDetail ? '（' + (g.iconNum || g.itemNum || totalItem) + '）' : '' }}
          </template>
          <div v-else class="oio-default-manage-group-inputBox">
            <label class="oio-default-manage-group-inputLabel">{{ g.refName }}</label>
            <a-input
              class="oio-input"
              v-model:value="g.refName"
              type="text"
              size="small"
              :style="{ width: '100%', height: '100%', padding: '0 16px', position: 'absolute', display: 'inline' }"
              @blur="handleModifyGroup(g)"
              @keyup.enter="emitBlur"
            />
          </div>
        </a-tag>
      </div>

      <a-input
        class="oio-input"
        v-if="addGroupInputVisible"
        ref="addGroupInputRef"
        v-model:value="groupTagcreateInputValue"
        type="text"
        size="small"
        :style="{ width: '78px', height: '40px' }"
        @blur="handleGroupTagInputConfirm()"
        @keyup.enter="emitBlur"
      />
      <a-tag class="add-cate" v-else @click="addGroupInputVisible = true">
        <plus-outlined />
        {{ $translate('添加分组') }}
      </a-tag>
    </div>
  </oio-modal>
</template>
<script lang="ts">
import { PlusOutlined } from '@ant-design/icons-vue';
import { OioButton, OioModal, OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, nextTick, ref, Ref, watch } from 'vue';
import { OioManageGroupProps } from './props';

const computeAdaptiveWidth = (
  boxEl: HTMLElement | null,
  rowLastList: Ref<Record<string, string>[]>,
  adaptiveWidth: number,
  gap = 10,
  firstLineIndexs: number[]
) => {
  const children = boxEl?.children;
  const boxWidth = boxEl?.clientWidth;
  let line = 0;
  firstLineIndexs = [];
  if (children && boxWidth && rowLastList) {
    let currentWidth = 0;
    Array.from(children).forEach((child: Element, index) => {
      if (currentWidth && currentWidth + child.scrollWidth >= boxWidth) {
        if (boxWidth - currentWidth > adaptiveWidth) {
          rowLastList.value[index] = { flex: `0 0 ${boxWidth - currentWidth - 1}px` };
          currentWidth = 0;
          if (line === 0) {
            firstLineIndexs.push(index);
          }
        } else {
          currentWidth = child.scrollWidth + gap;
        }
        line++;
      } else {
        currentWidth += child.scrollWidth + gap;
        if (line === 0) {
          firstLineIndexs.push(index);
        }
      }
    });
  }
};

export default defineComponent({
  name: 'OioManageGroup',
  components: {
    OioButton,
    OioIcon,
    OioModal,
    PlusOutlined
  },
  inheritAttrs: false,
  props: {
    ...OioManageGroupProps
  },
  setup(props) {
    const expandGroup = ref(false);
    const visibleGroupDialog = ref(false);
    const addGroupInputVisible = ref(false);
    const groupTagcreateInputValue = ref('');

    const onCloseGroupModal = () => {
      visibleGroupDialog.value = false;
      addGroupInputVisible.value = false;
      groupTagcreateInputValue.value = '';
    };

    const onChangeWidgetGroup = (g) => {
      props.onChangeWidgetGroup?.(g);
    };

    const queryGroupList = async (...args) => {
      if (!props.queryGroupList) {
        return;
      }
      await props.queryGroupList(...args);
    };

    const startEditing = (g) => {
      if (!g.sys && g.id > 0) {
        g.refEditing = ref<Boolean>(true);
        g.refName = ref<string>(g.displayName || g.name);
      }
    };

    // 删除分组
    const handleDeleteGroup = async (id: string) => {
      try {
        if (!props.onDeleteGroup || typeof props.onDeleteGroup !== 'function') {
          return;
        }

        const group = props.groupList!.find((g: any) => g.id === id) as any;

        await props.onDeleteGroup(group);

        if (group && group.name === props.widgetGroup!.name) {
          props.onChangeWidgetGroup!(props.groupList![0]);
        }

        queryGroupList();
        // detectShowModal();
      } catch (error) {
        console.error(error);
      }
    };

    const emitBlur = (event) => {
      event.target.blur();
    };

    // 修改分组
    const handleModifyGroup = async (paramGroup) => {
      try {
        if (!paramGroup.refName) {
          OioNotification.error('失败', '分组名称不能为空');
        } else {
          if (paramGroup.refName !== (paramGroup.displayName || paramGroup.name)) {
            if (!props.onModifyGroup || typeof props.onModifyGroup !== 'function') {
              return;
            }

            paramGroup.name = paramGroup.refName;
            await props.onModifyGroup(paramGroup);
            queryGroupList();
            // detectShowModal();
          } else {
            // OioNotification.error('失败', '分组名称不能重复');
          }
        }

        paramGroup.refEditing = false;
      } catch (error) {
        console.error(error);
      }
    };

    // 添加分组
    const handleGroupTagInputConfirm = async () => {
      if (groupTagcreateInputValue.value) {
        if (!props.onCreateGroup || typeof props.onCreateGroup !== 'function') {
          return;
        }
        await props.onCreateGroup(groupTagcreateInputValue.value);
        await queryGroupList();
        groupTagcreateInputValue.value = '';
        // detectShowModal();
      } else {
        OioNotification.error('失败', '分组名称不能为空');
      }
      addGroupInputVisible.value = false;
    };

    const showExpand = ref<boolean>(false);
    const groupBoxRef = ref<HTMLElement | null>(null);
    const groupTagRef = ref<HTMLElement | null>(null);
    const boxRowLastList = ref<Record<string, string>[]>([]);
    const tagRowLastList = ref<Record<string, string>[]>([]);
    const firstLineIndexs: number[] = [];

    // 分组宽度行末宽度自适应
    const detectShowExpand = () => {
      nextTick(() => {
        if (props.isShowed) {
          // 32是每行高度，10是row-gap
          showExpand.value = groupBoxRef.value ? groupBoxRef.value?.scrollHeight > 42 : false;
          boxRowLastList.value = new Array(props.groupList?.length).fill({});
          if (props.enableAdaptiveWidtth) {
            nextTick(() => {
              computeAdaptiveWidth(groupBoxRef.value, boxRowLastList, props.adaptiveWidth, undefined, firstLineIndexs);
              const index = props.groupList?.findIndex((group) => group.id === props.currentGroup?.id);
              if (index) {
                const isFirstLine = firstLineIndexs.includes(index);
                expandGroup.value = expandGroup.value || !isFirstLine;
              }
            });
          }
        }
      });
    };

    // 弹窗的分组宽度适应计算
    const detectShowModal = () => {
      nextTick(() => {
        if (visibleGroupDialog.value) {
          if (props.enableAdaptiveWidtth) {
            tagRowLastList.value = new Array(props.groupList?.length).fill({});
            nextTick(() => {
              computeAdaptiveWidth(groupTagRef.value, tagRowLastList, props.adaptiveWidth, 16, firstLineIndexs);
            });
          }
        }
      });
    };

    const totalItem = computed(() => {
      let sum = 0;
      props.groupList?.forEach((group) => {
        if (group.iconNum || group.itemNum) {
          sum += Number(group.iconNum || group.itemNum || 0);
        }
      });
      return sum;
    });

    watch(
      () => props.isShowed,
      () => {
        detectShowExpand();
      }
    );

    watch(
      () => props.groupList,
      () => {
        detectShowExpand();
      },
      { immediate: true, deep: true }
    );

    watch(
      () => visibleGroupDialog.value,
      () => {
        detectShowModal();
      }
    );

    return {
      expandGroup,
      onChangeWidgetGroup,
      startEditing,
      visibleGroupDialog,
      addGroupInputVisible,
      groupTagcreateInputValue,
      onCloseGroupModal,
      handleDeleteGroup,
      emitBlur,
      handleModifyGroup,
      handleGroupTagInputConfirm,
      showExpand,
      groupBoxRef,
      groupTagRef,
      boxRowLastList,
      tagRowLastList,
      totalItem
    };
  }
});
</script>
