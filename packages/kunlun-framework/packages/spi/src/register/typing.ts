import { ServiceIdentifier } from '../typing';

const hasSymbol = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

export type InjectionToken<T> = ServiceIdentifier<T>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const InjectionToken = <T>(desc: string): InjectionToken<T> => (hasSymbol ? Symbol(desc) : desc);
