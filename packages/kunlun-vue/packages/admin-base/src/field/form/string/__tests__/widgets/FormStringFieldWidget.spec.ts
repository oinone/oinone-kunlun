import { FormStringFieldWidget } from '../../FormStringFieldWidget';
import { ValidatorStatus } from '../../../../../typing';

const template = {
  pattern: '^[a-zA-Z0-9]+$',
  patternType: 'regexp',
  showCount: true,
  type: 'text'
};
const DEFAULT_FIELD = {
  data: '测试',
  name: 'ceshi',
  ttype: 'STRING',
  store: true,
  max: 10,
  min: 5
};

jest.spyOn(console, 'error');

describe('FormStringFieldWidget', () => {
  let instance = new FormStringFieldWidget();
  instance.initialize({
    field: DEFAULT_FIELD as any,
    template
  });

  jest.spyOn(console, 'error');

  describe('validateLength', () => {
    it('should return success when value is null', () => {
      const result = instance.validateLength(undefined);
      expect(result.status).toBe(ValidatorStatus.Success);
    });

    it('should return error when value length exceeds maxLength', () => {
      const result = instance.validateLength('12345678901'); // 长度为11，超过maxLength=
      expect(result.status).toBe(ValidatorStatus.Error);

      expect(result.message).toContain('最大长度为10');
    });

    it('should return error when value length is less than minLength', () => {
      const result = instance.validateLength('1234'); // 长度为4，小于minLength=5
      expect(result.status).toBe(ValidatorStatus.Error);
      expect(result.message).toContain('最小长度为5');
    });

    it('should return success when value length is within minLength and maxLength', () => {
      const result = instance.validateLength('123456789'); // 长度为9，在5到10之间
      expect(result.status).toBe(ValidatorStatus.Success);
    });
  });
});
