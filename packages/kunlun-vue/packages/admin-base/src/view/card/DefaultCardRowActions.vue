<script lang="ts">
import { DownOutlined } from '@ant-design/icons-vue';
import { ButtonType, OioButton, OioDivider, OioDropdownPlacement, uniqueKeyGenerator } from '@kunlun/vue-ui-antd';
import { DividerType, OioDropdownTrigger, PropRecordHelper } from '@kunlun/vue-ui-common';
import { onAllMounted } from '@kunlun/vue-widget';
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType, VNode, vShow, withDirectives, withModifiers } from 'vue';
import DefaultDropdown from '../../action/component/dropdown/DefaultDropdown.vue';
import { ActiveCountEnum } from '../../typing';
import { CollectionActions } from '../../util/collection-actions';

function createMoreAction(vnodes: VNode[], allMounted: Function | undefined): VNode {
  return createVNode(
    DefaultDropdown,
    {
      trigger: [OioDropdownTrigger.click, OioDropdownTrigger.hover],
      placement: OioDropdownPlacement.tm,
      allMounted
    },
    {
      default: () => vnodes,
      trigger: () => [
        createVNode(OioButton, {
          type: ButtonType.link,
          icon: 'oinone-gengduo1',
          onClick: withModifiers(() => {}, ['prevent'])
        })
      ]
    }
  );
}

export default defineComponent({
  name: 'DefaultCardRowActions',
  components: {
    DownOutlined,
    ADropdown,
    AMenu,
    AMenuItem
  },
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
    }
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
        val = props.inline ? ActiveCountEnum.THREE : ActiveCountEnum.FIVE;
      }
      return val;
    });

    return {
      activeCount
    };
  },
  render() {
    const classList = ['action-bar', 'oio-scrollbar'];
    if (this.inline) {
      classList.push('action-bar-inline');
    }
    const collectionActions = new CollectionActions(this.showActionNames, this.activeCount);
    collectionActions.do(
      PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }]).default()
    );
    const { hasMore, showActionFlags, moreActionFlags } = collectionActions;
    let { showActions, moreActions } = collectionActions;
    if (
      hasMore &&
      showActionFlags[showActionFlags.length - 1] &&
      moreActions.length &&
      moreActionFlags.some((v) => v)
    ) {
      const originMoreAction = showActions[showActions.length - 1];
      moreActions = [originMoreAction, ...moreActions];
      showActions = showActions.slice(0, showActions.length - 1);
      showActions.push(
        createVNode('div', { class: 'more-action-item' }, [createMoreAction(moreActions, this.allMounted)])
      );
    } else {
      showActions = [...showActions, ...moreActions];
    }
    let dividerCount = 0;
    showActionFlags.forEach((v) => {
      if (v) {
        dividerCount++;
      }
    });
    const basicOffset = 100 / dividerCount;
    const maxWidth = `${basicOffset}%`;
    showActions = showActions.map((value, index) => {
      return withDirectives(
        createVNode('div', { class: 'default-card-row-actions-item', style: { maxWidth } }, [value]),
        [[vShow, showActionFlags[index]]]
      );
    });
    for (let i = 1; i < dividerCount; i++) {
      showActions.push(
        createVNode(OioDivider, {
          key: uniqueKeyGenerator(),
          style: { left: `${basicOffset * i}%` } as CSSStyleDeclaration,
          type: DividerType.vertical
        })
      );
    }
    return withDirectives(
      createVNode(
        'div',
        {
          ...PropRecordHelper.collectionBasicProps(this.$attrs, classList)
        },
        showActions
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
