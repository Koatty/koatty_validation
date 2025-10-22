import { FunctionValidator } from '../src/rule';

describe('FunctionValidator', () => {
  describe('IsNotEmpty', () => {
    test('should pass for non-empty values', () => {
      expect(() => FunctionValidator.IsNotEmpty('hello', { message: 'Value is empty', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsNotEmpty(123, { message: 'Value is empty', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsNotEmpty([1, 2, 3], { message: 'Value is empty', value: null })).not.toThrow();
    });

    test('should throw for empty values', () => {
      expect(() => FunctionValidator.IsNotEmpty('', { message: 'Value is empty', value: null })).toThrow('Value is empty');
      expect(() => FunctionValidator.IsNotEmpty([], { message: 'Array is empty', value: null })).toThrow('Array is empty');
      expect(() => FunctionValidator.IsNotEmpty(null, { message: 'Value is null', value: null })).toThrow('Value is null');
    });

    test('should use string message directly', () => {
      expect(() => FunctionValidator.IsNotEmpty('', 'Custom error message')).toThrow('Custom error message');
    });

    test('should use default message when message is empty string', () => {
      // When message is empty, should use the function's defaultMessage
      expect(() => FunctionValidator.IsNotEmpty('', { message: '', value: null })).toThrow('Value should not be empty');
    });

    test('should use fallback error when no options provided', () => {
      // When no options are provided, should use defaultMessage
      expect(() => FunctionValidator.IsNotEmpty('')).toThrow('Value should not be empty');
    });
  });

  describe('IsEmail', () => {
    test('should pass for valid email addresses', () => {
      expect(() => FunctionValidator.IsEmail('test@example.com', { message: 'Invalid email', value: {} })).not.toThrow();
      expect(() => FunctionValidator.IsEmail('user.name@domain.co.uk', { message: 'Invalid email', value: {} })).not.toThrow();
    });

    test('should throw for invalid email addresses', () => {
      expect(() => FunctionValidator.IsEmail('invalid-email', { message: 'Invalid email format', value: {} })).toThrow('Invalid email format');
      expect(() => FunctionValidator.IsEmail('@domain.com', { message: 'Missing username', value: {} })).toThrow('Missing username');
    });
  });

  describe('IsIP', () => {
    test('should pass for valid IP addresses', () => {
      expect(() => FunctionValidator.IsIP('192.168.1.1', { message: 'Invalid IP', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsIP('127.0.0.1', { message: 'Invalid IP', value: null })).not.toThrow();
    });

    test('should throw for invalid IP addresses', () => {
      expect(() => FunctionValidator.IsIP('999.999.999.999', { message: 'Invalid IP format', value: null })).toThrow('Invalid IP format');
      expect(() => FunctionValidator.IsIP('not-an-ip', { message: 'Not an IP', value: null })).toThrow('Not an IP');
    });
  });

  describe('Chinese validation functions', () => {
    test('IsCnName should validate Chinese names', () => {
      expect(() => FunctionValidator.IsCnName('张三', { message: 'Invalid Chinese name', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsCnName('李四', { message: 'Invalid Chinese name', value: null })).not.toThrow();
      
      // Note: 'John' actually passes the cnName regex test as it allows a-zA-Z characters
      expect(() => FunctionValidator.IsCnName('张@三', { message: 'Invalid Chinese name', value: null })).toThrow('Invalid Chinese name');
      expect(() => FunctionValidator.IsCnName(123, { message: 'Invalid type', value: null })).toThrow('Invalid type');
    });

    test('IsIdNumber should validate ID numbers', () => {
      expect(() => FunctionValidator.IsIdNumber('110101199001011237', { message: 'Invalid ID', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsIdNumber('123456789012345', { message: 'Invalid ID', value: null })).not.toThrow();
      
      expect(() => FunctionValidator.IsIdNumber('invalid', { message: 'Invalid ID format', value: null })).toThrow('Invalid ID format');
      expect(() => FunctionValidator.IsIdNumber(123, { message: 'Invalid type', value: null })).toThrow('Invalid type');
    });

    test('IsMobile should validate mobile numbers', () => {
      expect(() => FunctionValidator.IsMobile('13812345678', { message: 'Invalid mobile', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsMobile('15912345678', { message: 'Invalid mobile', value: null })).not.toThrow();
      
      expect(() => FunctionValidator.IsMobile('12812345678', { message: 'Invalid mobile format', value: null })).toThrow('Invalid mobile format');
      expect(() => FunctionValidator.IsMobile(123, { message: 'Invalid type', value: null })).toThrow('Invalid type');
    });

    test('IsZipCode should validate zip codes', () => {
      expect(() => FunctionValidator.IsZipCode('100000', { message: 'Invalid zip code', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsZipCode('518000', { message: 'Invalid zip code', value: null })).not.toThrow();
      
      expect(() => FunctionValidator.IsZipCode('10000', { message: 'Invalid zip format', value: null })).toThrow('Invalid zip format');
      expect(() => FunctionValidator.IsZipCode(123, { message: 'Invalid type', value: null })).toThrow('Invalid type');
    });

    test('IsPlateNumber should validate license plates', () => {
      expect(() => FunctionValidator.IsPlateNumber('京A12345', { message: 'Invalid plate', value: null })).not.toThrow();
      expect(() => FunctionValidator.IsPlateNumber('沪B98765', { message: 'Invalid plate', value: null })).not.toThrow();
      
      expect(() => FunctionValidator.IsPlateNumber('ABC123', { message: 'Invalid plate format', value: null })).toThrow('Invalid plate format');
      expect(() => FunctionValidator.IsPlateNumber(123, { message: 'Invalid type', value: null })).toThrow('Invalid type');
    });
  });

  describe('Comparison functions', () => {
    test('Equals should check strict equality', () => {
      expect(() => FunctionValidator.Equals('test', { message: 'Not equal', value: 'test' })).not.toThrow();
      expect(() => FunctionValidator.Equals(123, { message: 'Not equal', value: 123 })).not.toThrow();
      
      expect(() => FunctionValidator.Equals('test', { message: 'Values not equal', value: 'other' })).toThrow('Values not equal');
      expect(() => FunctionValidator.Equals('123', { message: 'Type mismatch', value: 123 })).toThrow('Type mismatch');
    });

    test('NotEquals should check strict inequality', () => {
      expect(() => FunctionValidator.NotEquals('test', { message: 'Values are equal', value: 'other' })).not.toThrow();
      expect(() => FunctionValidator.NotEquals('123', { message: 'Values are equal', value: 123 })).not.toThrow();
      
      expect(() => FunctionValidator.NotEquals('test', { message: 'Values should not be equal', value: 'test' })).toThrow('Values should not be equal');
    });

    test('Contains should check string containment', () => {
      expect(() => FunctionValidator.Contains('hello world', { message: 'Does not contain', value: 'world' })).not.toThrow();
      expect(() => FunctionValidator.Contains('test', { message: 'Does not contain', value: 'es' })).not.toThrow();
      
      expect(() => FunctionValidator.Contains('hello', { message: 'String not found', value: 'xyz' })).toThrow('String not found');
    });

    test('IsIn should check array membership', () => {
      expect(() => FunctionValidator.IsIn('a', { message: 'Not in array', value: ['a', 'b', 'c'] })).not.toThrow();
      expect(() => FunctionValidator.IsIn(2, { message: 'Not in array', value: [1, 2, 3] })).not.toThrow();
      
      expect(() => FunctionValidator.IsIn('d', { message: 'Value not in allowed list', value: ['a', 'b', 'c'] })).toThrow('Value not in allowed list');
    });

    test('IsNotIn should check array non-membership', () => {
      expect(() => FunctionValidator.IsNotIn('d', { message: 'Value in forbidden list', value: ['a', 'b', 'c'] })).not.toThrow();
      
      expect(() => FunctionValidator.IsNotIn('a', { message: 'Value should not be in list', value: ['a', 'b', 'c'] })).toThrow('Value should not be in list');
    });
  });

  describe('Numeric comparisons', () => {
    test('Gt should check greater than', () => {
      expect(() => FunctionValidator.Gt(15, { message: 'Not greater than', value: 10 })).not.toThrow();
      expect(() => FunctionValidator.Gt('20', { message: 'Not greater than', value: 15 })).not.toThrow();
      
      expect(() => FunctionValidator.Gt(5, { message: 'Value too small', value: 10 })).toThrow('Value too small');
    });

    test('Lt should check less than', () => {
      expect(() => FunctionValidator.Lt(5, { message: 'Not less than', value: 10 })).not.toThrow();
      expect(() => FunctionValidator.Lt('8', { message: 'Not less than', value: 10 })).not.toThrow();
      
      expect(() => FunctionValidator.Lt(15, { message: 'Value too large', value: 10 })).toThrow('Value too large');
    });

    test('Gte should check greater than or equal', () => {
      expect(() => FunctionValidator.Gte(15, { message: 'Not greater or equal', value: 10 })).not.toThrow();
      expect(() => FunctionValidator.Gte(10, { message: 'Not greater or equal', value: 10 })).not.toThrow();
      
      expect(() => FunctionValidator.Gte(5, { message: 'Value too small', value: 10 })).toThrow('Value too small');
    });

    test('Lte should check less than or equal', () => {
      expect(() => FunctionValidator.Lte(5, { message: 'Not less or equal', value: 10 })).not.toThrow();
      expect(() => FunctionValidator.Lte(10, { message: 'Not less or equal', value: 10 })).not.toThrow();
      
      expect(() => FunctionValidator.Lte(15, { message: 'Value too large', value: 10 })).toThrow('Value too large');
    });
  });
}); 