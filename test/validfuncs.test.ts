import { ValidFuncs } from '../src/rule';

describe('ValidFuncs Validation Functions', () => {
  describe('IsNotEmpty', () => {
    test('should validate non-empty values', () => {
      expect(ValidFuncs.IsNotEmpty('hello')).toBe(true);
      expect(ValidFuncs.IsNotEmpty(123)).toBe(true);
      expect(ValidFuncs.IsNotEmpty([1, 2, 3])).toBe(true);
      expect(ValidFuncs.IsNotEmpty({ key: 'value' })).toBe(true);
    });

    test('should reject empty values', () => {
      expect(ValidFuncs.IsNotEmpty('')).toBe(false);
      expect(ValidFuncs.IsNotEmpty([])).toBe(false);
      expect(ValidFuncs.IsNotEmpty({})).toBe(false);
      expect(ValidFuncs.IsNotEmpty(null)).toBe(false);
      expect(ValidFuncs.IsNotEmpty(undefined)).toBe(false);
    });
  });

  describe('IsDate', () => {
    test('should validate date values', () => {
      expect(ValidFuncs.IsDate(new Date())).toBe(true);
      expect(ValidFuncs.IsDate(new Date('2023-01-01'))).toBe(true);
    });

    test('should reject invalid dates', () => {
      expect(ValidFuncs.IsDate('not a date')).toBe(false);
      expect(ValidFuncs.IsDate(123)).toBe(false);
      expect(ValidFuncs.IsDate(null)).toBe(false);
    });
  });

  describe('IsEmail', () => {
    test('should validate email addresses', () => {
      expect(ValidFuncs.IsEmail('test@example.com')).toBe(true);
      expect(ValidFuncs.IsEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(ValidFuncs.IsEmail('invalid-email')).toBe(false);
      expect(ValidFuncs.IsEmail('@domain.com')).toBe(false);
      expect(ValidFuncs.IsEmail(123)).toBe(false);
    });
  });

  describe('IsIP', () => {
    test('should validate IP addresses', () => {
      expect(ValidFuncs.IsIP('192.168.1.1')).toBe(true);
      expect(ValidFuncs.IsIP('127.0.0.1')).toBe(true);
    });

    test('should reject invalid IPs', () => {
      expect(ValidFuncs.IsIP('999.999.999.999')).toBe(false);
      expect(ValidFuncs.IsIP('not-an-ip')).toBe(false);
      expect(ValidFuncs.IsIP(123)).toBe(false);
    });
  });

  describe('Chinese validation functions', () => {
    test('IsCnName should validate Chinese names', () => {
      expect(ValidFuncs.IsCnName('张三')).toBe(true);
      expect(ValidFuncs.IsCnName('李四')).toBe(true);
      expect(ValidFuncs.IsCnName(123)).toBe(false);
      expect(ValidFuncs.IsCnName('')).toBe(false);
    });

    test('IsIdNumber should validate ID numbers', () => {
      expect(ValidFuncs.IsIdNumber('110101199001011237')).toBe(true);
      expect(ValidFuncs.IsIdNumber('123456789012345')).toBe(true);
      expect(ValidFuncs.IsIdNumber(123)).toBe(false);
      expect(ValidFuncs.IsIdNumber('invalid')).toBe(false);
    });

    test('IsMobile should validate mobile numbers', () => {
      expect(ValidFuncs.IsMobile('13812345678')).toBe(true);
      expect(ValidFuncs.IsMobile('15912345678')).toBe(true);
      expect(ValidFuncs.IsMobile(123)).toBe(false);
      expect(ValidFuncs.IsMobile('12812345678')).toBe(false);
    });

    test('IsZipCode should validate zip codes', () => {
      expect(ValidFuncs.IsZipCode('100000')).toBe(true);
      expect(ValidFuncs.IsZipCode('518000')).toBe(true);
      expect(ValidFuncs.IsZipCode(123)).toBe(false);
      expect(ValidFuncs.IsZipCode('10000')).toBe(false);
    });

    test('IsPlateNumber should validate license plates', () => {
      expect(ValidFuncs.IsPlateNumber('京A12345')).toBe(true);
      expect(ValidFuncs.IsPlateNumber('沪B98765')).toBe(true);
      expect(ValidFuncs.IsPlateNumber(123)).toBe(false);
      expect(ValidFuncs.IsPlateNumber('ABC123')).toBe(false);
    });
  });

  describe('Comparison functions', () => {
    test('Equals should check strict equality', () => {
      expect(ValidFuncs.Equals('test', 'test')).toBe(true);
      expect(ValidFuncs.Equals(123, 123)).toBe(true);
      expect(ValidFuncs.Equals('test', 'other')).toBe(false);
      expect(ValidFuncs.Equals('123', 123)).toBe(false);
    });

    test('NotEquals should check strict inequality', () => {
      expect(ValidFuncs.NotEquals('test', 'other')).toBe(true);
      expect(ValidFuncs.NotEquals('123', 123)).toBe(true);
      expect(ValidFuncs.NotEquals('test', 'test')).toBe(false);
    });

    test('Contains should check string containment', () => {
      expect(ValidFuncs.Contains('hello world', 'world')).toBe(true);
      expect(ValidFuncs.Contains('test', 'es')).toBe(true);
      expect(ValidFuncs.Contains('hello', 'xyz')).toBe(false);
    });

    test('IsIn should check array membership', () => {
      expect(ValidFuncs.IsIn('a', ['a', 'b', 'c'])).toBe(true);
      expect(ValidFuncs.IsIn(2, [1, 2, 3])).toBe(true);
      expect(ValidFuncs.IsIn('d', ['a', 'b', 'c'])).toBe(false);
    });

    test('IsNotIn should check array non-membership', () => {
      expect(ValidFuncs.IsNotIn('d', ['a', 'b', 'c'])).toBe(true);
      expect(ValidFuncs.IsNotIn('a', ['a', 'b', 'c'])).toBe(false);
    });
  });

  describe('Numeric comparisons', () => {
    test('Gt should check greater than', () => {
      expect(ValidFuncs.Gt(15, 10)).toBe(true);
      expect(ValidFuncs.Gt('20', 15)).toBe(true);
      expect(ValidFuncs.Gt(5, 10)).toBe(false);
    });

    test('Lt should check less than', () => {
      expect(ValidFuncs.Lt(5, 10)).toBe(true);
      expect(ValidFuncs.Lt('8', 10)).toBe(true);
      expect(ValidFuncs.Lt(15, 10)).toBe(false);
    });

    test('Gte should check greater than or equal', () => {
      expect(ValidFuncs.Gte(15, 10)).toBe(true);
      expect(ValidFuncs.Gte(10, 10)).toBe(true);
      expect(ValidFuncs.Gte(5, 10)).toBe(false);
    });

    test('Lte should check less than or equal', () => {
      expect(ValidFuncs.Lte(5, 10)).toBe(true);
      expect(ValidFuncs.Lte(10, 10)).toBe(true);
      expect(ValidFuncs.Lte(15, 10)).toBe(false);
    });
  });
}); 