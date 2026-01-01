import { ServiceIdentifier } from '@oinone/kunlun-spi';
import type { UserLang } from '../typing';

export interface LanguageService {
  get(): Promise<UserLang | undefined>;
}

export const LanguageServiceToken = ServiceIdentifier<LanguageService>('LanguageService');
