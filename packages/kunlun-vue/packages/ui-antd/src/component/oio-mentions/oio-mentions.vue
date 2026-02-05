<script lang="ts">
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { Menu as AMenu, MenuItem as AMenuItem, SubMenu as ASubMenu } from 'ant-design-vue';
import { textAreaProps } from 'ant-design-vue/es/input/inputProps';
import { type InputFocusOptions } from 'ant-design-vue/es/vc-input/utils/commonUtils';
import {
  computed,
  CSSProperties,
  defineComponent,
  h,
  nextTick,
  onMounted,
  PropType,
  ref,
  shallowRef,
  watch
} from 'vue';
import { OioDropdown } from '../oio-dropdown';
import { EditorBlock, type OioMentionOption, type OioMentionTrigger } from './typing';
import { useContenteditable } from './use-contenteditable';
import { useContextmenu } from './use-contextmenu';

export default defineComponent({
  name: 'OioMentions',
  props: {
    ...textAreaProps(),
    value: {
      type: String
    },
    triggers: {
      type: [Object, Array] as PropType<OioMentionTrigger | OioMentionTrigger[]>
    },
    options: {
      type: Array as PropType<OioMentionOption[]>,
      default: () => []
    },
    valueFormat: {
      type: Function as PropType<(opt: OioMentionOption) => string>,
      default: (opt: OioMentionOption) => `{${opt.value}}`
    },
    parseValue: {
      type: [Object, Function] as PropType<RegExp | ((value: string) => EditorBlock[])>,
      default: () => /\{([^{}]+)\}/g
    }
  },
  emits: ['update:value', 'change', 'focus', 'blur', 'select-mention', 'delete-mention'],
  setup(props, { emit, expose }) {
    // State
    const editorRef = ref<HTMLElement | null>(null);
    const blocks = shallowRef<EditorBlock[]>([]);

    const { handleMousedown, handlePaste } = useContenteditable(editorRef);

    // Menu State
    const {
      menuState,
      checkInputTrigger,
      handleTagClick,
      closeMenu,
      handleMenuKeydown,
      getKeysFromIndices,
      normalizedTriggers
    } = useContextmenu(
      computed(() => props.triggers),
      editorRef,
      blocks
    );

    const editorStyle = computed<CSSProperties>(() => {
      const { autoSize } = props;
      const style: CSSProperties = {};

      const LINE_HEIGHT = 22; // approx 14px * 1.5715
      const PADDING_Y = 8; // 4px + 4px
      const BORDER = 2; // 1px + 1px

      if (autoSize && typeof autoSize === 'object') {
        if (autoSize.minRows) {
          style.minHeight = `${autoSize.minRows * LINE_HEIGHT + PADDING_Y + BORDER}px`;
        }
        if (autoSize.maxRows) {
          style.maxHeight = `${autoSize.maxRows * LINE_HEIGHT + PADDING_Y + BORDER}px`;
          style.overflowY = 'auto';
        }
      } else if (props.rows) {
        // Fallback to fixed rows if autoSize is false/undefined but rows provided?
        // Standard textarea behavior: rows determines height.
        // But for contenteditable, we treat it as min-height usually.
        // If strict fixed height is needed, we would set height.
        // Let's assume rows sets min-height for now.
        style.minHeight = `${props.rows * LINE_HEIGHT + PADDING_Y + BORDER}px`;
      }

      return style;
    });

    // Non-reactive state
    const nodeMap = new WeakMap<Node, string>();

    // Helper: Generate UUID
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Helper: Create DOM for block
    const createBlockNode = (block: EditorBlock): Node => {
      if (block.type === 'mention') {
        const span = document.createElement('span');
        span.className = 'mention-tag';
        span.contentEditable = 'false';
        span.textContent = block.label;
        span.dataset.id = block.id;
        span.dataset.value = block.formattedValue || block.value;
        nodeMap.set(span, block.id);
        return span;
      } else {
        const text = document.createTextNode(block.content);
        nodeMap.set(text, block.id);
        return text;
      }
    };

    // Helper: Render all blocks to editor
    const renderBlocks = () => {
      const editor = editorRef.value;
      if (!editor) return;

      // Save selection state if possible
      // const savedRange = saveSelection();

      editor.innerHTML = '';
      nodeMap.delete(editor); // Clear old map entries implicitly by garbage collection, but here we just rebuild

      if (blocks.value.length === 0) {
        // Ensure at least one text block for input
        const emptyBlock: EditorBlock = { type: 'text', id: generateId(), content: '' };
        blocks.value = [emptyBlock];
      }

      blocks.value.forEach((block) => {
        const node = createBlockNode(block);
        editor.appendChild(node);
      });

      // Restore selection? Usually renderBlocks is called on init or full reset.
      // For incremental updates, we don't call this.
    };

    // Helper: Sync value to parent
    const syncValue = () => {
      const text = blocks.value
        .map((b) => {
          if (b.type === 'mention') {
            return b.formattedValue || b.value;
          }
          return b.content;
        })
        .join('');
      emit('update:value', text);
    };

    // Helper: Hydrate value to blocks
    const hydrateValue = () => {
      const { value, parseValue } = props;
      if (value === undefined || value === null) return;

      // Avoid re-hydrating if value matches current blocks to prevent cursor jumps
      const currentValue = blocks.value
        .map((b) => (b.type === 'mention' ? b.formattedValue || b.value : b.content))
        .join('');
      if (value === currentValue) return;

      const newBlocks: EditorBlock[] = [];

      if (typeof parseValue === 'function') {
        const parsed = parseValue(value);
        if (parsed) {
          // Ensure IDs are present
          newBlocks.push(
            ...parsed.map((b) => ({
              ...b,
              id: b.id || generateId()
            }))
          );
        }
      } else if (parseValue instanceof RegExp) {
        let lastIndex = 0;
        let match;
        // Ensure global flag for loop
        const regex = new RegExp(
          parseValue.source,
          parseValue.flags.includes('g') ? parseValue.flags : parseValue.flags + 'g'
        );

        while ((match = regex.exec(value)) !== null) {
          const index = match.index;
          if (index > lastIndex) {
            newBlocks.push({
              type: 'text',
              id: generateId(),
              content: value.slice(lastIndex, index)
            });
          }

          const matchStr = match[0];
          const content = match[1] || matchStr; // Group 1 is usually the ID/Value

          // Find label in options
          let foundOption: OioMentionOption | undefined;
          let foundTrigger: OioMentionTrigger | undefined;

          const findOpt = (opts: OioMentionOption[]): OioMentionOption | undefined => {
            for (const opt of opts) {
              if (opt.value === content) return opt;
              if (opt.children) {
                const found = findOpt(opt.children);
                if (found) return found;
              }
            }
            return undefined;
          };

          for (const trigger of normalizedTriggers.value) {
            foundOption = findOpt(trigger.options);
            if (foundOption) {
              foundTrigger = trigger;
              break;
            }
          }

          if (foundOption) {
            newBlocks.push({
              type: 'mention',
              id: generateId(),
              label: foundOption.label,
              value: foundOption.value,
              trigger: foundTrigger?.key || '',
              formattedValue: matchStr
            });
          } else {
            // Fallback: use content as label if not found
            newBlocks.push({
              type: 'mention',
              id: generateId(),
              label: content,
              value: content,
              trigger: '',
              formattedValue: matchStr
            });
          }

          lastIndex = regex.lastIndex;
        }

        if (lastIndex < value.length) {
          newBlocks.push({
            type: 'text',
            id: generateId(),
            content: value.slice(lastIndex)
          });
        }
      }

      // Fallback if no match or empty parse
      if (newBlocks.length === 0 && value) {
        newBlocks.push({ type: 'text', id: generateId(), content: value });
      }

      if (newBlocks.length === 0) {
        newBlocks.push({ type: 'text', id: generateId(), content: '' });
      }

      blocks.value = newBlocks;
      renderBlocks();
    };

    // Helper: Restore Selection
    const restoreSelection = (blockId: string, offset: number) => {
      nextTick(() => {
        const editor = editorRef.value;
        if (!editor) return;

        // Find the text node of the block
        // We need to traverse to find the text node mapped to blockId
        // This is a bit inefficient, but since we have nodeMap, maybe we can inverse lookup or just traverse.
        // Actually, nodeMap is Node -> ID.
        // We need ID -> Node.
        // Since we re-rendered, we can find the node by dataset-id or by traversing.
        // But text nodes don't have dataset.

        let targetNode: Node | undefined;
        const findNode = (parent: Node) => {
          for (let i = 0; i < parent.childNodes.length; i++) {
            const child = parent.childNodes[i];
            const id = nodeMap.get(child);
            if (id === blockId) {
              targetNode = child;
              return;
            }
            if (child.nodeType === Node.ELEMENT_NODE) {
              // Check if element itself is the block (mention)
              if ((child as HTMLElement).dataset.id === blockId) {
                targetNode = child;
                return;
              }
              // Recurse? Mentions are leaf blocks usually.
            }
          }
        };
        findNode(editor);

        if (targetNode) {
          const selection = window.getSelection();
          const range = document.createRange();

          if (targetNode.nodeType === Node.TEXT_NODE) {
            range.setStart(targetNode, Math.min(offset, (targetNode.textContent || '').length));
            range.collapse(true);
          } else {
            // It's an element (mention tag), place cursor after it?
            // Usually we want cursor in the next text block.
            // If we just inserted a mention, we usually append a text block after it.
            // So we should target that text block.
          }

          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      });
    };

    const insertMention = (option: OioMentionOption) => {
      let range: Range | null = null;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }

      // If selection is lost (e.g. clicking menu), use saved range
      if ((!range || !editorRef.value?.contains(range.startContainer)) && menuState.savedRange) {
        range = menuState.savedRange;
      }

      if (!range && !menuState.targetBlockId) return;

      const node = range ? range.startContainer : null;

      // Case 1: Replacing existing Mention Tag (Edit Mode)
      // We need to know which block we are editing.
      // In handleTagClick, we didn't store the blockId in menuState.
      // But we can infer it if we are clicking a tag?
      // Actually, insertMention is called from Menu click/enter.
      // If we opened menu via Tag Click, we need to know the target ID.
      // Let's add targetBlockId to menuState.

      if (menuState.targetBlockId) {
        // Edit existing mention
        const blockIndex = blocks.value.findIndex((b) => b.id === menuState.targetBlockId);
        if (blockIndex !== -1) {
          option = {
            ...option,
            value: menuState.targetBlockId
          };
          const newBlock: EditorBlock = {
            type: 'mention',
            id: menuState.targetBlockId, // Keep same ID or generate new? Keep same to preserve references?
            // Actually usually we replace content.
            label: option.label,
            value: option.value,
            trigger: menuState.triggerKey,
            formattedValue: props.valueFormat ? props.valueFormat(option) : option.value
          };

          const newBlocks = [...blocks.value];
          newBlocks[blockIndex] = newBlock;
          blocks.value = newBlocks;
          renderBlocks();
          syncValue();
          emit('select-mention', option, menuState.triggerKey);

          // Move cursor after the mention?
          // We need a text block after it.
          // If next block is not text, insert empty text block.
          if (blockIndex === newBlocks.length - 1 || newBlocks[blockIndex + 1].type !== 'text') {
            const nextId = generateId();
            newBlocks.splice(blockIndex + 1, 0, { type: 'text', id: nextId, content: '\u00A0' }); // NBSP to allow cursor
            blocks.value = newBlocks;
            renderBlocks();
            restoreSelection(nextId, 1);
          } else {
            // Restore to next text block
            restoreSelection(newBlocks[blockIndex + 1].id, 1); // Skip NBSP?
          }
        }
        closeMenu();
        return;
      }

      // Case 2: Inserting new Mention (Typing Mode)
      // We need to find the text block and split it.
      // node is likely the text node.
      if (!node) return;
      const blockId = nodeMap.get(node);
      if (!blockId) return;

      if (!range) return;

      const blockIndex = blocks.value.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const block = blocks.value[blockIndex];
      if (block.type !== 'text') return;

      const text = block.content;
      const cursorOffset = range.startOffset;

      // We need to identify the start of the trigger.
      // menuState.keyword is the search term.
      // menuState.triggerKey is the trigger.
      // But we handled "no space" logic.
      // So we need to find the trigger position relative to cursor.
      // The regex was `(${escapedKey})([^${escapedKey}\\s]*)$` matched against `beforeCursor`.

      const beforeCursor = text.slice(0, cursorOffset);
      const escapedKey = menuState.triggerKey.replace(/[.*+?^${}()|[\]\\/@]/g, '\\$&');
      const regex = new RegExp(`(${escapedKey})([^${escapedKey}\\s]*)$`);
      const match = beforeCursor.match(regex);

      if (!match) return; // Should not happen if menu is open and valid

      const matchIndex = match.index!; // Index in beforeCursor (which is start of text block)

      const preText = text.slice(0, matchIndex);
      const postText = text.slice(cursorOffset); // Text after cursor

      // Construct new blocks
      const preBlock: EditorBlock = { type: 'text', id: block.id, content: preText }; // Reuse ID for first part?
      const mentionBlockId = generateId();
      option = {
        ...option,
        value: mentionBlockId
      };
      const mentionBlock: EditorBlock = {
        type: 'mention',
        id: mentionBlockId,
        label: option.label,
        value: option.value,
        trigger: menuState.triggerKey,
        formattedValue: props.valueFormat ? props.valueFormat(option) : option.value
      };
      const postBlock: EditorBlock = { type: 'text', id: generateId(), content: postText || '\u00A0' }; // Use NBSP if empty to hold cursor?

      const newBlocks = [...blocks.value];
      // Replace original block with [pre, mention, post]
      // Filter out empty text blocks if they are not the only block?
      // But we need preBlock if it has content.

      const fragment: EditorBlock[] = [];
      if (preText) fragment.push(preBlock);
      fragment.push(mentionBlock);
      fragment.push(postBlock);

      newBlocks.splice(blockIndex, 1, ...fragment);
      blocks.value = newBlocks;

      renderBlocks();
      syncValue();
      emit('select-mention', option, menuState.triggerKey);

      // Restore cursor to start of postBlock
      restoreSelection(postBlock.id, 0); // 0 or 1 if NBSP?
      // If we used NBSP, offset 1 is better?
      // If content is empty string, we can't place cursor easily in some browsers.
      // Let's assume postBlock has at least a space or we rely on browser behavior for empty text node (it works if it exists).

      closeMenu();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      // Menu Navigation
      const handled = handleMenuKeydown(e, insertMention);
      if (handled) return;

      // Prevent default Enter behavior to avoid div creation?
      // Or handle it to insert newline text.
      const { key, ctrlKey, metaKey, isComposing } = e;
      if (!isComposing && key === 'Enter') {
        // Only insert newline on Ctrl/Meta + Enter
        if (ctrlKey || metaKey) {
          // do nothing.
          // using browser default behavior.
          e.stopPropagation();
        } else {
          // Always prevent default to stop contenteditable from creating divs/breaks
          e.preventDefault();
          props.onKeydown?.(e);
        }
      }
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Handle empty editor case (browser might remove everything)
      if (target.childNodes.length === 0) {
        target.innerHTML = ''; // Ensure clean state
        blocks.value = [{ type: 'text', id: generateId(), content: '' }];
        renderBlocks();
        syncValue();
        return;
      }

      // Incremental Update Strategy
      // 1. Identify which DOM node was modified
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;

      const anchorNode = selection.anchorNode;
      // If anchor is the editor itself (rare, but happens when empty), find the text node or create one
      if (anchorNode === target) {
        // This usually means we need to re-initialize or find the correct child
        // For now, let's rely on nodeMap lookup.
        // If we can't map it, we might need a full re-parse or safety check.
      }

      // Ensure we are looking at the text node, not the wrapper if possible
      if (anchorNode.nodeType === Node.ELEMENT_NODE && (anchorNode as Element).classList.contains('mention-tag')) {
        // Edited a mention tag? Should not happen due to contenteditable=false
        return;
      }

      const blockId = nodeMap.get(anchorNode);
      // Optimization: Only use fast path if we are editing a known text block AND the structure (node count) hasn't changed.
      // This ensures that if a block was deleted (changing node count), we fall through to full reconciliation.
      if (blockId && target.childNodes.length === blocks.value.length) {
        // Found the block! Update its content.
        const block = blocks.value.find((b) => b.id === blockId);
        if (block && block.type === 'text') {
          block.content = anchorNode.textContent || '';
          syncValue();
        }
      } else {
        // New node created by browser (e.g. Enter key, or pasted content)?
        // For simple text input, we should map existing nodes.
        // If structure changed significantly, we might need to reconcile DOM to Blocks.
        // A simple reconciliation for now:
        // Iterate over DOM nodes, match with blocks, insert new text blocks for unknown nodes.

        const newBlocks: EditorBlock[] = [];
        target.childNodes.forEach((node) => {
          const bId = nodeMap.get(node);
          if (bId) {
            const existing = blocks.value.find((b) => b.id === bId);
            if (existing) {
              if (existing.type === 'text') existing.content = node.textContent || '';
              newBlocks.push(existing);
            }
          } else {
            // New Text Node
            if (node.nodeType === Node.TEXT_NODE) {
              const newBlock: EditorBlock = {
                type: 'text',
                id: generateId(),
                content: node.textContent || ''
              };
              nodeMap.set(node, newBlock.id);
              newBlocks.push(newBlock);
            }
            // If it's an element (e.g. <div><br></div> from Enter), we need to flatten it or handle new lines.
            // For this basic version, we ignore complex HTML structure changes (Enter key usually creates divs).
            // We will handle Enter key in keydown to prevent div creation if needed.
          }
        });

        // Detect deleted mentions
        const newBlockIds = new Set(newBlocks.map((b) => b.id));
        blocks.value.forEach((block) => {
          if (block.type === 'mention' && !newBlockIds.has(block.id)) {
            emit('delete-mention', {
              key: block.id,
              label: block.label,
              value: block.value,
              trigger: block.trigger
            });
          }
        });

        blocks.value = newBlocks;
        syncValue();
      }

      emit('change', e);
      checkInputTrigger();
    };

    const handlePasteWrapper = (e: ClipboardEvent) => {
      handlePaste(e);
      if (editorRef.value) {
        handleInput(e as unknown as Event);
      }
    };

    const handleKeyup = (e: KeyboardEvent) => {
      if (menuState.visible && menuState.options.length > 0) {
        return;
      }
      // Avoid conflict with keydown navigation
      if (['Enter', 'Escape'].includes(e.key)) return;
      if (menuState.visible && ['ArrowUp', 'ArrowDown'].includes(e.key)) return;

      checkInputTrigger();
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('mention-tag')) {
        handleTagClick(target);
      } else {
        checkInputTrigger();
      }
    };

    // Removed redundant handleKeydown

    // Public Methods
    const focus = (options?: InputFocusOptions) => {
      // do nothing.
      // using click event process focus
    };

    const blur = () => {
      editorRef.value?.blur();
    };

    expose({
      focus,
      blur
    });

    onMounted(() => {
      hydrateValue();
    });

    watch(
      () => props.value,
      () => {
        hydrateValue();
      }
    );

    // Render function
    return () => {
      const renderMenuItems = (options: OioMentionOption[], depth = 0) => {
        return options.map((opt, index) => {
          const isActive = menuState.activePathIndices[depth] === index;
          if (opt.children && opt.children.length > 0) {
            return h(
              ASubMenu,
              {
                key: opt.value,
                title: opt.label,
                class: { 'ant-dropdown-menu-item-selected ant-menu-submenu-active': isActive },
                popupClassName: 'oio-dropdown-submenu'
              },
              {
                default: () => renderMenuItems(opt.children || [], depth + 1)
              }
            );
          }
          return h(
            AMenuItem,
            {
              key: opt.value,
              class: { 'ant-menu-item-active': isActive },
              onClick: () => insertMention(opt)
            },
            {
              default: () => {
                if (opt.icon) {
                  return h('div', { class: 'oio-mentions-item-wrapper' }, [
                    h(OioIcon, { icon: opt.icon, size: 18 }),
                    h('span', {}, opt.label)
                  ]);
                }
                return opt.label;
              }
            }
          );
        });
      };

      // Use getKeysFromIndices from hook

      const { selectedKeys, openKeys } = getKeysFromIndices();

      return h('div', { class: 'oio-mentions-wrapper' }, [
        h('div', {
          ref: editorRef,
          contenteditable: !props.readonly,
          class: {
            'oio-mentions-editor': true,
            'oio-mentions-editor-readonly': !!props.readonly,
            'oio-mentions-editor-disabled': props.disabled,
            'oio-mentions-editor-borderless': props.bordered === false
          },
          style: editorStyle.value,
          onInput: handleInput,
          onKeydown: handleKeydown,
          onKeyup: handleKeyup,
          onClick: handleClick,
          onMousedown: handleMousedown,
          onPaste: handlePasteWrapper
        }),
        h(
          OioDropdown,
          {
            visible: menuState.visible,
            'onUpdate:visible': (val: boolean) => (menuState.visible = val),
            trigger: ['contextmenu']
          },
          {
            default: () =>
              h('div', {
                style: {
                  position: 'fixed',
                  left: `${menuState.x}px`,
                  top: `${menuState.y - 8}px`,
                  width: '100px',
                  height: '1px',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  overflow: 'hidden'
                }
              }),
            overlay: () =>
              h(
                AMenu,
                {
                  selectedKeys: selectedKeys,
                  openKeys: openKeys, // Pass openKeys to expand submenus
                  style: { maxHeight: '200px', overflow: 'hidden auto' }
                },
                { default: () => renderMenuItems(menuState.options) }
              )
          }
        )
      ]);
    };
  }
});
</script>

