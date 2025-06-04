import { UserInfo, UserService, UserServiceToken } from '@oinone/kunlun-engine';
import { SPI } from '@oinone/kunlun-spi';
import { TopBarService } from './top-bar-service';

@SPI.Service(UserServiceToken)
export class UserServiceImpl implements UserService {
  public async getUserInfo(): Promise<UserInfo | undefined> {
    return TopBarService.getUserInfo();
  }
}
