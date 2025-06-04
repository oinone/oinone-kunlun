import { DslDefinition } from '@oinone/kunlun-dsl';
import { SPI } from '@oinone/kunlun-spi';
import { MaskEditor, MaskEditorContext, MaskEditorToken } from './mask-editor';

// inversify至少要有1个实现类，否则会报错
@SPI.Service(MaskEditorToken, { priority: 1 })
export class EmptyMaskEditor implements MaskEditor {
  public edit(context: Readonly<MaskEditorContext>, dsl: DslDefinition): DslDefinition {
    return dsl;
  }
}
