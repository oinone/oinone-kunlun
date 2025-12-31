<template>
  <div class="sortable-group-component">
    <div class="sortable-group-body">
      <!-- 添加下拉 -->
      <a-popover
        overlay-class-name="oio-popover sortable-group-popover"
        trigger="click"
        placement="bottomLeft"
        :visible="visiblePopover"
      >
        <template #content>
          <oio-input :placeholder="$translate('搜索')" v-model:value="searchKey">
            <template #prefix>
              <oio-icon icon="oinone-sousuo2" size="16"></oio-icon>
            </template>
          </oio-input>
          <div class="sortable-group-select">
            <div
              v-for="field in showModelFields"
              class="sortable-group-select-item"
              :class="[existingFields.includes(field.name) && 'sortable-group-select-item-disabled']"
              @click="onSelectField(field)"
            >
              {{ field.disabled || field.label }}
            </div>
          </div>
        </template>
        <span class="sortable-group-title" @click="visiblePopover = !visiblePopover">
          <span class="sortable-group-title-content">
            <oio-icon size="14" icon="oinone-tianjia" color="var(--oio-primary-color)"></oio-icon>
            <span>{{ $translate(title) }}</span>
          </span>
        </span>
      </a-popover>

      <!-- 列表 -->
      <draggable
        v-model="draggableList"
        item-key="sort"
        :class="[draggableList.length && 'sortable-group-draggable-content']"
        handle=".sortable-group-field-drag-icon"
      >
        <template #item="{ element, index }">
          <div class="sortable-group-field">
            <oio-icon
              icon="oinone-tuodong"
              size="14"
              color="var(default-icon-color)"
              class="sortable-group-field-drag-icon"
            />
            <span class="sortable-group-field-label">{{ element.displayName }}</span>
            <a-radio-group v-model:value="element[directionKey]">
              <a-radio-button :value="EDirection.ASC">{{ $translate('升序') }}</a-radio-button>
              <a-radio-button :value="EDirection.DESC">{{ $translate('降序') }}</a-radio-button>
            </a-radio-group>
            <oio-icon class="sortable-group-field-remove" icon="oinone-shanchu3" size="14" @click="onRemove(index)" />
          </div>
        </template>
      </draggable>
    </div>

    <!-- 确认按钮 -->
    <div class="sort-group-footer">
      <oio-button type="primary" @click="onSubmit" size="small">
        {{ $translate(sureText) }}
      </oio-button>
    </div>
  </div>
</template>

<script lang="ts">
import { RuntimeModelField } from '@oinone/kunlun-engine';
import { EDirection } from '@oinone/kunlun-service';
import { OioButton, OioIcon, OioInput } from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import Draggable from 'vuedraggable';
import { SortableGroupOption } from './typing';

export default defineComponent({
  props: {
    list: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    fieldKey: {
      type: String,
      default: 'sortField'
    },
    directionKey: {
      type: String,
      default: 'direction'
    },
    title: {
      type: String
    },
    sureText: {
      type: String,
      default: '确定'
    },
    modelFields: {
      type: Array as PropType<SortableGroupOption[]>,
      default: () => []
    }
  },
  emits: ['update:list', 'change'],
  components: {
    OioIcon,
    OioButton,
    OioInput,
    Draggable
  },
  setup(props, { emit }) {
    const draggableList = ref<{ displayName?: string; [key: string]: any }[]>([]);
    const searchKey = ref('');
    const visiblePopover = ref(false);

    const showModelFields = computed(() => {
      if (!searchKey.value) {
        return props.modelFields;
      }
      return props.modelFields.filter((field) => field.label?.includes(searchKey.value));
    });

    const existingFields = computed(() => {
      return draggableList.value.map((v) => v[props.fieldKey]);
    });

    const onSelectField = (field: RuntimeModelField) => {
      if (existingFields.value.includes(field.name)) {
        return;
      }

      visiblePopover.value = false;
      draggableList.value.push({
        displayName: field.label,
        [props.fieldKey]: field.name,
        [props.directionKey]: EDirection.ASC
      });
    };

    const onRemove = (index: number) => {
      draggableList.value.splice(index, 1);
    };

    const onSubmit = () => {
      emit('update:list', [...draggableList.value]);
      emit('change', [...draggableList.value]);
    };

    const getPopupContainer = () => {
      return (target) => target.parentNode || document.body;
    };

    watch(
      () => props.list,
      (val) => {
        const fieldDisplayNameMap = new Map(props.modelFields.map((v) => [v.name, v.label]));

        draggableList.value = val.map((v) => ({
          ...v,
          displayName: fieldDisplayNameMap.get(v[props.fieldKey])
        }));
      },
      {
        immediate: true
      }
    );

    return {
      existingFields,
      draggableList,
      showModelFields,
      EDirection,
      searchKey,
      visiblePopover,
      onRemove,
      onSubmit,
      getPopupContainer,
      onSelectField
    };
  }
});
</script>

