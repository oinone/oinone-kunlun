export class PrintUnitConverter {
  private static readonly BASIC_DPI = 96;

  private static readonly MM_PX_RATIO = 25.4;

  private constructor() {
    // reject create object
  }

  public static mm2px(mm: number): number {
    const DPI = PrintUnitConverter.getDPI();
    return (mm * DPI) / PrintUnitConverter.MM_PX_RATIO;
  }

  public static getDPI(): number {
    return PrintUnitConverter.BASIC_DPI;
  }
}
