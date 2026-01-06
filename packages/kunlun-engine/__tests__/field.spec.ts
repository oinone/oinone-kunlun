import { BooleanField } from '../src/field/boolean';
import { CurrencyField } from '../src/field/currency';
import { Field } from '../src/field/field';
import { isLocal1 } from '../src/field';

describe('Field module', () => {
  it('BooleanField should extend Field', () => {
    const field = new BooleanField();
    expect(field).toBeInstanceOf(Field);
  });

  it('CurrencyField should extend Field', () => {
    const field = new CurrencyField();
    expect(field).toBeInstanceOf(Field);
  });

  it('isLocal1 should be a symbol with description 1', () => {
    expect(typeof isLocal1).toBe('symbol');
    expect(isLocal1.description).toBe('1');
  });
});
