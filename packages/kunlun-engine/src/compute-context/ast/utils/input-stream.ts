export class InputStream {
  private readonly _source: string;

  private readonly length: number;

  private readonly eofPos: number;

  private _pos = 0;

  public constructor(source: string) {
    this._source = source;
    this.length = source.length;
    this.eofPos = source.length;
  }

  public get source() {
    return this._source;
  }

  public get pos() {
    return this._pos;
  }

  public set pos(pos: number) {
    const target = this._pos + pos;
    this._pos = target > this.eofPos ? this.eofPos : target;
  }

  public next(): number {
    return this._source.charCodeAt(this._pos++);
  }

  public get() {
    return this._source.charCodeAt(this._pos - 1);
  }

  public peek(offset?: number): number {
    return this._source.charCodeAt(this._pos + (offset || 0));
  }

  public skip(pos: number): void {
    const target = this._pos + pos;
    this._pos = target >= this.eofPos ? this.eofPos : target;
  }

  public eof(): boolean {
    return this._pos >= this.eofPos || Number.isNaN(this.peek());
  }
}
