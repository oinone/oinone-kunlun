import { Boot } from '@wangeditor/editor';
import { wangEditorExpressionModule } from './expression';

export * from './expression';

type RegistrationState = { status: 'registering' } | { status: 'registered' } | { status: 'failed'; error: unknown };

// Independent source/published copies in the same realm share this protocol, keyed by the actual Boot.
const registrationKey = Symbol.for('@oinone/kunlun-vue-expression/wang-editor-module/registration/v1');
const registrationHost = globalThis as typeof globalThis & {
  [registrationKey]?: WeakMap<object, RegistrationState>;
};
const registrations =
  registrationHost[registrationKey] || (registrationHost[registrationKey] = new WeakMap<object, RegistrationState>());
const registration = registrations.get(Boot);

switch (registration?.status) {
  case undefined:
    registrations.set(Boot, { status: 'registering' });
    try {
      Boot.registerModule(wangEditorExpressionModule);
      registrations.set(Boot, { status: 'registered' });
    } catch (error: unknown) {
      // WangEditor can fail after partial registration. Retrying would hide the original error behind a menu conflict.
      registrations.set(Boot, { status: 'failed', error });
      throw error;
    }
    break;
  case 'registering':
  case 'registered':
    break;
  case 'failed':
    throw registration.error;
}
