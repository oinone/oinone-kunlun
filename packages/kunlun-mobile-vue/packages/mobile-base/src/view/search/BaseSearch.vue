<script lang="ts">
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue';
import { DslDefinition, DslDefinitionType, ElementDslDefinition } from '@oinone/kunlun-dsl';
import { Icon as VanIcon } from 'vant';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { BooleanHelper, CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  DEFAULT_PREFIX,
  ButtonType,
  OioButton,
  OioForm,
  OioFormItem,
  OioFormProps,
  PropRecordHelper,
  ValidateTrigger
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { DslRender, DslRenderExtendProp } from '@oinone/kunlun-vue-widget';
import { cloneDeep } from 'lodash-es';
import { PatchFlags } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent, PropType, ref, VNode, vShow, withDirectives, withKeys } from 'vue';
import { CustomWidgetProps, InternalWidget, ResolveMode } from '../../tags';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../basic';
import { UserSearchPrefer } from '../../typing';

const FOCUS_UPDATE_CHILDREN = PatchFlags.NEED_PATCH & PatchFlags.DYNAMIC_SLOTS;

function appendFieldDslDefinition(targets: DslDefinition[], widgets: DslDefinition[], cateFields: string[]): boolean {
  for (const widget of widgets) {
    const { dslNodeType } = widget;
    switch (dslNodeType as DslDefinitionType) {
      case DslDefinitionType.FIELD: {
        if (BooleanHelper.isTrue(widget.invisible) || (cateFields?.length && cateFields.includes(widget.name))) {
          break;
        }
        const cloneWidget = cloneDeep(widget);
        cloneWidget.colSpan = 6;
        targets.push(cloneWidget);
        break;
      }
      case DslDefinitionType.PACK:
      case DslDefinitionType.ELEMENT:
      case DslDefinitionType.SLOT: {
        const children = widget.widgets;
        if (children) {
          if (appendFieldDslDefinition(targets, children, cateFields)) {
            return true;
          }
        }
        break;
      }
    }
  }
  return false;
}

function createSearchBar(
  isExpand: boolean,
  options: {
    hasExpandButton: boolean;
    showSearchPrefer: boolean;
    onSearch: () => void;
    onReset: () => void;
    onExpand: (expand: boolean) => void;
    translate?: (key: string) => string;
    preferProps: {
      selected: UserSearchPrefer | undefined;
      options: UserSearchPrefer[] | undefined;
      onLoad?: Function;
      onCreate?: Function;
      onUpdate?: Function;
      onRemove?: Function;
      onSelect?: Function;
      onUnselect?: Function;
    };
  }
): VNode[] {
  const children: VNode[] = [
    createVNode(
      OioButton,
      { type: ButtonType.default, onClick: options.onReset },
      {
        default: () =>
          `${options.translate?.('kunlun.button.reset') || translateValueByKey('重置')}${translateValueByKey(
            '筛选条件'
          )}`,
        icon: () =>
          createVNode(VanIcon, {
            name: 'replay',
            style: {
              transform: 'rotate(280deg)'
            }
          })
      }
    )
  ];
  if (options.showSearchPrefer) {
    children.push(
      createVNode(
        OioButton,
        { type: ButtonType.primary, onClick: options.onSearch },
        { default: () => translateValueByKey('搜索') }
      )
    );
  }
  return [createVNode('div', { class: `${DEFAULT_PREFIX}-default-search-action-bar` }, children)];
}

