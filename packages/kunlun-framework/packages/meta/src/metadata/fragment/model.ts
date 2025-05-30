import gql from 'graphql-tag';
import { ClientAction, ServerAction, UrlAction, ViewAction } from './action';

import { Field } from './field';
import { Func } from './func';
import { View } from './page';

export const Model = gql`
  fragment Model on Model {
    id
    pk
    model
    name
    displayName
    labelFields
    label
    moduleName
    module
    type
    attributes
    ordering
    indexes
    uniques
    modelFields {
      ...Field
    }
    viewActionList {
      ...ViewAction
    }
    serverActionList {
      ...ServerAction
    }
    urlActionList {
      ...UrlAction
    }
    viewList {
      ...View
    }
    clientActionList {
      ...ClientAction
    }
    functions {
      ...Func
    }
  }
  ${Field}
  ${ViewAction}
  ${ServerAction}
  ${UrlAction}
  ${ClientAction}
  ${View}
  ${Func}
`;

export const ModelWithFields = gql`
  fragment ModelWithFields on Model {
    id
    pk
    model
    name
    displayName
    labelFields
    label
    moduleName
    module
    type
    attributes
    ordering
    indexes
    uniques
    modelFields {
      ...Field
    }
  }
  ${Field}
`;
