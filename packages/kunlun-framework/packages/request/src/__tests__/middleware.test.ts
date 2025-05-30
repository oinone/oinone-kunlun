/**
 * @jest-environment jsdom
 */
import { ActionRedirectInterceptor } from '../middleware/internal-interceptor/action-redirect';
import { LoginRedirectInterceptor } from '../middleware/internal-interceptor/login-redirect';
import { MessageHubInterceptor } from '../middleware/internal-interceptor/message-hub';
import { NetworkErrorInterceptor } from '../middleware/internal-interceptor/network-error';
import { RequestErrorInterceptor } from '../middleware/internal-interceptor/request-error';
import { NetworkInterceptorManager } from '../middleware/manager';
import { MessageHub } from '../message';

// Mock window.location
const mockWindowLocation = (url: string) => {
  const parser = document.createElement('a');
  parser.href = url;
  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = parser;
};

describe('ActionRedirectInterceptor', () => {
  let interceptor: ActionRedirectInterceptor;
  let spy;

  beforeEach(() => {
    interceptor = new ActionRedirectInterceptor();
    spy = jest.spyOn(interceptor, 'redirectToPage');
  });

  test('should redirect when valid action received', () => {
    const response = {
      extensions: {
        extra: {
          action: {
            moduleName: 'test',
            viewType: 'detail',
            model: 'TestModel',
            name: 'view',
            target: '_blank'
          }
        }
      }
    };

    const result = interceptor.success(response as any);
    expect(result).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  test('should not redirect with incomplete action data', () => {
    const response = {
      extensions: {
        extra: {
          action: { moduleName: 'test' }
        }
      }
    };

    const result = interceptor.success(response as any);
    expect(result).toBe(true);
  });

  test('should not redirect when no action present', () => {
    const response = {
      extensions: {
        extra: {} // No action data
      }
    };

    const result = interceptor.success(response as any);
    expect(result).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('LoginRedirectInterceptor', () => {
  let interceptor: LoginRedirectInterceptor;

  beforeEach(() => {
    interceptor = new LoginRedirectInterceptor();
    mockWindowLocation('http://localhost/home');
  });

  test('should redirect on login error', () => {
    const response = {
      errors: [
        {
          extensions: { errorCode: '11500001' }
        }
      ]
    };

    const result = interceptor.error(response as any);
    expect(result).toBe(false);
    expect(window.location.href).toContain('/login');
  });

  test('should not redirect when already on login page', () => {
    mockWindowLocation('http://localhost/login');
    const response = {
      errors: [
        {
          extensions: { errorCode: '11500001' }
        }
      ]
    };

    const result = interceptor.error(response as any);
    expect(result).toBe(true);
  });

  test('should not redirect for non-login error codes', () => {
    const response = {
      errors: [
        {
          extensions: { errorCode: 'OTHER_ERROR' }
        }
      ]
    };

    const result = interceptor.error(response as any);
    expect(result).toBe(true);
    expect(window.location.href).not.toContain('/login');
  });
});

describe('MessageHubInterceptor', () => {
  let interceptor: MessageHubInterceptor;

  beforeEach(() => {
    interceptor = new MessageHubInterceptor();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  test('should handle success messages', () => {
    const response = {
      extensions: {
        messages: [
          {
            level: 'SUCCESS',
            message: 'Operation succeeded'
          }
        ]
      }
    };

    const result = interceptor.success(response as any);
    expect(result).toBe(true);
  });

  test('should handle error messages', () => {
    const response = {
      errors: [
        {
          message: 'Error message',
          extensions: {
            messages: [
              {
                level: 'ERROR',
                message: 'Detailed error'
              }
            ]
          }
        }
      ]
    };

    const result = interceptor.error(response as any);
    expect(result).toBe(true);
  });

  test('should handle empty messages', () => {
    const response = {
      extensions: {} // No messages
    };

    const result = interceptor.success(response as any);
    expect(result).toBe(true);
  });
});

describe('NetworkErrorInterceptor', () => {
  let interceptor: NetworkErrorInterceptor;

  beforeEach(() => {
    interceptor = new NetworkErrorInterceptor();
  });

  test('should handle JSON parse errors', () => {
    const response = {
      networkError: {
        name: 'SyntaxError',
        message: 'Unexpected token'
      }
    };

    const result = interceptor.error(response as any);
    expect(result).toBe(false);
  });

  test('should ignore non-JSON errors', () => {
    const response = {
      networkError: {
        name: 'TypeError',
        message: 'Network request failed'
      }
    };
    const spy = jest.spyOn(console, 'error');
    interceptor.error(response as any);
    expect(spy).not.toBeCalled();
  });
});

describe('RequestErrorInterceptor', () => {
  const interceptor = new RequestErrorInterceptor();

  test('should filter repeat errors', () => {
    const response = {
      errors: [
        {
          extensions: { errorCode: 123456, message: [{ message: 'test' }] }
        },
        {
          extensions: { errorCode: 123456, message: [{ message: 'test' }] }
        }
      ]
    };
    const spy = jest.spyOn(MessageHub, 'error');
    interceptor.error(response as any);
    expect(spy).toBeCalledTimes(1);
  });
});

describe('NetworkInterceptorManager', () => {
  test('should register and retrieve interceptors', () => {
    NetworkInterceptorManager.register('actionRedirect', ActionRedirectInterceptor);
    const interceptors = NetworkInterceptorManager.getInterceptors();
    expect(interceptors.actionRedirect).toBeInstanceOf(ActionRedirectInterceptor);
  });

  test('should handle null interceptor', () => {
    NetworkInterceptorManager.register('translate', null);
    const interceptors = NetworkInterceptorManager.getInterceptors();
    expect(interceptors.translate).toBeUndefined();
  });

  test('should handle duplicate registration', () => {
    const original = NetworkInterceptorManager.getInterceptors().actionRedirect;
    NetworkInterceptorManager.register('actionRedirect', ActionRedirectInterceptor);
    const newInstance = NetworkInterceptorManager.getInterceptors().actionRedirect;
    expect(newInstance).not.toBe(original);
  });
});
