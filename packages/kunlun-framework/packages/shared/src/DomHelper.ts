export class DomHelper {
  public static getClientRect(dom: HTMLElement): DOMRect {
    return dom?.getClientRects?.()?.[0];
  }

  public static clientRectEquals(a: DOMRect, b: DOMRect) {
    return (
      a.top === b.top &&
      a.right === b.right &&
      a.bottom === b.bottom &&
      a.left === b.left &&
      a.height === b.height &&
      a.width === b.width &&
      a.x === b.x &&
      a.y === b.y
    );
  }
}
