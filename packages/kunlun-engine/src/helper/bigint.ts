/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import BigNumber from 'bignumber.js';

type BIGINT = number | string;

class BigIntClass {
  private result = null as any;

  add(a: BIGINT, b?: BIGINT): BigIntClass {
    if (b != null) {
      this.result = new BigNumber(a).plus(new BigNumber(b));
    } else if (this.result) {
      this.result = new BigNumber(this.result).plus(new BigNumber(a));
    } else {
      this.result = new BigNumber(0).plus(new BigNumber(this.result));
    }
    return this;
  }

  subtract(a: BIGINT, b?: BIGINT): BigIntClass {
    if (b != null) {
      this.result = new BigNumber(a).minus(new BigNumber(b));
    } else if (this.result) {
      this.result = new BigNumber(this.result).minus(new BigNumber(a));
    } else {
      this.result = new BigNumber(0).minus(new BigNumber(this.result));
    }
    return this;
  }

  multiply(a: BIGINT, b?: BIGINT): BigIntClass {
    if (b != null) {
      this.result = new BigNumber(a).multipliedBy(new BigNumber(b));
    } else if (this.result) {
      this.result = new BigNumber(this.result).multipliedBy(new BigNumber(a));
    } else {
      this.result = new BigNumber(1).multipliedBy(new BigNumber(this.result));
    }
    return this;
  }

  divide(a: BIGINT, b?: BIGINT): BigIntClass {
    if (b != null) {
      this.result = new BigNumber(a).dividedBy(new BigNumber(b));
    } else if (this.result) {
      this.result = new BigNumber(this.result).dividedBy(new BigNumber(a));
    } else {
      this.result = new BigNumber(1).dividedBy(new BigNumber(this.result));
    }
    return this;
  }

  equal(a: BIGINT, b?: BIGINT): boolean {
    if (b != null) {
      return new BigNumber(a).isEqualTo(new BigNumber(b));
    }
    if (this.result) {
      return new BigNumber(this.result).isEqualTo(new BigNumber(a));
    }
    return false;
  }

  notEqual(a: BIGINT, b?: BIGINT): boolean {
    if (b != null) {
      return !new BigNumber(a).isEqualTo(new BigNumber(b));
    }
    if (this.result) {
      return !new BigNumber(this.result).isEqualTo(new BigNumber(a));
    }
    return false;
  }

  lessThan(a: BIGINT, b?: BIGINT): boolean {
    if (b != null) {
      return new BigNumber(a).isLessThan(new BigNumber(b));
    }
    if (this.result) {
      return new BigNumber(this.result).isLessThan(new BigNumber(a));
    }
    return false;
  }

  lessThanOrEqual(a: BIGINT, b?: BIGINT): boolean {
    if (b != null) {
      return new BigNumber(a).isLessThanOrEqualTo(new BigNumber(b));
    }
    if (this.result) {
      return new BigNumber(this.result).isLessThanOrEqualTo(new BigNumber(a));
    }
    return false;
  }

  greaterThan(a: BIGINT, b?: BIGINT): boolean {
    if (b != null) {
      return new BigNumber(a).isGreaterThan(new BigNumber(b));
    }
    if (this.result) {
      return new BigNumber(this.result).isGreaterThan(new BigNumber(a));
    }
    return false;
  }

  greaterThanOrEqual(a: BIGINT, b?: BIGINT): boolean {
    if (b != null) {
      return new BigNumber(a).isGreaterThanOrEqualTo(new BigNumber(b));
    }
    if (this.result) {
      return new BigNumber(this.result).isGreaterThanOrEqualTo(new BigNumber(a));
    }
    return false;
  }

  exponentiate(a: BIGINT, b?: BIGINT): BigIntClass {
    if (b != null) {
      this.result = new BigNumber(a).exponentiatedBy(new BigNumber(b));
    } else if (this.result) {
      this.result = new BigNumber(this.result).exponentiatedBy(new BigNumber(a));
    } else {
      this.result = new BigNumber(1).exponentiatedBy(new BigNumber(this.result));
    }
    return this;
  }

  toString(): string {
    return new BigNumber(this.result).toString();
  }

  toNumber(): number {
    return new BigNumber(this.result).toNumber();
  }
}

export { BigIntClass, BigNumber };
