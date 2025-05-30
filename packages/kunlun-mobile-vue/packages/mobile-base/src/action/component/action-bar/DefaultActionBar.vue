<script lang="ts">
import { DownOutlined } from '@ant-design/icons-vue';
import { ActiveRecord, translateValueByKey } from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { CastHelper, StringHelper } from '@kunlun/shared';
import { ListSelectMode, OioDropdownTrigger, PropRecordHelper } from '@kunlun/vue-ui-common';
import DefaultDropdown from '../dropdown/DefaultDropdown.vue';
import DefaultActionBarBatchOpt from './DefaultActionBarBatchOpt.vue';
import {
  computed,
  createElementVNode,
  createVNode,
  defineComponent,
  PropType,
  ref,
  VNode,
  vShow,
  withDirectives
} from 'vue';
import { ActiveCountEnum } from '../../../typing';
import { DslRenderDefinition, onAllMounted } from '@kunlun/vue-widget';
import { isNil } from 'lodash-es';
import { CollectionActions } from '../../../util/collection-actions';
import { DEFAULT_PREFIX } from '@kunlun/vue-ui-mobile-vant';

const fragmentVNodeType = 'Symbol(Fragment)';
const ACTION_BAR_CLASS_NAME = `${DEFAULT_PREFIX}-action-bar`;

function isFragment(vns: VNode) {
  return vns.type.toString() === fragmentVNodeType;
}

function createMoreAction(
  vnodes: VNode[],
  inline: boolean,
  subActionBar: boolean,
  showActionPopup: boolean,
  onShowActionsPopup: Function,
  allMounted: Function | undefined
): VNode {
  return createVNode(
    DefaultDropdown,
    {
      class: `${ACTION_BAR_CLASS_NAME}-with-more-popover-container`,
      placement: 'top',
      trigger: OioDropdownTrigger.click,
      allMounted,
      inline,
      subActionBar,
      showActionPopup,
      onShowActionsPopup
    },
    {
      default: () => vnodes,
      trigger: () => [
        createElementVNode('div', { class: 'left-more' }, [
          createElementVNode('i', { class: 'iconfont oinone-gengduo11' }),
          translateValueByKey('更多')
        ])
      ]
    }
  );
}

export default defineComponent({
  name: 'DefaultActionBar',
  props: {
    currentHandle: {
      type: String
    },
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    dataSource: {
      type: Array as PropType<ActiveRecord[]>
    },
    activeRecords: {
      type: Array as PropType<ActiveRecord[]>
    },
    viewType: {
      type: String as PropType<ViewType>
    },
    invisible: {
      type: Boolean,
      default: false
    },
    inline: {
      type: Boolean,
      default: false
    },
    subActionBar: {
      type: Boolean,
      default: false
    },
    batchOpt: {
      type: Boolean,
      default: false
    },
    isTopView: {
      type: Boolean,
      default: false
    },
    activeCount: {
      type: Number
    },
    showActionNames: {
      type: Array as PropType<string[]>
    },
    allMounted: {
      type: Function
    },
    moreActionRender: {
      type: Function as PropType<
        (
          vnodes: VNode[],
          inline: boolean,
          subActionBar: boolean,
          showActionPopup: boolean,
          allMounted: Function | undefined
        ) => VNode
      >
    },
    selectMode: {
      type: String as PropType<ListSelectMode>
    },
    onSelectModeChange: {
      type: Function as PropType<(mode: ListSelectMode | undefined) => void>
    },
    onCheckboxAll: {
      type: Function as PropType<(selected: boolean) => void>
    },
    showActionPopup: Boolean,
    onShowActionsPopup: Function
  },
  components: { DownOutlined },
  inheritAttrs: false,
  setup(props) {
    const show = ref(false);

    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    const activeCount = computed(() => {
      if (props.batchOpt) {
        return ActiveCountEnum.TWO;
      }
      let val = props.activeCount;
      if (isNil(val)) {
        val = props.inline ? ActiveCountEnum.TWO : ActiveCountEnum.TWO;
      }
      return val;
    });

    const allowSelected = computed(() => {
      return props.selectMode === ListSelectMode.checkbox;
    });

    const checkboxAllState = computed(() => {
      const total = props.dataSource?.length || 0;
      const selectedCount = props.activeRecords?.length || 0;
      return {
        checked: total > 0 && total === selectedCount,
        indeterminate: selectedCount >= 1 && selectedCount < total,
        disabled: total === 0,
        count: selectedCount
      };
    });

    const updateValueAllowSelected = (val: boolean) => {
      if (val) {
        props.onSelectModeChange?.(ListSelectMode.checkbox);
      } else {
        props.onSelectModeChange?.(undefined);
      }
    };

    return { activeCount, show, allowSelected, checkboxAllState, updateValueAllowSelected };
  },
  render() {
    let nodeChildren = [] as VNode[];
    const classList = [ACTION_BAR_CLASS_NAME, `${DEFAULT_PREFIX}-scrollbar`];
    if (this.inline) {
      classList.push(`${ACTION_BAR_CLASS_NAME}-inline`);
      const collectionActions = new CollectionActions(this.showActionNames, 100);
      collectionActions.do(
        PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default()
      );
      return collectionActions.showActions;
    }
    // 列表的按关键字搜索不想提供search，但是又需要first-layer的效果
    if (this.isTopView) {
      classList.push(`${ACTION_BAR_CLASS_NAME}-first-layer van-safe-area-bottom`);
    }

    if (this.invisible) {
      classList.push(`${ACTION_BAR_CLASS_NAME}-invisible`);
    }

    const collectionActions = new CollectionActions(this.showActionNames, this.activeCount);
    collectionActions.do(
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default()
    );
    const { hasMore, showActionFlags, showActions, moreActions, moreActionFlags } = collectionActions;
    if (
      hasMore &&
      showActionFlags[showActionFlags.length - 1] &&
      moreActions.length &&
      moreActionFlags.some((v) => v)
    ) {
      classList.push(`${ACTION_BAR_CLASS_NAME}-has-more`);
      nodeChildren.push(
        (this.moreActionRender || createMoreAction)(
          moreActions,
          this.inline,
          this.subActionBar,
          this.showActionPopup!,
          this.onShowActionsPopup!,
          this.allMounted!
        )
      );
      nodeChildren.push(createElementVNode('div', { class: 'normal-actions' }, showActions));
    } else {
      nodeChildren = [createElementVNode('div', { class: 'normal-actions' }, [...showActions, ...moreActions])];
      // nodeChildren = [...showActions, ...moreActions];
    }

    if (this.batchOpt) {
      classList.push(`${ACTION_BAR_CLASS_NAME}-show-batch-opt`);
      const props = {
        checkboxAllState: this.checkboxAllState,
        onChange: (show) => {
          this.updateValueAllowSelected(show);
        },
        onCheckAll: (check) => {
          this.onCheckboxAll?.(check);
        }
      };
      nodeChildren.push(createVNode(DefaultActionBarBatchOpt, props));
    }

    return withDirectives(
      createVNode(
        'div',
        {
          ...PropRecordHelper.collectionBasicProps(
            this.$attrs,
            StringHelper.append(classList, CastHelper.cast(this.template?.class)),
            CastHelper.cast(this.template?.style)
          )
        },
        nodeChildren
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
