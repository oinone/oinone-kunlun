import { onBeforeUnmount, type Ref } from 'vue';

export function useContenteditable(editorRef: Ref<HTMLElement | undefined>) {
  // Click detection state
  let mousedownActive = false;
  let pointRecord: { x: number; y: number } | undefined;
  const DEFAULT_MAX_OFFSET = 3;

  const getWordBoundaries = (text: string, offset: number) => {
    const length = text.length;
    if (length === 0) return { start: 0, end: 0 };

    // Determine the character to analyze
    // If offset is at the end, look at the previous character
    let targetIndex = offset;
    if (targetIndex >= length) {
      targetIndex = length - 1;
    }

    const getCharType = (char: string) => {
      if (/[\w\u4e00-\u9fa5]/.test(char)) return 'word';
      if (/\s/.test(char)) return 'space';
      return 'other';
    };

    const type = getCharType(text[targetIndex]);

    let start = targetIndex;
    let end = targetIndex;

    // Expand left
    while (start > 0 && getCharType(text[start - 1]) === type) {
      start--;
    }

    // Expand right
    while (end < length && getCharType(text[end]) === type) {
      end++;
    }

    return { start, end };
  };

  const handleEditorClick = (e: MouseEvent) => {
    // Use caretRangeFromPoint to determine exact position
    // This helps when clicking on the padding of the editor
    if (document.caretRangeFromPoint) {
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range && editorRef.value?.contains(range.startContainer)) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  };

  const handleEditorDoubleClick = (e: MouseEvent) => {
    if (!document.caretRangeFromPoint) return;

    // Check if clicked on a mention tag directly
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (element && element.classList.contains('mention-tag')) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNode(element);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return;
    }

    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (!range || !editorRef.value?.contains(range.startContainer)) return;

    const { startContainer, startOffset } = range;
    const selection = window.getSelection();
    if (!selection) return;

    if (startContainer.nodeType === Node.TEXT_NODE) {
      const text = startContainer.textContent || '';
      const { start, end } = getWordBoundaries(text, startOffset);

      const newRange = document.createRange();
      newRange.setStart(startContainer, start);
      newRange.setEnd(startContainer, end);

      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  const handleEditorTripleClick = (e: MouseEvent) => {
    const editor = editorRef.value;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleEditorSelect = (e: MouseEvent) => {
    if (!pointRecord || !document.caretRangeFromPoint) return;

    const startCaret = document.caretRangeFromPoint(pointRecord.x, pointRecord.y);
    const endCaret = document.caretRangeFromPoint(e.clientX, e.clientY);

    if (
      startCaret &&
      endCaret &&
      editorRef.value?.contains(startCaret.startContainer) &&
      editorRef.value?.contains(endCaret.startContainer)
    ) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const range = document.createRange();

        if (startCaret.compareBoundaryPoints(Range.START_TO_START, endCaret) <= 0) {
          range.setStart(startCaret.startContainer, startCaret.startOffset);
          range.setEnd(endCaret.startContainer, endCaret.startOffset);
        } else {
          range.setStart(endCaret.startContainer, endCaret.startOffset);
          range.setEnd(startCaret.startContainer, startCaret.startOffset);
        }
        selection.addRange(range);
      }
    }
  };

  const handleWindowMousemove = (e: MouseEvent) => {
    if (!mousedownActive || !pointRecord) return;
    const offsetX = Math.abs(e.clientX - pointRecord.x);
    const offsetY = Math.abs(e.clientY - pointRecord.y);
    if (offsetX > DEFAULT_MAX_OFFSET || offsetY > DEFAULT_MAX_OFFSET) {
      handleEditorSelect(e);
    }
  };

  const handleWindowMouseup = (e: MouseEvent) => {
    window.removeEventListener('mousemove', handleWindowMousemove);
    window.removeEventListener('mouseup', handleWindowMouseup);

    if (mousedownActive && pointRecord) {
      const offsetX = Math.abs(e.clientX - pointRecord.x);
      const offsetY = Math.abs(e.clientY - pointRecord.y);

      if (offsetX <= DEFAULT_MAX_OFFSET && offsetY <= DEFAULT_MAX_OFFSET) {
        // It's a click, handle cursor placement
        if (e.detail >= 3) {
          handleEditorTripleClick(e);
        } else if (e.detail === 2) {
          handleEditorDoubleClick(e);
        } else {
          handleEditorClick(e);
        }
      } else {
        handleEditorSelect(e);
      }
    }
    mousedownActive = false;
    pointRecord = undefined;
  };

  const handleMousedown = (e: MouseEvent) => {
    mousedownActive = true;
    pointRecord = {
      x: e.clientX,
      y: e.clientY
    };
    window.addEventListener('mousemove', handleWindowMousemove);
    window.addEventListener('mouseup', handleWindowMouseup);
  };

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleWindowMousemove);
    window.removeEventListener('mouseup', handleWindowMouseup);
  });

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain');
    if (text) {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger input handling to update blocks
      if (editorRef.value) {
        editorRef.value.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  };

  return {
    handleMousedown,
    handlePaste
  };
}
