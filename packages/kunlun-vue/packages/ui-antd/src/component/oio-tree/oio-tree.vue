<script lang="ts">
import { StringHelper } from '@oinone/kunlun-shared';
import {
  OioTreeNode,
  OioTreeProps,
  PropRecordHelper,
  TreeNodeCheckedEvent,
  TreeNodeExpandedEvent,
  TreeNodeSelectedEvent
} from '@oinone/kunlun-vue-ui-common';
import { Tree as ATree } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioSpin } from '../oio-spin';

export default defineComponent({
  name: 'OioTree',
  components: {
    ATree,
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...OioTreeProps
  },
  slots: ['title', 'icon', 'switcherIcon'],
  emits: [
    'update:expandedKeys',
    'update:selectedKeys',
    'update:checkedKeys',
    'update:loadedKeys',
    'selected',
    'expanded',
    'checked'
  ],
  setup(props, { emit }) {
    const internalLoadedKeys = ref<string[]>([]);
    const loadedKeys = computed({
      get() {
        return props.loadedKeys || internalLoadedKeys.value;
      },
      set(val: string[]) {
        internalLoadedKeys.value = val;
        emit('update:loadedKeys', val);
      }
    });

    const loadData = async (event: { dataRef: OioTreeNode; loaded: boolean }) => {
      if (event.loaded || event.dataRef.loaded) {
        loadedKeys.value = [...new Set([...loadedKeys.value, event.dataRef.key])];
        return;
      }
      try {
        await props.loadData?.(event.dataRef);
        loadedKeys.value = [...new Set([...loadedKeys.value, event.dataRef.key])];
      } catch (e) {
        console.error(e);
      }
    };

    const onSelected = (
      selectedKeys: string[],
      e: { nativeEvent: PointerEvent; node: { dataRef: OioTreeNode }; selected: boolean }
    ) => {
      const event: TreeNodeSelectedEvent = {
        origin: [selectedKeys, e],
        event: e.nativeEvent,
        node: e.node.dataRef,
        selected: e.selected,
        selectedKeys
      };
      emit('selected', event);
    };

    const onExpanded = (
      expandedKeys: string[],
      e: { nativeEvent: PointerEvent; node: { dataRef: OioTreeNode }; expanded: boolean }
    ) => {
      const event: TreeNodeExpandedEvent = {
        origin: [expandedKeys, e],
        event: e.nativeEvent,
        node: e.node.dataRef,
        expanded: e.expanded,
        expandedKeys
      };
      emit('expanded', event);
    };

    const onChecked = (
      checkedKeys: string[],
      e: { nativeEvent: PointerEvent; node: { dataRef: OioTreeNode }; checked: boolean }
    ) => {
      const event: TreeNodeCheckedEvent = {
        origin: [checkedKeys, e],
        event: e.nativeEvent,
        node: e.node.dataRef,
        checked: e.checked,
        checkedKeys
      };
      emit('checked', event);
    };

    return {
      loadData,
      loadedKeys,
      onSelected,
      onExpanded,
      onChecked
    };
  },
  render() {
    const {
      loading,
      loadingIndicator,
      wrapperClassName,

      data,
      loadData,
      loadedKeys,
      blockNode,
      showIcon,
      showLine,

      selectable,
      selectedKeys,

      expandedKeys,
      autoExpandParent,

      checkable,
      checkedKeys,
      checkStrictly
    } = this;
    const treeComponent = createVNode(
      ATree,
      {
        treeData: data,
        loadData,
        loadedKeys,
        blockNode,
        showIcon,
        showLine,

        selectable,
        selectedKeys,

        expandedKeys,
        autoExpandParent,

        checkable,
        checkedKeys,
        checkStrictly,

        'onUpdate:expandedKeys': (val) => this.$emit('update:expandedKeys', val),
        'onUpdate:checkedKeys': (val) => this.$emit('update:checkedKeys', val),
        'onUpdate:selectedKeys': (val) => this.$emit('update:selectedKeys', val),
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-tree`]),
        onSelect: this.onSelected,
        onExpand: this.onExpanded,
        onCheck: this.onChecked
      },
      PropRecordHelper.collectionSlots(this.$slots, ['title', showIcon ? 'icon' : '', 'switcherIcon'])
    );
    if (isNil(loading)) {
      return treeComponent;
    }
    return createVNode(
      OioSpin,
      {
        loading,
        loadingIndicator,
        wrapperClassName: StringHelper.append([`${DEFAULT_PREFIX}-tree-wrapper`], wrapperClassName).join(' ')
      },
      {
        default: () => [treeComponent]
      }
    );
  }
});
</script>
