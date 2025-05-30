import { MessageHubManager } from './manager';
import { MessageHub } from './message-hub';

MessageHubManager.setMessageHubConstructor(MessageHub);

/**
 * @param identifier
 */
export function useMessageHub(identifier: string) {
  return MessageHubManager.register(identifier);
}

export function clearMessageHubByKey(identifier: string) {
  const res = MessageHubManager.get(identifier);

  if (!res) {
    throw new Error(`not find "${identifier}", please make sure you have registered`);
  }

  res.unsubscribe();
}

export function clearMessageHub() {
  MessageHubManager.clearAll();
}

export * from './manager';
