import { DslDefinition, DslSlotUtils, XMLParse } from '@kunlun/dsl';
import { isString } from 'lodash-es';
import { RuntimeView } from '../../runtime-metadata';
import { translateDslDefinition } from '../../util';
import { RuntimeContext } from '../runtime-context';
import { resolveModel } from './resolve-model';
import { resolveModule } from './resolve-module';
import { resolveRelated } from './resolve-related';
import { resolveTemplate } from './resolve-template';

export function resolveView(runtimeContext: RuntimeContext, view: RuntimeView) {
  const { name, layout, dsl, template } = view;
  runtimeContext.view = view;
  let finalTemplate: DslDefinition | undefined;
  if (layout) {
    runtimeContext.viewLayout = resolveDslDefinition(layout);
  }
  if (dsl) {
    runtimeContext.viewDsl = resolveDslDefinition(dsl);
  }
  if (template) {
    finalTemplate = resolveDslDefinition(template);
  }
  if (!finalTemplate) {
    const { viewLayout, viewDsl } = runtimeContext;
    if (viewLayout) {
      if (viewDsl) {
        finalTemplate = DslSlotUtils.mergeTemplateToLayout(viewLayout, viewDsl);
      } else {
        finalTemplate = viewLayout;
      }
    } else if (viewDsl) {
      finalTemplate = viewDsl;
    } else {
      throw new Error('Invalid view template.');
    }
  }
  if (!finalTemplate.name) {
    finalTemplate.name = name;
  }
  translateDslDefinition(finalTemplate);
  runtimeContext.viewTemplate = finalTemplate;
  resolveModule(runtimeContext);
  resolveModel(runtimeContext);
  resolveTemplate(runtimeContext, finalTemplate);
  resolveRelated(runtimeContext);
  // resolveCompute(runtimeContext);
}

export function resolveDslDefinition<T extends DslDefinition = DslDefinition>(dsl: string | T): T | undefined {
  if (isString(dsl)) {
    if (!dsl) {
      return undefined;
    }
    dsl = dsl.trim();
    if (dsl[0] === '{') {
      return JSON.parse(dsl);
    }
    if (dsl[0] === '<') {
      return XMLParse.INSTANCE.parse<T>(dsl);
    }
    console.error('dsl is not json/xml format.', dsl);
    return undefined;
  }
  return dsl;
}
