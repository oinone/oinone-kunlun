import { DslDefinition } from '@kunlun/dsl';
import { SPI } from '@kunlun/spi';
import { PartnerSwitcherConfigManager } from '../../../config';
import { MaskEditor, MaskEditorContext, MaskEditorToken, MaskEditService, MaskEditServiceToken } from '../../../spi';

@SPI.Service(MaskEditorToken, { priority: 10 })
export class PartnerSwitcherMaskEditor implements MaskEditor {
  @SPI.Autowired(MaskEditServiceToken)
  private maskEditService!: MaskEditService;

  public edit(context: Readonly<MaskEditorContext>, dsl: DslDefinition): DslDefinition {
    if (PartnerSwitcherConfigManager.isEnabled()) {
      this.maskEditService
        .findTopBarWidgets(dsl)
        ?.splice(
          0,
          0,
          this.maskEditService.generatorWidget('partner-switcher'),
          this.maskEditService.generatorDivider()
        );
    }
    return dsl;
  }
}
