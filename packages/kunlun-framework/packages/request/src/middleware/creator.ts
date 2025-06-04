import { serialExecutor } from '@oinone/kunlun-shared';
import { ApolloLink, NextLink, Observable, Operation } from 'apollo-link';
import { IResponseErrorResult, IResponseResult, NetworkInterceptor, NetworkMiddlewareHandler } from '../types';

export function createMiddleware(handler: NetworkMiddlewareHandler): ApolloLink {
  return new ApolloLink((operation: Operation, forward: NextLink) => {
    return new Observable((observer) => {
      let innerSub: any;

      const sub = handler(operation, (_op) => {
        return new Observable((innerObserver) => {
          innerSub = forward(_op).subscribe({
            next: (result) => {
              if (result.errors && result.errors.length) {
                innerObserver.error({
                  graphQLErrors: result.errors,
                  response: result
                });
              } else {
                innerObserver.next(result);
              }

              observer.next(result);
            },
            error: (networkError) => {
              innerObserver.error({
                networkError,
                // Network errors can return GraphQL errors on for example a 403
                graphQLErrors: networkError && networkError.result && networkError.result.errors
              });
              observer.error(networkError);
            },
            complete: () => {
              innerObserver.complete();
              observer.complete();
            }
          });
        });
      });

      return () => {
        if (sub && sub.unsubscribe) {
          sub.unsubscribe();
        }
        if (innerSub) {
          innerSub.unsubscribe();
        }
      };
    });
  });
}

export function createDefaultMiddleware(interceptors: NetworkInterceptor[]) {
  const successInterceptors: NetworkInterceptor[] = [];
  const errorInterceptors: NetworkInterceptor[] = [];
  interceptors.forEach((interceptor) => {
    if (interceptor.success) {
      successInterceptors.push(interceptor);
    }
    if (interceptor.error) {
      errorInterceptors.push(interceptor);
    }
  });
  return createMiddleware((operation: Operation, forward: NextLink) => {
    return forward(operation).subscribe({
      next(res) {
        const response = res as IResponseResult;
        serialExecutor(successInterceptors, (interceptor) => interceptor.success?.(response));
      },
      error: ({ graphQLErrors, networkError, response }) => {
        const finalResponse: IResponseErrorResult = {
          errors: graphQLErrors,
          extensions: response?.extensions,
          networkError
        };
        serialExecutor(errorInterceptors, (interceptor) => interceptor.error?.(finalResponse));
      }
    });
  });
}
