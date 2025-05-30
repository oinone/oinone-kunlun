import gql from 'graphql-tag';

export const FunctionFragmentName = '...FuncV3';

const Function = gql`
  fragment FuncV3 on Function {
    type
    namespace
    fun
    name
    argumentList {
      name
      ttype
      multi
      model
    }
    returnType {
      ttype
      multi
      model
    }
  }
`;

export { Function };
