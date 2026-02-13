import { ChatBubblesCssVars } from './chat-bubbles';
import { ConversationCssVars } from './conversation';

export const component = 'ai-chat';

export const cssVars = {
  color: 'var(--oio-primary-color)',
  ...ChatBubblesCssVars,
  ...ConversationCssVars,
  config: {
    ...ConversationCssVars.config
  }
};
