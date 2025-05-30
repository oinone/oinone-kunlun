import gql from 'graphql-tag';

const View = gql`
  fragment View on View {
    id
    name
    type
    model
    title
    template
    active
    priority
    systemSource
  }
`;

export { View };
