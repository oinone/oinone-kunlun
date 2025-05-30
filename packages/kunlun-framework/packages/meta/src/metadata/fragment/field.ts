import gql from 'graphql-tag';

const Field = gql`
  fragment Field on Field {
    id
    name
    displayName
    ttype
    model
    multi
    references
    size
    limit
    related
    relatedTtype
    store
    storeSerialize
    relationStore
    required
    relationFields
    referenceFields
    throughRelationFields
    throughReferenceFields
    through
    invisible
    field
    domainSize
    index
    unique
    decimal
    systemSource
    format
    options {
      name
      displayName
      value
    }
    attributes
  }
`;

export { Field };
