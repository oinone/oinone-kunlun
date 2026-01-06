import { OioMessage, OioNotification, NotificationType } from '../index';

jest.mock('ant-design-vue', () => {
  const message = {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn()
  } as const;

  const notification = {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    confirm: jest.fn()
  } as const;

  return {
    __esModule: true,
    message,
    notification
  };
});

describe('OioNotification 工具', () => {
  it('OioMessage 使用不同类型时会调用对应 ant-design-vue 方法', () => {
    const { message } = jest.requireMock('ant-design-vue') as {
      message: Record<string, jest.Mock>;
    };

    OioMessage.info('info');
    OioMessage.success('success');
    OioMessage.warning('warning');
    OioMessage.error('error');

    expect(message.info).toHaveBeenCalled();
    expect(message.success).toHaveBeenCalled();
    expect(message.warning).toHaveBeenCalled();
    expect(message.error).toHaveBeenCalled();
  });

  it('OioNotification open 会透传类型到 ant-design-vue notification', () => {
    const { notification } = jest.requireMock('ant-design-vue') as {
      notification: Record<string, jest.Mock>;
    };

    OioNotification.open(NotificationType.success, 'title', 'msg');

    expect(notification.success).toHaveBeenCalled();
  });
});
