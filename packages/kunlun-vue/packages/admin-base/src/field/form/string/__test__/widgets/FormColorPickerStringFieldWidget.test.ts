import { RuntimeStringField } from '@kunlun/engine';
import { DEFAULT_PREDEFINE } from '@kunlun/vue-ui-common';
import { FormStringColorPickerFieldWidget } from '../../color/FormStringColorPickerFieldWidget';

describe('FormStringColorPickerFieldWidget', () => {
  let widget: FormStringColorPickerFieldWidget;

  beforeEach(() => {
    widget = new FormStringColorPickerFieldWidget();
    widget.initialize({
      field: {} as RuntimeStringField
    });
  });

  describe('predefine', () => {
    it('should return default predefine when predefine is not set', () => {
      expect(widget.predefine).toEqual(DEFAULT_PREDEFINE);
    });

    it('should return default predefine when predefine is invalid JSON', () => {
      widget.getDsl = () => ({ predefine: 'invalid json' });
      expect(widget.predefine).toEqual(DEFAULT_PREDEFINE);
    });

    it('should return empty predefine when predefine is not an array', () => {
      widget.getDsl = () => ({ predefine: '{"not": "an array"}' });
      expect(widget.predefine).toEqual([]);
    });

    it('should filter out non-string items in predefine array', () => {
      widget.getDsl = () => ({ predefine: '["#fff", 123, "#000", true]' });
      expect(widget.predefine).toEqual(['#fff', '#000']);
    });

    it('should return predefine array with valid strings', () => {
      widget.getDsl = () => ({ predefine: '["#fff", "#000", "#ccc"]' });
      expect(widget.predefine).toEqual(['#fff', '#000', '#ccc']);
    });

    it('should handle empty predefine array', () => {
      widget.getDsl = () => ({ predefine: '[]' });
      expect(widget.predefine).toEqual([]);
    });
  });
});
