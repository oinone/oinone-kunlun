<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import {
  OioSpin,
  PropRecordHelper,
  useInjectOioDefaultFormContext,
  useProviderOioDefaultFormContext
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, type PropType, ref, type VNode, vShow, withDirectives } from 'vue';
import { type GroupListItem, OioManageGroup, OioManageGroupProps } from '../../../components';
import { DefaultSearchProps, useProviderSearchPreferContext } from '../../../view';
import { GroupAll } from '../../typing';

function createIconButton(options: { onUploadIcon: () => void; $translate?; actions?: VNode[] }): VNode[] {
  const children: VNode[] = [...(options.actions || [])];
  return children;
}

function createGroupContent(options: {
  widgetGroup: Object;
  currentGroup: GroupListItem | undefined;
  groupList: GroupListItem[] | undefined;
  queryGroupList: Function;
  onChangeWidgetGroup: Function;
  onDeleteGroup: Function;
  onCreateGroup: Function;
  onModifyGroup: Function;
  adaptiveWidth: number;
}) {
  if (options.groupList && options.groupList.length) {
    if (options.groupList[0].id !== '-1') {
      GroupAll.name = translateValueByKey(GroupAll.name);
      options.groupList?.unshift(GroupAll);
    }
  }
  return createVNode(OioManageGroup, { ...options });
}

export default defineComponent({
  name: 'IconSearch',
  components: {
    OioManageGroup
  },
  inheritAttrs: false,
  props: {
    ...DefaultSearchProps,
    ...OioManageGroupProps,
    onSort: {
      type: Function as PropType<() => void>
    },
    onUploadIcon: {
      type: Function as PropType<() => void>
    },
    onManageGroup: {
      type: Function as PropType<() => void>
    }
  },
  setup(props) {
    const origin = ref<HTMLElement>();
    const formContext = useInjectOioDefaultFormContext();

    const onSearch = () => {
      props.onSearch?.();
    };

    const onReset = () => {
      props.onReset?.();
    };

    const onUploadIcon = () => {
      props.onUploadIcon?.();
    };

    const onManageGroup = () => {
      props.onManageGroup?.();
    };

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer: (triggerNode) => {
        if (formContext.getTriggerContainer) {
          return formContext.getTriggerContainer(triggerNode);
        }
        if (origin.value) {
          return origin.value;
        }
        return triggerNode.parentNode || document.body;
      }
    });

    useProviderSearchPreferContext({
      selected: computed(() => props.selectedPrefer),
      options: computed(() => props.searchPreferOptions)
    });

    return {
      origin,
      onSearch,
      onReset,
      onUploadIcon,
      onManageGroup
    };
  },
  render() {
    const { onUploadIcon, $translate } = this;

    const { default: defaultSlot, actions: actionSlot } = PropRecordHelper.collectionSlots(this.$slots, [
      { origin: 'default', isNotNull: true },
      { origin: 'actions', isNotNull: true }
    ]);

    const searchContent = () => {
      const iconButtons = createIconButton({ onUploadIcon, $translate, actions: actionSlot() });
      return [
        createVNode('div', { class: 'default-iconSearch-searchContent' }, [
          createVNode('div', { class: 'default-iconSearch-searchContent-field' }, defaultSlot()),
          createVNode('div', { class: 'default-iconSearch-searchContent-button' }, iconButtons)
        ])
      ];
    };

    const groupContent = () => {
      return [
        createGroupContent({
          widgetGroup: this.widgetGroup!,
          currentGroup: this.currentGroup,
          groupList: this.groupList,
          queryGroupList: this.queryGroupList!,
          onChangeWidgetGroup: this.onChangeWidgetGroup!,
          onDeleteGroup: this.onDeleteGroup!,
          onModifyGroup: this.onModifyGroup!,
          onCreateGroup: this.onCreateGroup!,
          adaptiveWidth: 100
        })
      ];
    };

    return withDirectives(
      createVNode(
        'div',
        { class: 'default-iconSearch' },
        {
          default: () => {
            return [
              ...searchContent(),
              createVNode(
                OioSpin,
                {
                  loading: !this.groupList?.length,
                  wrapperClassName: 'default-iconSearch-item default-iconSearch-group'
                },
                () => createVNode('div', { style: { display: 'flex' } }, groupContent())
              )
            ];
          }
        }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
