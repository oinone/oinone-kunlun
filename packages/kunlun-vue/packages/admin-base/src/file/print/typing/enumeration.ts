import { PrintUnitConverter } from '../utils';

export enum PdfPageSize {
  /**
   * 841, 1189
   */
  A0 = 'A0',
  /**
   * 594, 841
   */
  A1 = 'A1',
  /**
   * 420, 594
   */
  A2 = 'A2',
  /**
   * 297, 420
   */
  A3 = 'A3',
  /**
   * 210, 297
   */
  A4 = 'A4',
  /**
   * 148, 210
   */
  A5 = 'A5',
  /**
   * 353, 500
   */
  B3 = 'B3',
  /**
   * 176, 250
   */
  B5 = 'B5',
  CUSTOM = 'CUSTOM'
}

export const PdfPageSizeMap: Record<PdfPageSize, { width: number; height: number }> = {
  [PdfPageSize.A0]: {
    width: 841,
    height: 1189
  },
  [PdfPageSize.A1]: {
    width: 594,
    height: 841
  },
  [PdfPageSize.A2]: {
    width: 420,
    height: 594
  },
  [PdfPageSize.A3]: {
    width: 297,
    height: 420
  },
  [PdfPageSize.A4]: {
    width: 210,
    height: 297
  },
  [PdfPageSize.A5]: {
    width: 148,
    height: 210
  },
  [PdfPageSize.B3]: {
    width: 353,
    height: 500
  },
  [PdfPageSize.B5]: {
    width: 176,
    height: 250
  },
  [PdfPageSize.CUSTOM]: { width: 0, height: 0 }
};

export enum PdfPageDirection {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}

export enum PdfHorizontalAlignment {
  GENERAL = 'GENERAL',
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  JUSTIFIED = 'JUSTIFIED'
}

export enum PdfVerticalAlignment {
  TOP = 'TOP',
  MIDDLE = 'MIDDLE',
  BOTTOM = 'BOTTOM',
  JUSTIFIED = 'JUSTIFIED'
}
