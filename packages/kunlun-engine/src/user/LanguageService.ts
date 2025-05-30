import { ServiceIdentifier } from '@kunlun/spi';
import { UserLang } from '../typing';

export interface LanguageService {
  get(): Promise<UserLang | undefined>;
}

export const LanguageServiceToken = ServiceIdentifier<LanguageService>('LanguageService');
