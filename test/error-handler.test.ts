/**
 * 错误处理机制测试
 * @author richen
 */
import {
  KoattyValidationError,
  ErrorMessageFormatter,
  setValidationLanguage,
  createValidationError,
  createValidationErrors,
  errorFormatter,
  ERROR_MESSAGES,
  ValidationErrorDetail
} from '../src/error-handler';

describe('ErrorHandler', () => {

  describe('KoattyValidationError', () => {
    it('should create error with single validation error', () => {
      const errorDetail: ValidationErrorDetail = {
        field: 'name',
        value: '',
        constraint: 'IsNotEmpty',
        message: '姓名不能为空'
      };

      const error = new KoattyValidationError([errorDetail]);

      expect(error.name).toBe('KoattyValidationError');
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0]).toEqual(errorDetail);
      expect(error.statusCode).toBe(400);
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should create error with multiple validation errors', () => {
      const errors: ValidationErrorDetail[] = [
        {
          field: 'name',
          value: '',
          constraint: 'IsNotEmpty',
          message: '姓名不能为空'
        },
        {
          field: 'age',
          value: -1,
          constraint: 'Gt',
          message: '年龄必须大于0'
        }
      ];

      const error = new KoattyValidationError(errors);
      expect(error.errors).toHaveLength(2);
    });

    it('should get first error', () => {
      const errors: ValidationErrorDetail[] = [
        {
          field: 'name',
          value: '',
          constraint: 'IsNotEmpty',
          message: '姓名不能为空'
        },
        {
          field: 'age',
          value: -1,
          constraint: 'Gt',
          message: '年龄必须大于0'
        }
      ];

      const error = new KoattyValidationError(errors);
      const firstError = error.getFirstError();
      
      expect(firstError).toBeDefined();
      expect(firstError?.field).toBe('name');
      expect(firstError?.constraint).toBe('IsNotEmpty');
    });

    it('should get errors by field', () => {
      const errors: ValidationErrorDetail[] = [
        {
          field: 'name',
          value: '',
          constraint: 'IsNotEmpty',
          message: '姓名不能为空'
        },
        {
          field: 'name',
          value: '',
          constraint: 'IsCnName',
          message: '必须是有效的中文姓名'
        },
        {
          field: 'age',
          value: -1,
          constraint: 'Gt',
          message: '年龄必须大于0'
        }
      ];

      const error = new KoattyValidationError(errors);
      const nameErrors = error.getFieldErrors('name');
      const ageErrors = error.getFieldErrors('age');
      
      expect(nameErrors).toHaveLength(2);
      expect(ageErrors).toHaveLength(1);
      expect(nameErrors.every(e => e.field === 'name')).toBe(true);
    });

    it('should convert to JSON', () => {
      const errorDetail: ValidationErrorDetail = {
        field: 'name',
        value: '',
        constraint: 'IsNotEmpty',
        message: '姓名不能为空'
      };

      const error = new KoattyValidationError([errorDetail]);
      const json = error.toJSON();

      expect(json).toHaveProperty('name', 'KoattyValidationError');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('statusCode', 400);
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('errors');
      expect(json.errors).toHaveLength(1);
    });

    it('should handle empty errors array', () => {
      const error = new KoattyValidationError([]);
      expect(error.errors).toHaveLength(0);
      expect(error.getFirstError()).toBeUndefined();
      expect(error.getFieldErrors('any')).toHaveLength(0);
    });
  });

  describe('ErrorMessageFormatter', () => {
    let formatter: ErrorMessageFormatter;

    beforeEach(() => {
      formatter = new ErrorMessageFormatter('zh');
    });

    it('should format message in Chinese', () => {
      const message = formatter.formatMessage('IsCnName', 'name', 'John');
      expect(message).toBe('必须是有效的中文姓名');
    });

    it('should format message in English', () => {
      formatter.setLanguage('en');
      const message = formatter.formatMessage('IsCnName', 'name', 'John');
      expect(message).toBe('must be a valid Chinese name');
    });

    it('should replace field placeholder', () => {
      const message = formatter.formatMessage('invalidParameter', 'username');
      expect(message).toContain('username');
    });

    it('should replace value placeholder', () => {
      const message = formatter.formatMessage('Equals', 'status', 'active', { comparison: 'active' });
      expect(message).toContain('active');
    });

    it('should replace context placeholders', () => {
      const message = formatter.formatMessage('Gte', 'age', 15, { min: 18 });
      expect(message).toContain('18');
    });

    it('should handle unknown constraint', () => {
      const message = formatter.formatMessage('UnknownConstraint', 'field', 'value');
      expect(message).toContain('参数 field 无效');
    });

    it('should format different value types', () => {
      const stringMessage = formatter.formatMessage('Equals', 'text', 'hello', { comparison: 'hello' });
      expect(stringMessage).toContain('"hello"');

      const numberMessage = formatter.formatMessage('Equals', 'count', 5, { comparison: 5 });
      expect(numberMessage).toContain('5');

      const arrayMessage = formatter.formatMessage('IsIn', 'role', 'admin', { possibleValues: ['admin', 'user'] });
      expect(arrayMessage).toContain('admin');

      const nullMessage = formatter.formatMessage('NotEquals', 'value', null, { comparison: null });
      expect(nullMessage).toContain('null');

      const undefinedMessage = formatter.formatMessage('NotEquals', 'value', undefined, { comparison: undefined });
      expect(undefinedMessage).toContain('undefined');
    });

    it('should handle object values', () => {
      const objectValue = { id: 1, name: 'test' };
      const message = formatter.formatMessage('Equals', 'data', objectValue, { comparison: objectValue });
      expect(message).toContain(JSON.stringify(objectValue));
    });
  });

  describe('Global language setting', () => {
    it('should set global language to Chinese', () => {
      setValidationLanguage('zh');
      const message = errorFormatter.formatMessage('IsNotEmpty', 'name');
      expect(message).toBe('不能为空');
    });

    it('should set global language to English', () => {
      setValidationLanguage('en');
      const message = errorFormatter.formatMessage('IsNotEmpty', 'name');
      expect(message).toBe('should not be empty');
    });
  });

  describe('createValidationError', () => {
    beforeEach(() => {
      setValidationLanguage('zh');
    });

    it('should create validation error with auto-generated message', () => {
      const error = createValidationError('name', '', 'IsNotEmpty');
      
      expect(error.field).toBe('name');
      expect(error.value).toBe('');
      expect(error.constraint).toBe('IsNotEmpty');
      expect(error.message).toBe('不能为空');
    });

    it('should create validation error with custom message', () => {
      const customMessage = '自定义错误信息';
      const error = createValidationError('name', '', 'IsNotEmpty', customMessage);
      
      expect(error.message).toBe(customMessage);
    });

    it('should create validation error with context', () => {
      const context = { min: 18 };
      const error = createValidationError('age', 16, 'Gte', undefined, context);
      
      expect(error.context).toEqual(context);
      expect(error.message).toContain('18');
    });
  });

  describe('createValidationErrors', () => {
    beforeEach(() => {
      setValidationLanguage('zh');
    });

    it('should create KoattyValidationError from array of error definitions', () => {
      const errorDefs = [
        {
          field: 'name',
          value: '',
          constraint: 'IsNotEmpty'
        },
        {
          field: 'age',
          value: -1,
          constraint: 'Gt',
          context: { min: 0 }
        }
      ];

      const error = createValidationErrors(errorDefs);
      
      expect(error).toBeInstanceOf(KoattyValidationError);
      expect(error.errors).toHaveLength(2);
      expect(error.errors[0].message).toBe('不能为空');
      expect(error.errors[1].message).toContain('0');
    });

    it('should handle custom messages in error definitions', () => {
      const errorDefs = [
        {
          field: 'email',
          value: 'invalid-email',
          constraint: 'IsEmail',
          message: '邮箱格式不正确'
        }
      ];

      const error = createValidationErrors(errorDefs);
      expect(error.errors[0].message).toBe('邮箱格式不正确');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should contain Chinese messages', () => {
      expect(ERROR_MESSAGES.zh).toHaveProperty('IsCnName');
      expect(ERROR_MESSAGES.zh).toHaveProperty('IsNotEmpty');
      expect(ERROR_MESSAGES.zh).toHaveProperty('IsEmail');
      expect(typeof ERROR_MESSAGES.zh.IsCnName).toBe('string');
    });

    it('should contain English messages', () => {
      expect(ERROR_MESSAGES.en).toHaveProperty('IsCnName');
      expect(ERROR_MESSAGES.en).toHaveProperty('IsNotEmpty');
      expect(ERROR_MESSAGES.en).toHaveProperty('IsEmail');
      expect(typeof ERROR_MESSAGES.en.IsCnName).toBe('string');
    });

    it('should have consistent keys between languages', () => {
      const zhKeys = Object.keys(ERROR_MESSAGES.zh).sort();
      const enKeys = Object.keys(ERROR_MESSAGES.en).sort();
      expect(zhKeys).toEqual(enKeys);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long error messages', () => {
      const longMessage = 'x'.repeat(1000);
      const error = createValidationError('field', 'value', 'constraint', longMessage);
      expect(error.message).toBe(longMessage);
    });

    it('should handle special characters in field names', () => {
      const fieldName = 'field@#$%^&*()';
      const error = createValidationError(fieldName, 'value', 'IsNotEmpty');
      expect(error.field).toBe(fieldName);
    });

    it('should handle circular references in context objects', () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;
      
      // This should not throw an error
      expect(() => {
        createValidationError('field', 'value', 'constraint', undefined, circularObj);
      }).not.toThrow();
    });

    it('should handle prototype pollution attempts', () => {
      const maliciousContext = JSON.parse('{"__proto__": {"polluted": true}}');
      const error = createValidationError('field', 'value', 'constraint', undefined, maliciousContext);
      
      // The context should be set, but prototype pollution should not occur
      expect(error.context).toBeDefined();
      expect((Object.prototype as any).polluted).toBeUndefined();
    });
  });
}); 