<template>
  <oio-spin :loading="!isReady">
    <div class="form-widgets-container">
      <draggable
        tag="div"
        class="group-list-component-draggable"
        animation="200"
        :list="runtimeHomepageConfigRules"
        handle=".homepage-setting-move-handler"
        itemKey="id"
        :move="onSortGroup"
      >
        <template #item="{ element, index }">
          <div class="homepage-form-container" :key="element.id">
            <slot :name="element.id" />
            <div class="homepage-setting-icon-group">
              <OioIcon icon="oinone-move-handler" class="homepage-setting-move-handler" :size="20" :rotate="90">
              </OioIcon>
              <OioIcon icon="oinone-shanchu" :onclick="() => handleDelete(index)"></OioIcon>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </oio-spin>
</template>

<script lang="ts">
import { OioButton, OioIcon, OioSpin } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent, PropType } from 'vue';
import draggable from 'vuedraggable';
import { HomepageConfigRule } from '../typing';

export default defineComponent({
  name: 'HomepageSettingField',
  components: { OioIcon, OioButton, OioSpin, draggable },
  props: {
    moduleName: {
      type: String
    },
    nodeWidgetLength: {
      type: Number,
      default: 0
    },
    isReady: {
      type: Boolean
    },
    disposeNodeWidget: {
      type: Function as PropType<(index: number) => void>
    },
    updateNodeWidgetSort: {
      type: Function as PropType<(index: number, futureIndex: number) => void>
    },
    runtimeHomepageConfigRules: {
      type: Array as PropType<HomepageConfigRule[]>,
      default: () => []
    }
  },
  setup(props) {
    const handleDelete = (index: number) => {
      props.disposeNodeWidget?.(index);
    };

    const onSortGroup = (moved) => {
      const { draggedContext } = moved;
      const { index, futureIndex } = draggedContext;
      props.updateNodeWidgetSort?.(index, futureIndex);
    };

    return {
      handleDelete,
      onSortGroup
    };
  }
});
</script>
<style lang="scss">
.form-widgets-container {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .homepage-form-container {
    width: 63%;
    border-radius: var(--oio-border-radius);
    background-color: #f5f6f8;
    position: relative;
    padding: var(--oio-padding-md);

    &:hover {
      background-color: rgba($color: #035dff, $alpha: 0.05);
    }

    .homepage-setting-icon-group {
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      align-items: center;
      padding: var(--oio-padding-md);
      gap: 16px;

      & > .oio-icon-oinone-move-handler {
        padding: var(--oio-padding-xxs);
        cursor: pointer;

        &:hover {
          color: var(--oio-primary-color);
        }
      }

      & > .oio-icon-oinone-shanchu {
        padding: var(--oio-padding-xxs);
        cursor: pointer;
      }
    }
  }
}
</style>
