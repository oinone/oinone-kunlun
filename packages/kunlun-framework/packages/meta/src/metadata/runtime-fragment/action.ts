import gql from 'graphql-tag';
import { Function, FunctionFragmentName } from './function';
import { Model, ModelFragmentName } from './model';
import { Module, ModuleFragmentName } from './module';
import { Mask, MaskFragmentName, View, ViewFragmentName } from './view';

export const ViewActionFragmentName = '...ViewActionV3';
export const SharedViewActionFragmentName = '...SharedPageViewActionV3';
export const ServerActionFragmentName = '...ServerActionV3';
export const UrlActionFragmentName = '...UrlActionV3';

export const ViewAction = gql`
  fragment ViewActionV3 on ViewAction {
    id
    name
    title
    displayName
    contextType
    viewType
    target
    theme
    domain
    filter
    load
    mapping
    context
    sessionPath
    model
    modelName
    modelDefinition {
      ${ModelFragmentName}
    }
    module
    moduleName
    moduleDefinition {
      ${ModuleFragmentName}
    }
    resModel
    resModelDefinition {
      ${ModelFragmentName}
    }
    resModule
    resModuleName
    resModuleDefinition {
      ${ModuleFragmentName}
    }
    mask
    maskDefinition {
      ${MaskFragmentName}
    }
    resViewName
    resView {
      ${ViewFragmentName}
    }
  }
  ${Model}
  ${Module}
  ${Mask}
  ${View}
`;

export const SharedViewAction = gql`
  fragment SharedPageViewActionV3 on SharedPageViewAction {
    id
    name
    title
    displayName
    contextType
    viewType
    target
    theme
    domain
    filter
    load
    sessionPath
    sharedCode
    authorizationCode
    sharedParameters
    browserTitle
    language
    languageIsoCode
    model
    modelName
    modelDefinition {
      ${ModelFragmentName}
    }
    module
    moduleName
    moduleDefinition {
      ${ModuleFragmentName}
    }
    resModel
    resModelDefinition {
      ${ModelFragmentName}
    }
    resModule
    resModuleName
    resModuleDefinition {
      ${ModuleFragmentName}
    }
    mask
    maskDefinition {
      ${MaskFragmentName}
    }
    resViewName
    resView {
      ${ViewFragmentName}
    }
  }
  ${Model}
  ${Module}
  ${Mask}
  ${View}
`;

export const ServerAction = gql`
  fragment ServerActionV3 on ServerAction {
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
      ${FunctionFragmentName}
    }
  }

  ${Function}
`;

export const UrlAction = gql`
  fragment UrlActionV3 on UrlAction {
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
