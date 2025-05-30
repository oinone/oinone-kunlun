import { NetworkMiddlewareHandler } from '@kunlun/request';
import { getSharedSession } from '../session';

export const SharedMiddleware: NetworkMiddlewareHandler = (operation, forward) => {
  operation.setContext(({ headers = {} }: { headers: Record<string, unknown> }) => {
    const module = getSharedSession()?.page?.module;
    if (module) {
      return {
        headers: {
          ...headers,
          module
        }
      };
    }
    return { headers };
  });
  return forward(operation).subscribe({});
};
