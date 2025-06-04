import { SPI } from '@oinone/kunlun-spi';
import { UserLang } from '../../typing';
import { LanguageService, LanguageServiceToken } from '../LanguageService';
import { UserService, UserServiceToken } from '../UserService';

@SPI.Service(LanguageServiceToken)
export class LanguageServiceImpl implements LanguageService {
  @SPI.Autowired(UserServiceToken, { required: false })
  private userService: UserService | undefined;

  public async get(): Promise<UserLang | undefined> {
    const userInfo = await this.userService?.getUserInfo();
    if (!userInfo) {
      return undefined;
    }
    return userInfo.pamirsUser?.lang;
  }
}
