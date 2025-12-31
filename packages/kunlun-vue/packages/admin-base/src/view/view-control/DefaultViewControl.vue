<template>
  <div
    class="default-view-control-icon"
    :class="{
      'default-view-control-icon-has-action': hasActions,
      'default-view-control-icon-left': actionJustify === FlexRowJustify.END
    }"
  >
    <div class="default-view-control-icon-inner">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FlexRowJustify } from '@oinone/kunlun-vue-ui-common';

export default defineComponent({
  inheritAttrs: false,
  props: {
    hasActions: {
      type: Boolean,
      default: true
    },
    actionJustify: {
      type: String as PropType<FlexRowJustify>
    }
  },
  setup(props) {
    return { FlexRowJustify };
  }
});
</script>
<style lang="scss">
$bottom: calc(100% + var(--oio-row-gap));

.oio-group-toolbar-flex-end {
  .default-view-control-icon {
    &.default-view-control-icon-has-action {
      left: 0;
      right: unset;
    }
  }
}
.default-view-control-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: calc(var(--oio-row-gap) / 2);
  justify-content: flex-end;

  &.default-view-control-icon-has-action {
    position: absolute;
    right: 0;
    margin-bottom: 0;
    bottom: $bottom;
  }

  &.default-view-control-icon-left {
    position: absolute;
    left: 0;
    right: unset;
    margin-bottom: 0;
    bottom: $bottom;
  }

  .default-view-control-icon-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    .table-user-prefer {
      position: unset;
      margin-top: -2px;
      .oio-icon {
        font-size: 16px;
        color: var(--oio-icon-color);
        cursor: pointer;
        padding: var(--oio-padding-sm);
        border-radius: var(--oio-border-radius);

        &:hover {
          background: var(--oio-hover-background-color);
          color: var(--oio-hover-text-color);
        }
      }
    }
  }

  .default-view-control-item {
    .oio-icon {
      cursor: pointer;
      padding: var(--oio-padding-sm);
      border-radius: var(--oio-border-radius);

      &:hover {
        background: var(--oio-hover-background-color);
        color: var(--oio-hover-text-color);
      }
    }
  }
}

.oio-default-minimalism-view {
  .default-view-control-icon-has-action-bar {
    right: var(--oio-padding);
    bottom: 100%;
  }

  .oio-default-view-inline {
    .default-view-control-icon-has-action-bar {
      right: 0;
      bottom: $bottom;
    }
    .default-view-control-icon {
      margin-bottom: calc(var(--oio-row-gap) / 2);
    }
  }
}

.default-view-control-popover {
  width: 400px;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.1);
  border-radius: var(--oio-border-radius);
  padding: 0;

  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>
