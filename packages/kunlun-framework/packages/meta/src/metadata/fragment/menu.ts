import gql from 'graphql-tag';
import { ServerAction, ViewAction, UrlAction } from './action';

const Menu = gql`
  fragment Menu on Menu {
    serverAction {
      ...ServerAction
    }
    viewAction {
      ...ViewAction
    }
    urlAction {
      ...UrlAction
    }
    id
    icon
    name
    displayName
    priority
    actionType
    mapping
    context
    parentName
    moduleDefinition {
      name
      displayName
      id
    }
  }
  ${ServerAction}
  ${ViewAction}
  ${UrlAction}
`;

export { Menu };
