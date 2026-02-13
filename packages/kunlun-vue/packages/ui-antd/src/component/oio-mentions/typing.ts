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

export interface TextBlock {
  type: 'text';
  id: string;
  content: string;
}

export interface LineBreakBlock {
  type: 'br';
  id: string;
  content: string;
}

export interface MentionBlock {
  type: 'mention';
  id: string;
  label: string;
  value: string;
  formattedValue?: string;
  trigger?: string;
  data?: any;
}

export enum OioMentionCheckedStrategy {
  all = 'all',
  child = 'child'
}

export type EditorBlock = TextBlock | LineBreakBlock | MentionBlock;
