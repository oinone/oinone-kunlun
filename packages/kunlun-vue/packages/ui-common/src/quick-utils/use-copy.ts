import { MessageHub } from '@oinone/kunlun-request';

let isSupportedClipboardCopy = true;

export function useCopy() {
  const copy = async (text: string): Promise<boolean> => {
    let res = await clipboardCopy(text);
    if (!res) {
      // 1. 创建临时文本框（不显示在页面上）
      const input = document.createElement('input');
      document.body.appendChild(input);

      // 2. 设置要复制的文本
      input.value = text;

      // 3. 选中文本框内容
      input.select();
      input.setSelectionRange(0, text.length); // 兼容移动设备

      // 4. 执行复制命令，并设置结果
      res = document.execCommand('copy');

      // 5. 清理临时元素
      document.body.removeChild(input);
    }
    return res;
  };

  const clipboardCopy = async (text: string): Promise<boolean> => {
    if (isSupportedClipboardCopy) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        console.error('copy text error.', e);
        isSupportedClipboardCopy = false;
        return false;
      }
    }
    return false;
  };

  const copyAndNotify = async (text: string): Promise<void> => {
    const res = await copy(text);
    if (res) {
      MessageHub.success('复制成功');
    } else {
      MessageHub.error('复制失败，请手动复制');
    }
  };

  return {
    browserCopy: copy,
    browserCopyAndNotify: copyAndNotify
  };
}
