export const LOGIC_FUNCTION = {
  IF,
  AND,
  OR,
  NOT
};

function IF(A: boolean | undefined, B: unknown, C: unknown) {
  return !!A ? B : C;
}

function AND(A: boolean, B: boolean) {
  if (A == null || B == null) {
    return false;
  }
  return A && B;
}

function OR(A: boolean, B: boolean) {
  if (A == null) {
    A = false;
  }
  if (B == null) {
    B = false;
  }
  return A || B;
}

function NOT(A: boolean) {
  return !A;
}
