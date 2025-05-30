import gql from 'graphql-tag';

export const MaskFragmentName = '...MaskV3';

export const Mask = gql`
  fragment MaskV3 on MaskDefinition {
    name
    template
  }
`;

export const LayoutFragmentName = '...LayoutV3';

export const Layout = gql`
  fragment LayoutV3 on LayoutDefinition {
    name
    template
  }
`;

export const ViewFragmentName = '...ViewV3';

export const View = gql`
  fragment ViewV3 on View {
    id
    model
    modelDefinition {
      model
      name
      module
      moduleName
    }
    name
    title
    type
    template
    extension
    baseLayoutName
    baseLayoutDefinition {
      ${LayoutFragmentName}
    }
  }
  ${Layout}
`;
