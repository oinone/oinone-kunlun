<script lang="ts">
import { DslDefinitionType, DslSlotUtils } from '@oinone/kunlun-dsl';
import { CastHelper } from '@oinone/kunlun-shared';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { CSSStyle, DEFAULT_CARD_GUTTERS, FlexRowJustify, OioCheckbox, useClick } from '@oinone/kunlun-vue-ui-antd';
import { FlexRowAlign, ListSelectMode, PropRecordHelper, StyleHelper } from '@oinone/kunlun-vue-ui-common';
import { DslRender, DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, PropType, VNode } from 'vue';
import { ActionBar, InternalWidget, ResolveMode } from '../../tags';
import DefaultCardTitleToolbar from './DefaultCardTitleToolbar.vue';

export default defineComponent({
  name: 'DefaultCard',
  components: {
    ActionBar
  },
  inheritAttrs: false,
  props: {
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    width: {
      type: [Number, String]
    },
    minWidth: {
      type: [Number, String]
    },
    maxWidth: {
      type: [Number, String]
    },
    height: {
      type: [Number, String]
    },
    minHeight: {
      type: [Number, String]
    },
    maxHeight: {
      type: [Number, String]
    },
    selectMode: {
      type: String as PropType<keyof typeof ListSelectMode>
    },
    allowClick: {
      type: Boolean,
      default: undefined
    },
    onClick: {
      type: Function as PropType<(e: PointerEvent) => void>
    },
    isSelected: {
      type: Boolean
    },
    onCheckboxChange: {
      type: Function
    }
  },
  setup(props) {
    const style = computed<CSSStyle>(() => {
      return {
        width: StyleHelper.px(props.width),
        minWidth: StyleHelper.px(props.minWidth),
        maxWidth: StyleHelper.px(props.maxWidth),
        height: StyleHelper.px(props.height),
        minHeight: StyleHelper.px(props.minHeight),
        maxHeight: StyleHelper.px(props.maxHeight)
      } as CSSStyle;
    });

    const allowSelected = computed(() => {
      return props.selectMode === ListSelectMode.checkbox;
    });

    let onMousedown;
    let onMouseup;
    if (props.onClick) {
      ({ onMousedown, onMouseup } = useClick(props.onClick));
    }
    return {
      style,
      allowSelected,
      onMousedown,
      onMouseup
    };
  },
  render() {
    const {
      $slots,
      $attrs,
      template,
      style,
      allowSelected,
      isSelected,
      onCheckboxChange,
      allowClick,
      onMousedown,
      onMouseup
    } = this;
    const slotContext = CastHelper.cast<RowContext | undefined>(template?.__render__options?.slotContext);
    if (!slotContext) {
      return [];
    }
    const {
      default: defaultSlot,
      title: titleSlot,
      titleToolbar: titleToolbarSlot,
      content: contentSlot,
      rowActions: rowActionsSlot,
      click: clickSlot
    } = PropRecordHelper.collectionSlots($slots, [
      { origin: 'default' },
      { origin: 'title' },
      { origin: 'titleToolbar' },
      { origin: 'content' },
      { origin: 'rowActions' },
      { origin: 'click' }
    ]);
    const dslSlots = DslSlotUtils.fetchSlotsBySlotNames(template, ['title', 'titleToolbar', 'content', 'rowActions']);
    const classList: string[] = ['default-card'];
    let children: VNode[] = [];
    const { key: dataKey, data: activeRecords, index: rowIndex } = slotContext;
    const key = `${dataKey}#${activeRecords?.__updateTimestamp}` as string;
    const titleToolbar = titleToolbarSlot?.();
    let isAppendContentPaddingTop = false;
    if (titleSlot) {
      let title = titleSlot();
      if (titleToolbar) {
        const finalTitle = title;
        title = [
          DslRender.render(
            {
              dslNodeType: DslDefinitionType.PACK,
              widgets: [],
              widget: InternalWidget.Col,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              },
              mode: 'full',
              class: 'default-card-title-content'
            },
            undefined,
            {
              default: () => [
                DslRender.render(
                  {
                    dslNodeType: DslDefinitionType.PACK,
                    widgets: [],
                    widget: InternalWidget.Row,
                    resolveOptions: {
                      mode: ResolveMode.NORMAL
                    },
                    gutter: DEFAULT_CARD_GUTTERS
                  },
                  undefined,
                  {
                    default: () => finalTitle
                  },
                  { dynamicKey: true }
                )!
              ]
            }
          )!,
          DslRender.render(
            {
              dslNodeType: DslDefinitionType.PACK,
              widgets: [],
              widget: InternalWidget.Col,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              },
              mode: 'full',
              class: 'default-card-title-toolbar-wrapper',
              style: {
                flex: 'unset',
                height: '100%',
                ...(StyleHelper.convertStyleByDslDefinition(dslSlots?.titleToolbar) || {})
              },
              invisible: false,
              allInvisible: false
            },
            undefined,
            {
              default: () => [createVNode(DefaultCardTitleToolbar, {}, { default: () => titleToolbar })]
            },
            { dynamicKey: true }
          )!
        ];
      }
      const titleStyle = StyleHelper.convertStyleByDslDefinition(dslSlots?.title);
      if (titleStyle?.border || titleStyle?.borderBottom || titleStyle?.borderBottomWidth) {
        isAppendContentPaddingTop = true;
      }
      children.push(
        createVNode('div', { key: 'default-card-title', class: 'default-card-title', style: titleStyle }, [
          DslRender.render(
            {
              dslNodeType: DslDefinitionType.PACK,
              widgets: [],
              widget: InternalWidget.Row,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              },
              gutter: DEFAULT_CARD_GUTTERS,
              align: FlexRowAlign.MIDDLE,
              justify: FlexRowJustify.SPACE_BETWEEN,
              wrap: false
            },
            undefined,
            {
              default: () => title
            }
          )!
        ])
      );
    } else {
      classList.push('default-card-no-title');
      if (titleToolbar) {
        children.push(
          createVNode(
            DefaultCardTitleToolbar,
            {
              style: StyleHelper.convertStyleByDslDefinition(dslSlots?.titleToolbar)
            },
            { default: () => titleToolbar }
          )
        );
      }
    }
    const content = [...(contentSlot?.() || []), ...(defaultSlot?.() || [])];
    const contentStyle = StyleHelper.convertStyleByDslDefinition(dslSlots?.content);
    if (
      !isAppendContentPaddingTop &&
      (contentStyle?.border || contentStyle?.borderTop || contentStyle?.borderTopWidth)
    ) {
      isAppendContentPaddingTop = true;
    }
    children.push(
      createVNode(
        'div',
        {
          key: 'default-card-content',
          class: ['default-card-content', isAppendContentPaddingTop && 'default-card-content-padding-top'],
          style: contentStyle
        },
        [
          DslRender.render(
            {
              dslNodeType: DslDefinitionType.PACK,
              widgets: [],
              widget: InternalWidget.Row,
              resolveOptions: {
                mode: ResolveMode.NORMAL
              },
              gutter: DEFAULT_CARD_GUTTERS,
              align: FlexRowAlign.TOP
            },
            undefined,
            {
              default: () => content
            }
          )!
        ]
      )
    );
    const finalChildren = children;
    children = [
      createVNode(
        'div',
        {
          class: ['default-card-selected-wrapper', allowSelected && 'default-card-selected-wrapper-show-handler']
        },
        [
          createVNode(
            'div',
            {
              class: 'default-card-selected-wrapper-handler'
            },
            [
              createVNode(OioCheckbox, {
                checked: isSelected,
                'onUpdate:checked': onCheckboxChange
              })
            ]
          ),
          createVNode('div', { class: 'default-card-selected-wrapper-content' }, finalChildren)
        ]
      )
    ];
    if (rowActionsSlot) {
      const rowActions = rowActionsSlot();
      const rowActionsVNodes = [
        createVNode(
          ActionBar,
          {
            widget: 'CardRowActions',
            inline: true,
            activeRecords,
            rowIndex
          },
          { default: () => rowActions }
        )
      ];
      children.push(
        createVNode(
          'div',
          {
            key: 'default-card-row-actions',
            class: 'default-card-row-actions',
            style: StyleHelper.convertStyleByDslDefinition(dslSlots?.rowActions)
          },
          rowActionsVNodes
        )
      );
    } else {
      classList.push('default-card-no-row-actions');
    }
    const cardProps: Record<string, unknown> = {
      key,
      ...PropRecordHelper.collectionBasicProps($attrs, classList, style)
    };
    const finalAllowClick = allowClick && !!onMousedown && !!onMouseup && !!clickSlot;
    if (finalAllowClick) {
      classList.push('default-card-allow-click');
      children.push(createVNode('div', { key: 'default-card-click', class: 'default-card-click' }, clickSlot()));
      cardProps.onMousedown = onMousedown;
      cardProps.onMouseup = onMouseup;
    }
    return createVNode('div', cardProps, children);
  }
});
</script>
