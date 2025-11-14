export enum ModalWidth {
  small = 560,
  medium = 890,
  large = 1200,
  full = '100%'
}

export type ModalWidthType = number | string | keyof typeof ModalWidth;

export enum ModalHeight {
  small = '40vh',
  medium = '60vh',
  large = '90vh',
  full = '100%'
}

export type ModalHeightType = number | string | keyof typeof ModalHeight;
