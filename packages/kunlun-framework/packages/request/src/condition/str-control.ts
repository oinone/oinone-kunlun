class StrControl {
  private pivot = 0;

  private list: string[] = [];

  public append(str: string) {
    this.list.splice(this.pivot, 0, str);
    this.pivot++;
    return this;
  }

  public prepend(str: string) {
    this.list.unshift(str);
    this.pivot++;
    return this;
  }

  public postpend(str: string) {
    this.list.push(str);
    return this;
  }

  public toString(): string {
    return this.list.join('');
  }
}

export { StrControl };
