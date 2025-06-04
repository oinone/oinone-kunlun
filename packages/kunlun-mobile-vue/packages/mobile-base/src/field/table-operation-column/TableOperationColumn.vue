<template>
  <column
    class-name="mobile-operation-column"
    :field="itemData"
    :fixed="fixed"
    :title="title || translateValueByKey('操作')"
    :width="realWidth"
    :sortable="false"
    align="center"
    :visible="!invisible"
  >
    <template #default="context">
      <div>
        <i
          v-if="showRowAction(context.row)"
          class="iconfont oinone-gengduo11"
          style="font-size: 18px"
          @click="onShowDrawerAction(context)"
        />
        <i v-else class="iconfont oinone-gengduo11" style="font-size: 18px; opacity: 0" />
      </div>
    </template>
    <template #header>
      <operation-title
        :need-operate-entity="needOperateEntity"
        :save-user-prefer="saveUserPrefer"
        :reload-user-prefer="reloadUserPrefer"
      />
    </template>
  </column>
  <van-popup
    :class="`column-popup ${DEFAULT_PREFIX}-action-dropdown-inline ${DEFAULT_PREFIX}-action-bar-with-more-popover-container`"
    teleport="body"
    :show="showActionPopup"
    position="bottom"
    safe-area-inset-bottom
    @close="onShowActionsPopup && onShowActionsPopup(false)"
  >
    <div :class="`${DEFAULT_PREFIX}-action-dropdown-content`">
      <action-bar
        v-if="showActionPopup"
        inline
        widget="action-bar"
        :parent-handler="code"
        :activeRecords="rowContext.row"
        :rowIndex="rowContext.rowIndex"
        :key="rowContext.rowid + rowContext.row.__updateTimestamp"
      >
        <slot />
      </action-bar>
    </div>
  </van-popup>
</template>
<script lang="ts">
import { StyleHelper } from '@oinone/kunlun-vue-ui-common';
import { ActiveRecord, translateValueByKey } from '@oinone/kunlun-engine';
import { computed, defineComponent, PropType, ref } from 'vue';
import { Column } from 'vxe-table';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { DslDefinition } from '@oinone/kunlun-dsl';
import { Popup as VanPopup } from 'vant';
import { isBoolean, isString } from 'lodash-es';
import ActionBar from '../../tags/ActionBar.vue';
import OperationTitle from '../../view/table/OperationTitle.vue';
import { OperateEntity } from '../../typing';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';

export default defineComponent({
  name: 'TableOperationColumn',
  components: {
    ActionBar,
    Column,
    OperationTitle,
    VanPopup
  },
  props: {
    code: {
      type: String
    },
    title: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: '40'
    },
    minWidth: {
      type: [String, Number],
      default: '120'
    },
    fixed: {
      type: [String, Boolean],
      default: 'right'
    },
    invisible: {
      type: Boolean,
      default: false
    },
    existExpandRow: {
      type: Boolean
    },
    needOperateEntity: {
      type: Object as PropType<OperateEntity>,
      default: () => {}
    },
    reloadUserPrefer: {
      type: Function
    },
    saveUserPrefer: {
      type: Function
    },
    itemData: {
      type: String
    },
    template: {
      type: Object as PropType<DslDefinition>,
      required: true
    },
    showActionPopup: Boolean,
    onShowActionsPopup: Function
  },
  setup(props, { slots }) {
    const realWidth = computed(() => StyleHelper.px(props.width));
    // const showActionPopup = ref(false);
    const showPopover = ref(false);
    const rowContext = ref<Record<string, any>>({});

    const executeExpression = (activeRecord: ActiveRecord | undefined, expression: string, errorValue?: any) => {
      return Expression.run(
        {
          activeRecords: [activeRecord || {}],
          rootRecord: {},
          openerRecord: {}
        } as ExpressionRunParam,
        expression,
        errorValue
      );
    };

    const executeInvisibleExpression = (invisible, row) => {
      if (isBoolean(invisible)) {
        return invisible;
      }
      if (isString(invisible)) {
        const expressionInvisible = executeExpression(row, invisible, false);
        if (isBoolean(expressionInvisible)) {
          return expressionInvisible;
        }
        return false;
      }
      return false;
    };

    const showRowAction = (row) => {
      const __slots = (slots as any).default() || [];
      const invisibleExpress = __slots.map((v) => v.props?.invisible) as Array<boolean | string>;
      const rst: boolean[] = [];

      invisibleExpress.forEach((invisible) => {
        rst.push(executeInvisibleExpression(invisible, row));
      });

      return rst.some((r) => !r);
    };

    const onSelect = (action) => {
      console.log('action', action);
    };

    const onShowDrawerAction = (val) => {
      // showActionPopup.value = true;
      props?.onShowActionsPopup?.(true);
      rowContext.value = val;
    };

    return {
      realWidth,
      showPopover,
      rowContext,
      showRowAction,
      onSelect,
      onShowDrawerAction,
      DEFAULT_PREFIX,
      translateValueByKey
    };
  }
});
</script>
