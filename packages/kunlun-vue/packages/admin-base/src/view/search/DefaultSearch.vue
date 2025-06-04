<script lang="ts">
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue';
import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import {
  BooleanHelper,
  ButtonType,
  CastHelper,
  DEFAULT_COLS,
  FormLayout,
  IconPlacement,
  OioButton,
  OioForm,
  OioFormItem,
  OioFormProps,
  OioIcon,
  PropRecordHelper,
  StringHelper,
  ValidateTrigger
} from '@oinone/kunlun-vue-ui-antd';
import { StableSlotProp } from '@oinone/kunlun-vue-ui-common';
import { DslRender, DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { cloneDeep } from 'lodash-es';
import { computed, createVNode, defineComponent, ref, VNode, vShow, withDirectives, withKeys } from 'vue';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '../../basic';
import { InternalWidget, ResolveMode } from '../../tags';
import { UserSearchPrefer } from '../../typing';
import { useProviderSearchPreferContext } from './context';
import SearchPrefer from './SearchPrefer.vue';
import { DefaultSearchProps } from './types';

function appendFieldDslDefinition(
  targets: DslDefinition[],
  widgets: DslDefinition[],
  expandSize: number,
  foldSize: number,
  cateFields?: string[]
): boolean {
  for (const widget of widgets) {
    const { dslNodeType } = widget;
    switch (dslNodeType as DslDefinitionType) {
      case DslDefinitionType.FIELD:
      case DslDefinitionType.ELEMENT: {
        if (BooleanHelper.isTrue(widget.invisible) || (cateFields?.length && cateFields.includes(widget.name))) {
          break;
        }
        const cloneWidget = cloneDeep(widget);
        cloneWidget.colSpan = DEFAULT_COLS / (foldSize + 1);
        targets.push(cloneWidget);
        cloneWidget.subIndex = -targets.length;
        if (targets.length === expandSize + 1) {
          return true;
        }
        break;
      }
      case DslDefinitionType.PACK:
      case DslDefinitionType.SLOT: {
        const children = widget.widgets;
        if (children) {
          if (appendFieldDslDefinition(targets, children, expandSize, foldSize, cateFields)) {
            return true;
          }
        }
        break;
      }
    }
  }
  return false;
}

function appendCateFieldDslDefinition(
  targets: DslDefinition[],
  widgets: DslDefinition[],
  cateFields?: string[]
): boolean {
  if (!cateFields?.length) {
    return false;
  }
  for (const widget of widgets) {
    const { dslNodeType } = widget;
    switch (dslNodeType as DslDefinitionType) {
      case DslDefinitionType.FIELD:
      case DslDefinitionType.ELEMENT: {
        if (cateFields.includes(widget.name)) {
          const cloneWidget = cloneDeep(widget);
          targets.push(cloneWidget);
        }
        break;
      }
      case DslDefinitionType.PACK:
      case DslDefinitionType.SLOT: {
        const children = widget.widgets;
        if (children) {
          if (appendCateFieldDslDefinition(targets, children, cateFields)) {
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
      {
        type: ButtonType.primary,
        onClick: options.onSearch
      },
      { default: () => options.translate?.('kunlun.button.search') || translateValueByKey('搜索') }
    )
  ];
  if (options.showSearchPrefer) {
    children.push(createVNode(SearchPrefer, options.preferProps));
  }
  children.push(
    createVNode(
      OioButton,
      {
        type: ButtonType.link,
        onClick: options.onReset,
        class: 'reset-icon'
      },
      {
        default: () =>
          createVNode(OioIcon, { icon: 'oinone-15qingkong-1', size: '18', color: 'var(--oio-primary-color)' })
      }
    )
  );
  if (options.hasExpandButton) {
    let expandText: string;
    if (isExpand) {
      expandText = options.translate?.('kunlun.button.fold') || translateValueByKey('折叠');
    } else {
      expandText = options.translate?.('kunlun.button.expand') || translateValueByKey('展开');
    }
    children.push(
      createVNode(
        OioButton,
        {
          type: ButtonType.link,
          iconPlacement: IconPlacement.AFTER,
          icon: 'oinone-xiala',
          onClick: options.onExpand
        },
        { default: () => expandText }
      )
    );
  }
  return [createVNode('div', { class: 'oio-default-search-action-bar' }, children)];
}

function createSearchBarCol(searchActionBar: VNode[], offset: number, invisible: boolean, foldSize: number) {
  return {
    internal: true,
    dslNodeType: DslDefinitionType.PACK,
    widgets: [],
    widget: InternalWidget.Col,
    span: DEFAULT_COLS / (foldSize + 1),
    offset,
    invisible,
    allInvisible: false,
    __slots: { default: () => searchActionBar }
  } as DslRenderDefinition;
}

export default defineComponent({
  name: 'DefaultSearch',
  components: {
    OioForm,
    OioFormItem,
    SearchPrefer,
    CaretDownOutlined,
    CaretUpOutlined
  },
  inheritAttrs: false,
  slots: ['default'],
  props: {
    ...DefaultSearchProps
  },
  setup(props, context) {
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

    useProviderSearchPreferContext({
      selected: computed(() => props.selectedPrefer),
      options: computed(() => props.searchPreferOptions)
    });

    const defaultChildrenAndStyle = computed(() => {
      const defaultChildren: VNode[] = [];
      let invisible = false;
      let hasExpandButton = false;

      if (props.template && !props.disabledExpand) {
        const { widgets } = props.template;
        if (widgets && widgets.length) {
          let fields: DslDefinition[] = [];
          const cateWidgets = [] as DslDefinition[];
          appendCateFieldDslDefinition(cateWidgets, widgets, props.cateFields);
          if (cateWidgets.length) {
            defaultChildren.push(
              DslRender.render({
                cateFields: props.cateFields,
                dslNodeType: DslDefinitionType.ELEMENT,
                widget: 'SearchTab',
                widgets: cateWidgets
              })!
            );
          }

          const finalExpandSize = props.invisibleSearch ? props.foldSize + 1 : props.foldSize;
          appendFieldDslDefinition(fields, widgets, finalExpandSize, props.foldSize, props.cateFields);
          hasExpandButton = fields.length > finalExpandSize;
          if (hasExpandButton) {
            fields = fields.slice(0, finalExpandSize);
          }

          if (!props.invisibleSearch) {
            const searchActionBar: VNode[] = createSearchBar(false, {
              hasExpandButton,
              showSearchPrefer: props.showSearchPrefer,
              onSearch,
              onReset,
              onExpand,
              translate: props.translate,
              preferProps: {
                selected: props.selectedPrefer,
                options: props.searchPreferOptions,
                onLoad: props.onLoadSearchPreferOptions,
                onCreate: props.onCreateSearchPrefer,
                onUpdate: props.onUpdateSearchPrefer,
                onRemove: props.onRemoveSearchPrefer,
                onSelect: props.onSelectSearchPrefer,
                onUnselect: props.onUnselectSearchPrefer
              }
            });
            invisible = !fields.length;

            const searchBarCol = createSearchBarCol(
              searchActionBar,
              (props.foldSize - fields.length) * (DEFAULT_COLS / (props.foldSize + 1)),
              invisible,
              props.foldSize
            );
            fields.push(searchBarCol);
          }
          defaultChildren.push(
            withDirectives(
              DslRender.render({
                internal: true,
                dslNodeType: DslDefinitionType.PACK,
                widgets: fields,
                widget: InternalWidget.Row,
                cols: DEFAULT_COLS,
                resolveOptions: {
                  mode: ResolveMode.NORMAL
                }
              })!,
              [[vShow, !props.isExpand]]
            )
          );
        }
      }

      if (hasExpandButton || props.disabledExpand) {
        const foldChildren = PropRecordHelper.collectionSlots(context.slots, [
          {
            origin: 'default',
            isNotNull: true
          }
        ])
          .default()
          .filter((VNode) => !props.cateFields?.includes(VNode.props?.dslDefinition?.name));

        const foldVNodes: VNode[] = [
          DslRender.render(
            {
              ...(props.template || {}),
              internal: true,
              dslNodeType: DslDefinitionType.PACK,
              widgets: [],
              widget: InternalWidget.Row,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              }
            },
            undefined,
            { default: () => foldChildren }
          )!
        ];
        if (!props.invisibleSearch) {
          const searchActionBar: VNode[] = createSearchBar(true, {
            hasExpandButton,
            showSearchPrefer: props.showSearchPrefer,
            onSearch,
            onReset,
            onExpand,
            translate: props.translate,
            preferProps: {
              selected: props.selectedPrefer,
              options: props.searchPreferOptions,
              onLoad: props.onLoadSearchPreferOptions,
              onCreate: props.onCreateSearchPrefer,
              onUpdate: props.onUpdateSearchPrefer,
              onRemove: props.onRemoveSearchPrefer,
              onSelect: props.onSelectSearchPrefer,
              onUnselect: props.onUnselectSearchPrefer
            }
          });
          const searchBarCol = createSearchBarCol(
            searchActionBar,
            props.foldSize * (DEFAULT_COLS / (props.foldSize + 1)), // 预留高级搜索区域
            invisible,
            props.foldSize
          );
          foldVNodes.push(
            DslRender.render({
              internal: true,
              dslNodeType: DslDefinitionType.PACK,
              widgets: [searchBarCol],
              widget: InternalWidget.Row,
              cols: DEFAULT_COLS,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              }
            })!
          );
        }
        let foldContent = createVNode('div', { class: `${DEFAULT_PREFIX}-default-search-fold-content` }, foldVNodes);
        if (!props.disabledExpand) {
          foldContent = withDirectives(foldContent, [[vShow, props.isExpand]]);
        }
        defaultChildren.push(foldContent);
      }

      return { defaultChildren };
    });

    return {
      origin,
      onExpand,
      onSearch,
      onReset,
      defaultChildrenAndStyle
    };
  },
  render() {
    const classList = [`${DEFAULT_PREFIX}-default-form`, `${DEFAULT_PREFIX}-default-search`];
    if (this.isExpand) {
      classList.push(`${DEFAULT_PREFIX}-default-search-expand`);
    }

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
              layout: FormLayout.horizontal,
              wrapperClassName: StringHelper.append(
                [`${DEFAULT_PREFIX}-default-form-wrapper`, `${DEFAULT_PREFIX}-default-search-wrapper`],
                this.wrapperClassName
              ).join(' '),
              data: this.formData,
              validateTrigger: ValidateTrigger.BLUR,
              onKeyup: withKeys(this.onSearch, ['enter'])
            },
            {
              default: () => this.defaultChildrenAndStyle.defaultChildren,
              ...StableSlotProp
            }
          )
        ]
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>