<style lang="scss">
.oio-mentions-wrapper {
  position: relative;
  width: 100%;
}

.oio-mentions-editor {
  box-sizing: border-box;
  margin: 0;
  padding: 4px 11px;
  font-variant: tabular-nums;
  list-style: none;
  font-feature-settings: 'tnum';
  position: relative;
  width: 100%;
  min-width: 0;
  color: var(--oio-input-text-color);
  font-size: 14px;
  line-height: 1.5715;
  background-color: #fff;
  background-image: none;
  transition: all 0.3s;
  min-height: 32px;
  height: auto;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;

  &:focus {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    outline: 0;
  }

  &.oio-mentions-editor-readonly {
    padding: 0;
    min-height: unset;
  }

  &.oio-mentions-editor-disabled {
    color: rgba(0, 0, 0, 0.25);
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 1;
  }

  &.oio-mentions-editor-borderless {
    border: none;
    background-color: transparent;
    padding: 0;

    &:hover,
    &:focus {
      border: none;
      box-shadow: none;
      border-right-width: 0 !important;
    }
  }

  // Placeholder style simulation could be added here
  &:empty:before {
    content: attr(placeholder);
    color: #bfbfbf;
  }
}

.mention-tag {
  display: inline-block;
  color: var(--oio-tag-color);
  background-color: var(--oio-tag-background-color);
  border-radius: 4px;
  padding: 0 6px;
  margin: 0 3px;
  user-select: none;
  vertical-align: baseline;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
}
</style>
