<template>
  <div class="group-list-component-item" :class="[item.invisible && 'group-list-component-item-hide']">
    <div class="group-list-component-item-move-box">
      <oio-icon icon="oinone-move-handler" size="28" style="transform: rotate(90deg)"></oio-icon>
    </div>

    <a-collapse v-model:activeKey="activeKey" @change="onOpen">
      <a-collapse-panel key="1">
        <template #header>
          <div class="group-item-collapse-panel-header">
            <span @click.stop v-if="edit">
              <oio-input style="width: 100px" v-model:value="item.displayName" @blur="onChangeDisplayName"></oio-input>
            </span>
            <span style="display: flex; align-items: center" v-else>
              <span class="title">{{ item.displayName }}（{{ list.length || 0 }}）</span>
              <oio-icon @click.stop="edit = true" icon="oinone-bianji" color="rgba(0,0,0,0.65)" size="14"></oio-icon>
            </span>
            <a-popconfirm
              v-if="!item.sys"
              :title="$translate('是否删除当前分组？')"
              overlayClassName="oio-popconfirm"
              :ok-text="$translate('确定')"
              :cancel-text="$translate('取消')"
              @confirm="$emit('delete')"
            >
              <oio-icon @click.stop icon="oinone-remove" color="rgba(0,0,0,0.65)" size="14"></oio-icon>
            </a-popconfirm>
          </div>
        </template>
        <draggable
          class="group-item-collapse-panel-list"
          v-model="list"
          :animation="200"
          handle=".group-item-collapse-panel-item-drag"
          group="groupComponent"
          itemKey="id"
          @change="onSort"
        >
          <template #item="{ element, index }">
            <div class="group-item-collapse-panel-item group-item-collapse-panel-item-drag">
              <div class="group-item-collapse-panel-item-tag" v-if="!element.sys">
                <div style="transform: scale(0.8); margin-top: -1px">{{ $translate('自定义') }}</div>
              </div>
              <oio-icon :icon="element.icon || 'oinone-xinxi'" color="var(--oio-primary-color)" size="32px"></oio-icon>
              <div class="group-item-collapse-panel-item-title">{{ element.displayName }}</div>
            </div>
          </template>
        </draggable>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import draggable from 'vuedraggable';
import { Condition } from '@oinone/kunlun-request';
import { Pagination } from '@oinone/kunlun-engine';
import { OioIcon, OioInput } from '@oinone/kunlun-vue-ui-antd';
// import { ComponentDefinitionService } from '../../service';
import { sortWidget } from '../../service/UiWidgetSortService';

export default defineComponent({
  components: {
    draggable,
    OioIcon,
    OioInput
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const activeKey = ref('1');
    const edit = ref(false);
    const list = ref<any[]>([]);

    const onChangeDisplayName = () => {
      emit('update-display-name');

      edit.value = false;
    };

    const query = async () => {
      const condition = new Condition('group').equal(props.item.name);

      // const rst = await ComponentDefinitionService.INSTANCE.queryPage(
      //   condition,
      //   {
      //     current: 1,
      //     pageSize: 500
      //   } as Pagination,
      //   { orders: { field: 'priority', direction: 'ASC' } }
      // );
      // list.value = rst.content;
    };
    query();

    const onOpen = async (key: string[]) => {
      if (key.length > 1) {
        query();
      }
    };

    const onSort = async (e) => {
      let val;

      // 分组内部拖拽
      if (e.moved) {
        val = e.moved;
      } else if (e.added) {
        // 分组里面的组件拖拽到其他分组
        val = e.added;
      }

      if (val) {
        const targetId = val.element.id;
        const targetNewIndex = val.newIndex;
        let aheadId;
        if (targetNewIndex > 0) {
          aheadId = list.value[targetNewIndex - 1]?.id;
        }

        const groupName = e.added ? props.item.name : '';
        await sortWidget(targetId, aheadId, groupName);
      }
    };

    return {
      activeKey,
      edit,
      list,

      onChangeDisplayName,
      onOpen,
      onSort
    };
  }
});
</script>
<style lang="scss">
.group-list-component-item {
  display: flex;
  margin-bottom: var(--oio-margin);
  width: 100%;

  .ant-collapse > .ant-collapse-item {
    border-bottom: 0;
  }
  .group-list-component-item-move-box {
    cursor: pointer;
    display: flex;
    align-items: center;
    background: rgba(244, 244, 244, 0.5);
    border: 1px solid #e7e9ec;
    box-shadow: 2px 2px 6px 0px rgba(136, 156, 176, 0.2);
    border-radius: 4px;
    margin-right: 4px;
  }

  .group-item-collapse-panel-header {
    display: flex;
    align-items: center;
    flex: 1;
    .title {
      opacity: 0.85;
      font-family: PingFangSC-Medium;
      font-size: 16px;
      color: #000000;
      line-height: 24px;
      font-weight: 500;
    }

    .oio-icon {
      margin-left: var(--oio-margin);
      cursor: pointer;
    }
  }

  .ant-collapse-content > .ant-collapse-content-box {
    padding: var(--oio-padding);
  }

  .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    color: #c0c4cc;
    font-size: 16px;
    vertical-align: middle;
  }

  .ant-collapse {
    flex: 1;
    border: none;
    background: #ffffff;
    box-shadow: 2px 2px 6px 0px rgba(136, 156, 176, 0.2);
    border-radius: 4px;

    & > .ant-collapse-item > .ant-collapse-header {
      padding: 16px;
      align-items: center;
    }

    .ant-collapse-content {
      border-top: 1px solid var(--oio-border-color);
    }

    .ant-tabs {
      flex: 1;
      margin-left: 40px;
    }

    .ant-tabs-top > .ant-tabs-nav {
      margin: 0;
    }

    .ant-tabs-top > .ant-tabs-nav:before {
      border-bottom: 0;
    }

    .group-item-collapse-panel-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--oio-margin);
      .group-item-collapse-panel-item {
        position: relative;
        background: rgba(244, 244, 244, 0.5);
        border: 1px solid #e3e7ee;
        border-radius: 4px;
        text-align: center;
        width: 90px;
        height: 90px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .group-item-collapse-panel-item-tag {
          width: 38px;
          height: 16px;
          background: var(--oio-primary-color);
          font-size: 12px;
          border-radius: 100px 100px 100px 2px;
          position: absolute;
          top: -8px;
          right: -14px;
          color: #fff;
        }

        .group-item-collapse-panel-item-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        &:hover {
          border-color: var(--oio-primary-color);
        }

        &-hide {
          opacity: 0.5;
          &:hover {
            border-color: #e3e7ee;
          }
          .group-item-collapse-panel-item-title {
            text-decoration: line-through;
          }
        }

        &-title {
          margin-top: 10px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
