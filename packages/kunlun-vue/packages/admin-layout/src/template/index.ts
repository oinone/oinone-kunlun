import { type DslDefinition, XMLParse } from '@oinone/kunlun-dsl';
import { MultiTabsRuntimeManifestMergedConfigManager } from '@oinone/kunlun-engine';
import { debugConsole } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { type MaskEditorContext, MaskEditorToken } from '../spi';
import { DefaultMask, InlineMultiTabsMaskXML } from './default-mask';

export function getDefaultMaskTemplate(): DslDefinition {
  let maskTemplate = DefaultMask;

  if (MultiTabsRuntimeManifestMergedConfigManager.isInline()) {
    maskTemplate = InlineMultiTabsMaskXML;
  }
  debugConsole.log('Use the default mask', maskTemplate);
  return maskTemplateEdit({ isDefault: true }, XMLParse.INSTANCE.parse(maskTemplate));
}

export function maskTemplateEdit(context: MaskEditorContext, dsl: DslDefinition): DslDefinition {
  const editors = SPI.RawInstantiates(MaskEditorToken);
  for (const editor of editors) {
    dsl = editor.edit(context, dsl);
  }
  return dsl;
}

export { InlineMultiTabsMaskXML, DefaultMask };
