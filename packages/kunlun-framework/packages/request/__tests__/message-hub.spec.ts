/**
 * @jest-environment jsdom
 */
import { MessageHub } from '../src/message/useMessageHub/message-hub';
import { MessageHubManager } from '../src/message/useMessageHub/manager';
import type { IMessage } from '../src/types';
import { ILevel } from '../src/types';

describe('MessageHub 与 MessageHubManager', () => {
  afterEach(() => {
    MessageHubManager.clearAll();
  });

  it('MessageHub 可以按 level 过滤订阅', () => {
    MessageHubManager.setMessageHubConstructor(MessageHub as any);
    const hub = MessageHubManager.register('test');

    const received: IMessage[] = [];
    const sub = hub.subscribe((msg) => received.push(msg), ILevel.SUCCESS);

    hub.publish({ level: ILevel.SUCCESS, message: 'ok' } as any);
    hub.publish({ level: ILevel.ERROR, message: 'failed' } as any);

    expect(received).toHaveLength(1);
    expect(received[0].message).toBe('ok');

    sub.unsubscribe();
  });

  it('MessageHubManager.publish 向所有 hub 广播消息', () => {
    MessageHubManager.setMessageHubConstructor(MessageHub as any);
    const hub1 = MessageHubManager.register('h1');
    const hub2 = MessageHubManager.register('h2');

    const messages1: IMessage[] = [];
    const messages2: IMessage[] = [];
    hub1.subscribe((m) => messages1.push(m));
    hub2.subscribe((m) => messages2.push(m));

    MessageHubManager.publish({ level: 'INFO', message: 'broadcast' } as any);

    expect(messages1[0].message).toBe('broadcast');
    expect(messages2[0].message).toBe('broadcast');
  });

  it('clearAll 会调用每个 hub 的 unsubscribe', () => {
    const unsubFn = jest.fn();
    const fakeHub = { publish: jest.fn(), unsubscribe: unsubFn } as any;
    const manager = MessageHubManager as any;
    manager.messageHubs.set('x', fakeHub);

    MessageHubManager.clearAll();
    expect(unsubFn).toHaveBeenCalled();
  });
});
