<template>
  <div class="default-view-control-icon" :style="style">
    <div class="default-view-control-icon-inner">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { CSSStyle } from '@oinone/kunlun-shared';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  inheritAttrs: false,
  props: {
    hasActionBar: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const style = computed(() => {
      let style = {} as CSSStyle;
      if (props.hasActionBar) {
        style = {
          position: 'absolute',
          right: '0',
          bottom: `calc(100% + var(--oio-row-gap)`
        } as CSSStyle;
      } else {
        style = {
          marginBottom: 'var(--oio-row-gap)',
          justifyContent: 'flex-end'
        } as CSSStyle;
      }
      return style;
    });

    return {
      style
    };
  }
});
</script>
<style lang="scss">
.default-view-control-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  .default-view-control-icon-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .default-view-control-item {
    .oio-icon {
      cursor: pointer;
      padding: var(--oio-padding-sm);
      border-radius: var(--oio-border-radius);

      &:hover {
        background: var(--oio-dropdown-primary-color-hover);
      }
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
