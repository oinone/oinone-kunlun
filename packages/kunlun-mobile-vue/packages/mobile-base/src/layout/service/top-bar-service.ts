import { ClearCache, UserInfo, UserLang } from '@kunlun/engine';
import { MetadataFragment, SYSTEM_MODULE_NAME } from '@kunlun/meta';
import { gql } from '@kunlun/request';
import { http } from '@kunlun/service';
import { RuntimeLanguage } from '@kunlun/vue-ui-common';

export class TopBarService {
  protected static userInfoCache: Promise<UserInfo> | null | undefined;

  static {
    ClearCache.register(() => {
      TopBarService.userInfoCache = null;
    });
  }

  public static getUserInfo(): Promise<UserInfo> {
    if (TopBarService.userInfoCache) {
      return TopBarService.userInfoCache;
    }
    TopBarService.userInfoCache = TopBarService.queryUserInfo();
    return TopBarService.userInfoCache;
  }

  public static async getCurrentLang(): Promise<UserLang | undefined> {
    try {
      const currentUser = await TopBarService.getUserInfo();
      return currentUser.pamirsUser && currentUser.pamirsUser.lang ? currentUser.pamirsUser.lang : undefined;
    } catch (error) {
      return undefined;
    }
  }

  public static async queryUserInfo(): Promise<UserInfo> {
    const body = gql`
      {
        topBarUserBlockQuery {
          construct(data: {}) {
            userAvatarAction {
              ...Action
            }
            actionGroups {
              actions {
                ...Action
              }
            }
            pamirsUser {
              name
              nickname
              realname
              id
              userType
              birthday
              gender
              phone
              idCard
              contactPhone
              contactEmail
              avatarBig {
                name
                id
                url
              }
              avatarUrl
              lang {
                code
                active
                installState
                name
                id
              }
              email
            }
          }
        }
      }

      ${MetadataFragment.Action}
    `;
    try {
      const res = await http.mutate<UserInfo>(SYSTEM_MODULE_NAME.USER, body);
      return res.data.topBarUserBlockQuery.construct;
    } catch (e) {
      console.error('error query user info.', e);
      return {} as UserInfo;
    }
  }

  public static async queryLanguageList(): Promise<RuntimeLanguage[]> {
    const body = gql`
      {
        resourceLangQuery {
          queryListByEntity(query: { active: ACTIVE, installState: true }) {
            id
            name
            active
            installState
            code
            isoCode
          }
        }
      }
    `;
    try {
      const res = await http.mutate<RuntimeLanguage[]>(SYSTEM_MODULE_NAME.RESOURCE, body);
      return res.data.resourceLangQuery.queryListByEntity;
    } catch (e) {
      console.error('error query language list.', e);
      return [];
    }
  }

  public static async activeLang(id: string) {
    const body = gql`
    mutation {
        topBarLangTransientModelMutation {
          activeLang(topBarLangTransientModel: { id: ${id} }) {
            id
            langList {
              groupingRule
              name
              timezoneType
              thousandsSep
              installState
              id
              decimalPoint
              timeFormat
              calendarType
              writeDate
              isoCode
              weekStart
              dateFormat
              active
              code
              iconId
              direction
            }
          }
        }
    }
    `;
    const res = await http.mutate(SYSTEM_MODULE_NAME.USER, body);
    return res.data.topBarLangTransientModelMutation.activeLang;
  }
}
