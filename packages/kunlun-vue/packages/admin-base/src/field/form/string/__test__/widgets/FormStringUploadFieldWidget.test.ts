import { RuntimeStringField } from '@kunlun/engine';
import { FormStringUploadFieldWidget } from '../../upload/FormStringUploadFieldWidget';
import { FormFieldWidget } from '../../../../../basic';

describe.skip('FormStringUploadFieldWidget', () => {
  let widget: FormStringUploadFieldWidget;
  let mockField: RuntimeStringField;
  const suerChangeSpy = jest.spyOn(FormFieldWidget.prototype, 'change');

  beforeEach(() => {
    mockField = {
      multi: false,
      store: true,
      size: 100,
      limit: 5,
      limitSize: 1024
    } as unknown as RuntimeStringField;
    widget = new FormStringUploadFieldWidget();
    widget.initialize({ field: mockField });
  });

  describe('change', () => {
    it('should handle single file upload', () => {
      const mockValue = { url: 'http://example.com/file1' };
      widget.change(mockValue);
      expect(widget.getValue()).toBe('http://example.com/file1');
    });

    it('should handle multiple file upload', () => {
      const mockValue = [{ url: 'http://example.com/file1' }, { url: 'http://example.com/file2' }];
      widget.field.multi = true;
      widget.change(mockValue);
      expect(widget.getValue()).toEqual(['http://example.com/file1', 'http://example.com/file2']);
    });
  });

  describe('remove', () => {
    it('should remove a file from multiple files', () => {
      const mockValue = [{ url: 'http://example.com/file1' }, { url: 'http://example.com/file2' }];
      widget.field.multi = true;
      widget.change(mockValue);
      widget.remove({ url: 'http://example.com/file1' });
      expect(widget.getValue()).toEqual(['http://example.com/file2']);
    });

    it('should clear single file', () => {
      widget.change({ url: 'http://example.com/file1' });
      widget.remove({ url: 'http://example.com/file1' });
      expect(widget.getValue()).toBe('');
    });
  });

  describe('validator', () => {
    it('should pass validation when value is within field size', async () => {
      widget.change('http://example.com/file1');
      const result = await widget.validator();
      expect(result.status).toBe(true);
    });

    it('should fail validation when value exceeds field size', async () => {
      widget.field.size = 10;
      widget.change('http://example.com/file1');
      const result = await widget.validator();
      expect(result.status).toBe(false);
      expect(result.message).toContain('链接总长度');
    });

    it('should skip validation when field is not stored', async () => {
      widget.field.store = false;
      widget.change('http://example.com/file1');
      const result = await widget.validator();
      expect(result.status).toBe(true);
    });
  });
});
