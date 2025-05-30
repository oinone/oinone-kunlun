import gql from 'graphql-tag';

export const ModelFragmentName = '...ModelV3';

export const Model = gql`
  fragment ModelV3 on ModelDefinition {
    id
    model
    name
    type
    module
    moduleName
    pk
    uniques
    indexes
    ordering
  }
`;
