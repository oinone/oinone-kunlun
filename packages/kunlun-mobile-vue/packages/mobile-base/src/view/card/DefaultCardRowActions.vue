<script lang="ts">
import { ButtonType, OioDropdownTrigger, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType, VNode, vShow, withDirectives } from 'vue';
import DefaultDropdown from '../../action/component/dropdown/DefaultDropdown.vue';
import { ActiveCountEnum } from '../../typing';
import { CollectionActions } from '../../util/collection-actions';
import { OioButton, DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { translateValueByKey } from '@oinone/kunlun-engine';
const ACTION_BAR_CLASS_NAME = `${DEFAULT_PREFIX}-action-bar`;

function createMoreAction(
  vnodes: VNode[],
  inline: boolean,
  subActionBar: boolean,
  allMounted: Function | undefined,
  rowShowActionsPopup?: boolean,
  onRowShowActionsPopup?: Function
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
      rowShowActionsPopup,
      onRowShowActionsPopup
    },
    {
      default: () => vnodes,
      trigger: () => [
        createVNode(
          'div',
          { class: `${DEFAULT_PREFIX}-action-item` },
          {
            default: () => [
              createVNode(
                OioButton,
                { type: ButtonType.link, icon: 'oinone-gengduo11' },
                { default: () => translateValueByKey('更多') }
              )
            ]
          }
        )
      ]
    }
  );
}

export default defineComponent({
  name: 'DefaultCardRowActions',
  components: {},
  inheritAttrs: false,
  props: {
    invisible: {
      type: Boolean,
      default: false
    },
    inline: {
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
    rowShowActionsPopup: Boolean,
    onRowShowActionsPopup: Function
  },
  setup(props) {
    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    const activeCount = computed(() => {
      let val = props.activeCount;
      if (isNil(val)) {
        val = props.inline ? ActiveCountEnum.TWO : ActiveCountEnum.TWO;
      }
      return val;
    });

    return {
      activeCount
    };
  },
  render() {
    let nodeChildren = [] as VNode[];
    const classList = [ACTION_BAR_CLASS_NAME, `${DEFAULT_PREFIX}-scrollbar`];

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
      const moreActionsNode = createMoreAction(
        moreActions,
        this.inline,
        true,
        this.allMounted!,
        this.rowShowActionsPopup,
        this.onRowShowActionsPopup
      );
      nodeChildren.push(
        createVNode('div', { class: 'normal-actions' }, { default: () => [...showActions, moreActionsNode] })
      );
    } else {
      nodeChildren = [
        createVNode('div', { class: 'normal-actions' }, { default: () => [...showActions, ...moreActions] })
      ];
    }
    return withDirectives(
      createVNode(
        'div',
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classList)
        },
        { default: () => nodeChildren }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