export default defineComponent({
  name: 'BaseSearch',
  components: {
    OioForm,
    OioFormItem,
    CaretDownOutlined,
    CaretUpOutlined
  },
  inheritAttrs: false,
  slots: ['default'],
  props: {
    ...OioFormProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
    invisible: {
      type: Boolean
    },
    invisibleSearch: {
      type: Boolean,
      default: true
    },
    formData: {
      type: Object,
      default: () => {}
    },
    isExpand: {
      type: Boolean,
      default: false
    },
    onExpand: {
      type: Function as PropType<(expand: boolean) => void>
    },
    onSearch: {
      type: Function as PropType<() => void>
    },
    onReset: {
      type: Function as PropType<() => void>
    },
    translate: {
      type: Function as PropType<(key: string) => string>
    },
    showSearchPrefer: {
      type: Boolean,
      default: false
    },
    searchPreferOptions: {
      type: Array as PropType<UserSearchPrefer[]>
    },
    selectedPrefer: {
      type: Object as PropType<UserSearchPrefer>
    },
    onLoadSearchPreferOptions: {
      type: Function
    },
    onCreateSearchPrefer: {
      type: Function
    },
    onUpdateSearchPrefer: {
      type: Function
    },
    onRemoveSearchPrefer: {
      type: Function
    },
    onSelectSearchPrefer: {
      type: Function
    },
    onUnselectSearchPrefer: {
      type: Function
    },
    cateFields: {
      type: Array as PropType<string[]>
    }
  },
  setup(props) {
    const origin = ref<HTMLElement>();
    const formContext = useInjectOioDefaultFormContext();

    const onExpand = () => {
      props.onExpand?.(!props.isExpand);
    };

    const onSearch = () => {
      props.onSearch?.();
    };

    const onReset = () => {
      props.onReset?.();
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

    return {
      origin,
      onExpand,
      onSearch,
      onReset
    };
  },
  render() {
    const defaultSlot: VNode[] = [];
    const {
      template,
      onSearch,
      onReset,
      onExpand,
      translate,
      showSearchPrefer,
      searchPreferOptions,
      selectedPrefer,
      onLoadSearchPreferOptions,
      onCreateSearchPrefer,
      onUpdateSearchPrefer,
      onRemoveSearchPrefer,
      onSelectSearchPrefer,
      onUnselectSearchPrefer,
      cateFields
    } = this;
    let invisible = false;
    const hasExpandButton = false;
    if (template) {
      const widgets = (template as any).widgetList || template.widgets || [];
      if (widgets && widgets.length) {
        const fields: DslDefinition[] = [];
        appendFieldDslDefinition(fields, widgets, cateFields!);
        invisible = !fields.length;
        // const searchBarCol = createSearchBarCol(searchActionBar, (3 - fields.length) * 6, invisible);
        // fields.push(searchBarCol);
        defaultSlot.push(
          createVNode(
            'div',
            {
              class: `${DEFAULT_PREFIX}-default-search-fields`
            },
            [
              DslRender.render({
                dslNodeType: DslDefinitionType.ELEMENT,
                widgets: fields,
                widget: InternalWidget.Row,
                cols: 24,
                resolveOptions: {
                  mode: ResolveMode.NORMAL
                },
                __render__options: { patchFlag: FOCUS_UPDATE_CHILDREN }
              } as (ElementDslDefinition & DslRenderExtendProp) | CustomWidgetProps)!
            ]
          )
        );

        if (!this.invisibleSearch) {
          const searchActionBar: VNode[] = createSearchBar(false, {
            hasExpandButton,
            showSearchPrefer,
            onSearch,
            onReset,
            onExpand,
            translate,
            preferProps: {
              selected: selectedPrefer,
              options: searchPreferOptions,
              onLoad: onLoadSearchPreferOptions,
              onCreate: onCreateSearchPrefer,
              onUpdate: onUpdateSearchPrefer,
              onRemove: onRemoveSearchPrefer,
              onSelect: onSelectSearchPrefer,
              onUnselect: onUnselectSearchPrefer
            }
          });
          defaultSlot.push(searchActionBar[0]);
        }
      }
    }
    const classList = [`${DEFAULT_PREFIX}-default-form`, `${DEFAULT_PREFIX}-default-search`];
    return withDirectives(
      createVNode(
        'div',
        {
          class: StringHelper.append(classList, CastHelper.cast(this.$attrs.class)),
          style: this.$attrs.style,
          ref: 'origin'
        },
        [
          createVNode(
            OioForm,
            {
              ...PropRecordHelper.convert(OioFormProps, CastHelper.cast(this)),
              wrapperClassName: StringHelper.append(
                [`${DEFAULT_PREFIX}-default-form-wrapper`, `${DEFAULT_PREFIX}-default-search-wrapper`],
                this.wrapperClassName
              ).join(' '),
              data: this.formData,
              validateTrigger: ValidateTrigger.BLUR,
              onKeyup: withKeys(onSearch, ['enter'])
            },
            {
              default: () => defaultSlot
            }
          )
        ]
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
