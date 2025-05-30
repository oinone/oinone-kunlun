import { DslDefinition, XMLParse } from '@kunlun/dsl';
import { MultiTabsRuntimeManifestMergedConfigManager } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { debugConsole } from '@kunlun/shared';
import { MaskEditorContext, MaskEditorToken } from '../spi';
import { InlineMultiTabsMaskXML, MaskTemplate } from './mask-template';

export function getDefaultMaskTemplate(): DslDefinition {
  let maskTemplate = MaskTemplate;
  if (MultiTabsRuntimeManifestMergedConfigManager.isInline()) {
    maskTemplate = InlineMultiTabsMaskXML;
  }
  debugConsole.log('使用默认mask', maskTemplate);
  return maskTemplateEdit({ isDefault: true }, XMLParse.INSTANCE.parse(maskTemplate));
}

export function maskTemplateEdit(context: MaskEditorContext, dsl: DslDefinition): DslDefinition {
  const editors = SPI.RawInstantiates(MaskEditorToken);
  for (const editor of editors) {
    dsl = editor.edit(context, dsl);
  }
  return dsl;
}

export { InlineMultiTabsMaskXML, MaskTemplate };
