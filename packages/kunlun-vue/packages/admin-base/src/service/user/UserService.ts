import { GQL } from '@oinone/kunlun-request';
import { SYSTEM_MODULE_NAME, UserBehaviorEventEnum, ViewActionTarget } from '@oinone/kunlun-meta';
import { encrypt } from '../../util';

export interface UserServiceResponse {
  broken: boolean;
  errorField?: string;
  errorCode?: string;
  errorMsg?: string;

  redirect?: {
    model: string;
    name: string;
    target: ViewActionTarget;
    viewType: string;
    moduleDefinition?: {
      name: string;
    };
    resModuleDefinition?: {
      name: string;
    };
  };
}

const SimpleRedirectViewActionFragmentName = 'SimpleRedirectViewAction';

const SimpleRedirectViewActionFragment = GQL.fragment(SimpleRedirectViewActionFragmentName, 'ViewAction')
  .parameter('model', 'name', 'target', 'viewType', ['moduleDefinition', ['name']], ['resModuleDefinition', ['name']])
  .toString();

export class UserService {
  public static sendSmsVerificationCodeByPhone(
    eventType: UserBehaviorEventEnum,
    phone: string,
    picCode?: string
  ): Promise<UserServiceResponse> {
    return GQL.mutation('pamirsUserTransient', 'sendSmsVerificationCode')
      .buildRequest((builder) =>
        builder.buildObjectParameter('user', (dataBuilder) => {
          dataBuilder.stringParameter('phone', phone);
          dataBuilder.stringParameter('picCode', picCode);
          dataBuilder.enumerationParameter('userBehaviorEvent', eventType);
        })
      )
      .buildResponse((builder) => {
        builder.parameter('broken', 'errorMsg', 'errorCode', 'errorField');
      })
      .request(SYSTEM_MODULE_NAME.USER);
  }

  public static fetchVerificationCodeByForget(phone: string, picCode?: string): Promise<UserServiceResponse> {
    return UserService.sendSmsVerificationCodeByPhone(
      UserBehaviorEventEnum.PHONE_MODIFY_PASSWORD_BY_PHONE_SEND_CODE,
      phone,
      picCode
    );
  }

  public static async resetPasswordByPhone(
    phone: string,
    verificationCode,
    password: string,
    confirmPassword,
    inviteCode
  ): Promise<UserServiceResponse> {
    return GQL.mutation('pamirsUserTransient', 'forgetPassword')
      .buildRequest((builder) =>
        builder.buildObjectParameter('user', (dataBuilder) => {
          dataBuilder.stringParameter('phone', phone);
          dataBuilder.stringParameter('inviteCode', inviteCode);
          dataBuilder.stringParameter('verificationCode', verificationCode);
          dataBuilder.stringParameter('password', encrypt(password));
          dataBuilder.stringParameter('confirmPassword', encrypt(confirmPassword));
        })
      )
      .buildResponse((builder) => {
        builder.parameter('broken', 'errorMsg', 'errorCode', 'errorField');
      })
      .request(SYSTEM_MODULE_NAME.USER);
  }

  public static async resetPasswordByFirst(password: string, confirmPassword): Promise<UserServiceResponse> {
    return GQL.mutation('pamirsUserTransient', 'firstResetPassword')
      .buildRequest((builder) =>
        builder.buildObjectParameter('user', (dataBuilder) => {
          dataBuilder.stringParameter('password', encrypt(password));
          dataBuilder.stringParameter('confirmPassword', encrypt(confirmPassword));
        })
      )
      .buildResponse((builder) => {
        builder
          .parameter('broken', 'errorMsg', 'errorCode', 'errorField')
          .fragmentParameter('redirect', SimpleRedirectViewActionFragmentName);
      })
      .mountFragment(SimpleRedirectViewActionFragmentName, SimpleRedirectViewActionFragment)
      .request(SYSTEM_MODULE_NAME.USER);
  }
}
