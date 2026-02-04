export interface OioMentionOption {
  key: string;
  label: string;
  value: string;
  icon?: string;
  children?: OioMentionOption[];
}

export interface OioMentionTrigger {
  key: string;
  options: OioMentionOption[];
}

export interface MentionBlock {
  type: 'mention';
  id: string; // 唯一标识
  label: string; // 显示文本，例如 "变量A"
  value: string; // 实际值，例如 "varA"
  formattedValue?: string; // 格式化后的值，例如 "{varA}"
  trigger?: string; // 触发符号，例如 "/"
  data?: any; // 额外数据
}

export interface TextBlock {
  type: 'text';
  id: string;
  content: string;
}

export type EditorBlock = MentionBlock | TextBlock;
