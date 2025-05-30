import gql from 'graphql-tag';

import { View } from './page';
import { Func } from './func';

const Action = gql`
  fragment Action on Action {
    id
    name
    displayName
    label
    description
    actionType
    contextType
    bindingType
    sessionPath
    model
    modelName
    invisible
    priority
    attributes
  }
`;

const ViewAction = gql`
  fragment ViewAction on ViewAction {
    id
    name
    title
    displayName
    actionType
    target
    domain
    viewType
    dataType
    contextType
    bindingType
    bindingViewName
    sessionPath
    model
    resModel
    invisible
    moduleName
    resModule
    resModuleName
    context
    priority
    attributes
  }
`;

const UrlAction = gql`
  fragment UrlAction on UrlAction {
    id
    name
    displayName
    url
    target
    description
    actionType
    contextType
    bindingType
    sessionPath
    model
    modelName
    invisible
    compute
    context
    priority
  }
`;

const ServerAction = gql`
  fragment ServerAction on ServerAction {
    id
    name
    displayName
    label
    description
    actionType
    contextType
    bindingType
    sessionPath
    model
    modelName
    invisible
    priority
    fun
    functionDefinition {
      method
      name
      type
      argumentList {
        name
      }
    }
  }
`;

const ClientAction = gql`
  fragment ClientAction on ClientAction {
    id
    name
    displayName
    label
    description
    actionType
    contextType
    bindingType
    sessionPath
    model
    modelName
    invisible
    priority
    fun
  }
`;

export { ViewAction, UrlAction, ServerAction, ClientAction, Action };
