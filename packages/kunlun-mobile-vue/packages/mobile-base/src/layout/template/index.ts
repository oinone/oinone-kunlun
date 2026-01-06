import { type DslDefinition, XMLParse } from '@oinone/kunlun-dsl';
import { MultiTabsRuntimeManifestMergedConfigManager } from '@oinone/kunlun-engine';
import { debugConsole } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { type MaskEditorContext, MaskEditorToken } from '../spi/mask-editor';
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
