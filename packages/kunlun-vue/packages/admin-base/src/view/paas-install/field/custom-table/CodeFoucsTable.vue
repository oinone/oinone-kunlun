<template>
  <div class="extra-container">
    <div class="extra-container-header">
      <div class="extra-container-label">{{ extraLabel }}</div>
      <div class="extra-container-desc" v-if="extraField">{{ extraField.label }}: {{ extraFieldValue || '-' }}</div>
    </div>
    <div class="extra-container-content">
      <a-steps v-if="extraAction && extraAction.length">
        <a-step status="finish" v-for="action in extraAction">
          <template #icon>
            <div class="extra-container-content-action-icon">
              <oio-icon :icon="`oinone-${action.icon}`" size="30px" color="#fff" />
            </div>
          </template>
          <template #title>
            <oio-button
              type="primary"
              :disabled="loading"
              @click="executeAction(action.actionName, action.displayName)"
            >
              {{ action.displayName }}
            </oio-button>
          </template>
          <template #description>
            <div class="extra-container-content-action-desc">{{ action.desc }}</div>
          </template>
        </a-step>
      </a-steps>
    </div>
    <slot />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { OioButton, OioIcon } from '@oinone/kunlun-vue-ui-antd';
import InlineTable from '../../../../components/common/inline-table/InlineTable.vue';

export default defineComponent({
  name: 'CodeFocusTable',
  props: [
    'loading',
    'extraLabel',
    'extraField',
    'extraFieldValue',
    'extraAction',
    'executeAction',
    'viewTemplate',
    'metaViewNodeCode'
  ],
  components: { OioButton, OioIcon, InlineTable },
  inheritAttrs: false
});
</script>

<style lang="scss">
.extra-container {
  &-header {
    display: flex;
    width: 100%;
    line-height: 20px;
    align-items: center;
  }

  &-label {
    font-size: 14px;
    color: var(--oio-text-color);
    font-weight: 500;
  }

  &-desc {
    font-size: 12px;
    color: var(--oio-text-color);
    line-height: 18px;
    font-weight: 400;
    margin-left: 12px;
  }

  &-content {
    padding: 16px 0;
    display: flex;
    justify-content: space-between;

    &-action {
      display: flex;

      &-desc {
        font-size: 14px;
        color: var(--oio-text-color);
        line-height: 20px;
        margin-top: 8px;
      }

      &-icon {
        background: #005ae3;
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 4px;
        display: flex;
        justify-content: center;
        align-items: center;

        i {
          font-size: 30px;
          color: white;
        }
      }
    }
  }

  .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title:after {
    background: var(--oio-primary-color);
  }
}
</style>
