<script lang="ts">
import { translateValueByKey } from '@kunlun/engine';
import { ModelFieldType } from '@kunlun/meta';
import { OioSpin, PropRecordHelper } from '@kunlun/vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, ref, VNode, vShow, withDirectives } from 'vue';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../../basic';
import { GroupListItem, OioManageGroup, OioManageGroupProps } from '../../../components';
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
  slots: ['default', 'actions'],
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

    const searchContent = () => {
      const fieldChildren = PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'default', isNotNull: true }])
        .default()
        .map((fieldVNode) => {
          if (fieldVNode.props && fieldVNode.props.dslDefinition) {
            fieldVNode.props.dslDefinition.labelCol = { style: { 'flex-basis': '0px' } };
            fieldVNode.props.dslDefinition.wrapperCol = { style: { 'max-width': '100%' } };
            if (fieldVNode.props.ttype === ModelFieldType.DateTime) {
              fieldVNode.props.colStyle = { flex: '0 0 40%' };
            } else {
              fieldVNode.props.colStyle = { flex: '0 0 20%', 'max-width': '20%' };
            }
          }
          return fieldVNode;
        });

      const actions = PropRecordHelper.collectionSlots(this.$slots, [{ origin: 'actions', isNotNull: true }]).actions();

      const iconButtons = createIconButton({ onUploadIcon, $translate, actions });

      return [
        createVNode('div', { class: 'default-iconSearch-searchContent' }, [
          createVNode('div', { class: 'default-iconSearch-searchContent-field' }, fieldChildren),
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

    const defaultSlot = () => {
      return [
        ...searchContent(),
        createVNode(
          OioSpin,
          { loading: !this.groupList?.length, wrapperClassName: 'default-iconSearch-item default-iconSearch-group' },
          () => createVNode('div', { style: { display: 'flex' } }, groupContent())
        )
      ];
    };

    return withDirectives(createVNode('div', { class: 'default-iconSearch' }, { default: defaultSlot }), [
      [vShow, !this.invisible]
    ]);
  }
});
</script>
