import { computed, type ComputedRef, reactive, Ref } from 'vue';
import { EditorBlock, OioMentionOption, OioMentionTrigger } from './typing';

export function useContextmenu(
  editorRef: Ref<HTMLElement | undefined>,
  triggers: Ref<OioMentionTrigger | OioMentionTrigger[] | undefined>,
  blocks: Ref<EditorBlock[]>
) {
  // Menu State
  const menuState = reactive({
    visible: false,
    x: 0,
    y: 0,
    triggerKey: '',
    keyword: '',
    activePathIndices: [0] as number[],
    options: [] as OioMentionOption[],
    loading: false,
    targetBlockId: undefined as string | undefined,
    savedRange: null as Range | null
  });

  const normalizedTriggers: ComputedRef<OioMentionTrigger[]> = computed(() => {
    const t = triggers.value;
    if (!t) return [];
    return Array.isArray(t) ? t : [t];
  });

  const getActiveOption = () => {
    let currentOptions = menuState.options;
    let option: OioMentionOption | undefined;
    for (const index of menuState.activePathIndices) {
      if (!currentOptions || currentOptions.length === 0) return undefined;
      option = currentOptions[index];
      if (option && option.children) {
        currentOptions = option.children;
      } else {
        currentOptions = [];
      }
    }
    return option;
  };

  const getCurrentLevelOptions = () => {
    let currentOptions = menuState.options;
    // Navigate to the parent of the last index
    for (let i = 0; i < menuState.activePathIndices.length - 1; i++) {
      const index = menuState.activePathIndices[i];
      if (currentOptions[index] && currentOptions[index].children) {
        currentOptions = currentOptions[index].children!;
      } else {
        return [];
      }
    }
    return currentOptions;
  };

  const updateMenuPosition = (range: Range) => {
    const rect = range.getBoundingClientRect();
    menuState.x = rect.left;
    menuState.y = rect.bottom + 5;
  };

  const checkInputTrigger = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      menuState.visible = false;
      return;
    }
    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    if (!editorRef.value?.contains(node)) {
      menuState.visible = false;
      return;
    }

    if (node.nodeType !== Node.TEXT_NODE) {
      menuState.visible = false;
      return;
    }

    const text = node.textContent || '';
    const beforeCursor = text.slice(0, range.startOffset);

    for (const trigger of normalizedTriggers.value) {
      // Escape special characters for RegExp.
      // We also escape '/' and '@' as requested, though they are not strictly special in RegExp.
      const escapedKey = trigger.key.replace(/[.*+?^${}()|[\]\\/@]/g, '\\$&');
      // Modified regex: No space requirement, find last occurrence of trigger followed by valid keyword chars
      const regex = new RegExp(`(${escapedKey})([^${escapedKey}\\s]*)$`);
      const match = beforeCursor.match(regex);
      if (match) {
        menuState.triggerKey = trigger.key;
        menuState.keyword = match[2];
        menuState.options = trigger.options.filter((opt) =>
          opt.label.toLowerCase().includes(menuState.keyword.toLowerCase())
        );

        if (menuState.options.length > 0) {
          menuState.visible = true;
          menuState.savedRange = range.cloneRange();
          menuState.activePathIndices = [0];
          const firstChild = menuState.options[0].children?.[0];
          if (firstChild) {
            menuState.activePathIndices.push(0);
          }
          updateMenuPosition(range);
        } else {
          menuState.visible = false;
        }
        return;
      }
    }
    menuState.visible = false;
  };

  const handleTagClick = (target: HTMLElement) => {
    const blockId = target.dataset.id;
    if (!blockId) return;

    const block = blocks.value.find((b) => b.id === blockId);
    if (block && block.type === 'mention') {
      const label = block.label || '';
      const trigger = normalizedTriggers.value.find((t) => label.startsWith(t.key));

      if (trigger) {
        menuState.triggerKey = trigger.key;
        menuState.keyword = '';
        menuState.options = trigger.options;
        menuState.visible = true;
        menuState.activePathIndices = [-1]; // Or [0]? Keep -1 for initial
        menuState.targetBlockId = blockId;

        const rect = target.getBoundingClientRect();
        menuState.x = rect.left;
        menuState.y = rect.bottom + 5;
      }
    }
  };

  const closeMenu = () => {
    menuState.visible = false;
    menuState.activePathIndices = [0];
    menuState.keyword = '';
    menuState.triggerKey = '';
    menuState.targetBlockId = undefined;
    menuState.savedRange = null;
  };

  const handleMenuKeydown = (e: KeyboardEvent, onSelect: (option: OioMentionOption) => void) => {
    if (menuState.visible && menuState.options.length > 0) {
      const currentOptions = getCurrentLevelOptions();
      const currentIndex = menuState.activePathIndices[menuState.activePathIndices.length - 1];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % currentOptions.length;
        menuState.activePathIndices[menuState.activePathIndices.length - 1] = nextIndex;

        const nextOption = currentOptions[nextIndex];
        if (nextOption && nextOption.children && nextOption.children.length > 0) {
          menuState.activePathIndices.push(0);
        }
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = (currentIndex - 1 + currentOptions.length) % currentOptions.length;
        menuState.activePathIndices[menuState.activePathIndices.length - 1] = nextIndex;

        const nextOption = currentOptions[nextIndex];
        if (nextOption && nextOption.children && nextOption.children.length > 0) {
          menuState.activePathIndices.push(0);
        }
        return true;
      }
      if (e.key === 'ArrowRight') {
        const currentOption = currentOptions[currentIndex];
        if (currentOption && currentOption.children && currentOption.children.length > 0) {
          e.preventDefault();
          menuState.activePathIndices.push(0); // Enter submenu, select first item
        }
        return true;
      }
      if (e.key === 'ArrowLeft') {
        if (menuState.activePathIndices.length > 1) {
          e.preventDefault();
          menuState.activePathIndices.pop(); // Leave submenu
        }
        return true;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const activeOption = getActiveOption();
        if (activeOption) {
          e.stopPropagation();
          onSelect(activeOption);
        }
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return true;
      }
    }
    return false;
  };

  const getKeysFromIndices = () => {
    const selectedKeys: string[] = [];
    const openKeys: string[] = [];
    if (!menuState.visible) {
      return { selectedKeys, openKeys };
    }

    let currentOptions = menuState.options;

    for (let i = 0; i < menuState.activePathIndices.length; i++) {
      const index = menuState.activePathIndices[i];
      if (!currentOptions || !currentOptions[index]) break;

      const opt = currentOptions[index];
      // If it's the last index, it's the selected item
      if (i === menuState.activePathIndices.length - 1) {
        selectedKeys.push(opt.value);
      } else {
        // Otherwise it's a parent menu that should be open
        openKeys.push(opt.value);
      }

      if (opt.children) {
        currentOptions = opt.children;
      } else {
        break;
      }
    }
    return { selectedKeys, openKeys };
  };

  return {
    menuState,
    checkInputTrigger,
    handleTagClick,
    closeMenu,
    handleMenuKeydown,
    getKeysFromIndices,
    normalizedTriggers
  };
}
