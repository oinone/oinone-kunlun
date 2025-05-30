export enum ModalWidth {
  small = 560,
  medium = 890,
  large = 1200,
  custom = 'CUSTOM',
  full = '100%'
}

export type ModalWidthType = number | string | keyof typeof ModalWidth;

export enum ModalHeight {
  small = '30%',
  medium = '50%',
  large = '80%',
  custom = 'CUSTOM',
  full = '100%'
}

export type ModalHeightType = number | string | keyof typeof ModalHeight;
