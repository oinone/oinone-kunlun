import { HttpClient, gql } from '@oinone/kunlun-request';
import { MetadataFragment } from '@oinone/kunlun-meta';

const http = HttpClient.getInstance();

const getIFrameMenus = async () => {
  const mutate = gql`
    mutation {
      paaSExternalMenuMutation {
        menus {
          allMenus {
            ...Menu
          }
        }
      }
    }

    ${MetadataFragment.ViewAction}
    ${MetadataFragment.Menu}
  `;

  const result = await http.mutate('paas', mutate);
  return result.data['paaSExternalMenuMutation']['menus'] as any;
};

export { getIFrameMenus };
