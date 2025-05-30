import gql from 'graphql-tag';

export const ModuleFragmentName = '...ModuleV3';

export const Module = gql`
  fragment ModuleV3 on ModuleDefinition {
    module
    name
    displayName
  }
`;
