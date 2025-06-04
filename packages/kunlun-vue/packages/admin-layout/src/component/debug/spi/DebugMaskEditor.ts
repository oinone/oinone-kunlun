import { DslDefinition } from '@oinone/kunlun-dsl';
import { SPI } from '@oinone/kunlun-spi';
import { DebugConfigManager } from '../../../config';
import { MaskEditor, MaskEditorContext, MaskEditorToken, MaskEditService, MaskEditServiceToken } from '../../../spi';

@SPI.Service(MaskEditorToken, { priority: 1000 })
export class DebugMaskEditor implements MaskEditor {
  @SPI.Autowired(MaskEditServiceToken)
  private maskEditService!: MaskEditService;

  public edit(context: Readonly<MaskEditorContext>, dsl: DslDefinition): DslDefinition {
    if (DebugConfigManager.isEnabled()) {
      this.maskEditService
        .findTopBarWidgets(dsl)
        ?.splice(0, 0, this.maskEditService.generatorWidget('debug'), this.maskEditService.generatorDivider());
    }
    return dsl;
  }
}