<style lang="scss">
.sortable-group-component {
  .sortable-group-body {
    padding: var(--oio-padding-lg) var(--oio-padding-sm);

    .sortable-group-title {
      display: inline-block;
      padding: 0 0 0 var(--oio-padding-sm);
    }

    .sortable-group-title-content {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--oio-primary-color);
    }

    .sortable-group-draggable-content {
      margin-top: var(--oio-margin);
    }

    .sortable-group-field {
      display: flex;
      align-items: center;
      padding: 5px var(--oio-padding-sm);
      cursor: pointer;
      border-radius: var(--oio-border-radius);

      &:hover {
        background-color: var(--oio-table-thead-bg);

        .oio-icon {
          color: var(--oio-primary-color);
        }
      }

      .sortable-group-field-label {
        flex: 1;
      }

      .sortable-group-field-remove {
        margin-left: var(--oio-margin-sm);
      }

      .ant-radio-group {
        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
          border-color: var(--oio-primary-color);
          color: var(--oio-primary-color);
        }

        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
          box-shadow: none;
        }

        .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):last-child {
          border-color: var(--oio-primary-color);
        }

        .ant-radio-button-wrapper:not(:first-child):before {
          background-color: var(--oio-primary-color);
        }

        .ant-radio-button-wrapper {
          height: 30px;
          padding: 0 var(--oio-padding-lg);
          font-size: var(--oio-font-size-sm);

          &:first-child {
            border-radius: var(--oio-border-radius) 0 0 var(--oio-border-radius);
          }

          &:last-child {
            border-radius: 0 var(--oio-border-radius) var(--oio-border-radius);
          }
        }

        .ant-radio-button-wrapper-checked span {
          color: var(--oio-primary-color);
        }
      }
    }
  }

  .sort-group-footer {
    padding: var(--oio-padding-md);
    border-top: 1px solid var(--oio-border-color);

    .oio-button {
      line-height: var(--oio-line-height-sm);
      padding: 2px var(--oio-padding-sm);
      height: auto;
      text-align: center;

      &.ant-btn > span {
        font-size: var(--oio-font-size-sm);
        line-height: unset;
      }
    }
  }

  .oio-icon {
    margin-right: var(--oio-margin-sm);
    cursor: pointer;
  }
}

.sortable-group-popover {
  width: 250px;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.1);
  border-radius: var(--oio-border-radius);
  padding: 0;

  .ant-popover-inner-content {
    padding: 0;
  }

  .oio-input {
    border: 0;

    &:hover,
    &:focus {
      border: 0;
      box-shadow: none;
    }
  }

  .sortable-group-select {
    max-height: 200px;
    padding: 4px;
    overflow-y: scroll;
    border-top: 1px solid var(--oio-border-color);

    .sortable-group-select-item {
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
      line-height: var(--oio-height);
      color: var(--oio-text-color);
      border-radius: var(--oio-border-radius-md);
      line-height: normal;
      padding: 5px;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }

      cursor: pointer;

      &.sortable-group-select-item-disabled {
        color: var(--oio-disabled-color);
        cursor: no-drop;
      }

      &:hover {
        background: var(--oio-select-dropdown-hover-background);
        color: var(--oio-select-dropdown-hover-color);
      }
    }
  }
}
</style>
