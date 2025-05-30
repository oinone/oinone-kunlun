import gql from 'graphql-tag';

const Func = gql`
  fragment Func on Function {
    type
    namespace
    fun
    name
    argumentList {
      name
      ttype
      model
    }
    returnType {
      ttype
      model
    }
  }
`;

export { Func };
