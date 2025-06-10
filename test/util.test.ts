import {
  convertParamsType,
  checkParamsType,
  cnName,
  idNumber,
  mobile,
  zipCode,
  plateNumber
} from '../src/util';

describe('Util Functions', () => {
  describe('convertParamsType', () => {
    test('should convert to Number', () => {
      expect(convertParamsType('123', 'Number')).toBe(123);
      expect(convertParamsType('123.45', 'number')).toBe(123.45);
      expect(convertParamsType(456, 'Number')).toBe(456);
      expect(convertParamsType('abc', 'Number')).toBeNaN();
      expect(convertParamsType(null, 'Number')).toBeNaN();
    });

    test('should convert to Boolean', () => {
      expect(convertParamsType('true', 'Boolean')).toBe(true);
      expect(convertParamsType('false', 'boolean')).toBe(true); // !!param
      expect(convertParamsType(0, 'Boolean')).toBe(false);
      expect(convertParamsType(1, 'Boolean')).toBe(true);
      expect(convertParamsType('', 'Boolean')).toBe(false);
      expect(convertParamsType(null, 'Boolean')).toBe(false);
    });

    test('should convert to Array', () => {
      expect(convertParamsType([1, 2, 3], 'Array')).toEqual([1, 2, 3]);
      expect(convertParamsType('test', 'array')).toEqual(['t', 'e', 's', 't']); // string to character array
      expect(convertParamsType(123, 'Tuple')).toEqual([]); // number to empty array
      expect(convertParamsType(null, 'tuple')).toEqual([]); // null to empty array
    });

    test('should convert to String', () => {
      expect(convertParamsType('hello', 'String')).toBe('hello');
      expect(convertParamsType(123, 'string')).toBe('123');
      expect(convertParamsType(true, 'String')).toBe('true');
      expect(convertParamsType(null, 'String')).toBe(''); // null converts to empty string
      expect(convertParamsType(undefined, 'String')).toBe(''); // undefined converts to empty string
    });

    test('should convert to Null', () => {
      expect(convertParamsType('anything', 'Null')).toBeNull();
      expect(convertParamsType(123, 'null')).toBeNull();
    });

    test('should convert to Undefined', () => {
      expect(convertParamsType('anything', 'Undefined')).toBeUndefined();
      expect(convertParamsType(123, 'undefined')).toBeUndefined();
    });

    test('should convert to Bigint', () => {
      expect(convertParamsType(123n, 'Bigint')).toBe(123n);
      expect(convertParamsType('123', 'bigint')).toBe(123n);
      expect(convertParamsType(456, 'Bigint')).toBe(456n);
    });

    test('should handle Bigint conversion errors', () => {
      expect(convertParamsType('invalid', 'Bigint')).toBe('invalid');
      expect(convertParamsType(null, 'Bigint')).toBe(null);
    });

    test('should return original value for default case', () => {
      const obj = { test: 'value' };
      expect(convertParamsType(obj, 'object')).toBe(obj);
      expect(convertParamsType(obj, 'enum')).toBe(obj);
      expect(convertParamsType(obj, 'anything')).toBe(obj);
    });
  });

  describe('checkParamsType', () => {
    test('should check Number type', () => {
      expect(checkParamsType(123, 'Number')).toBe(true);
      expect(checkParamsType(123.45, 'number')).toBe(true);
      expect(checkParamsType('123', 'Number')).toBe(false);
      expect(checkParamsType(NaN, 'Number')).toBe(false);
      expect(checkParamsType(null, 'Number')).toBe(false);
    });

    test('should check Boolean type', () => {
      expect(checkParamsType(true, 'Boolean')).toBe(true);
      expect(checkParamsType(false, 'boolean')).toBe(true);
      expect(checkParamsType(1, 'Boolean')).toBe(false);
      expect(checkParamsType('true', 'Boolean')).toBe(false);
    });

    test('should check Array type', () => {
      expect(checkParamsType([1, 2, 3], 'Array')).toBe(true);
      expect(checkParamsType([], 'array')).toBe(true);
      expect(checkParamsType([1, 2], 'Tuple')).toBe(true);
      expect(checkParamsType({}, 'tuple')).toBe(false);
      expect(checkParamsType('array', 'Array')).toBe(false);
    });

    test('should check String type', () => {
      expect(checkParamsType('hello', 'String')).toBe(true);
      expect(checkParamsType('', 'string')).toBe(true);
      expect(checkParamsType(123, 'String')).toBe(false);
      expect(checkParamsType(null, 'String')).toBe(false);
    });

    test('should check Object type', () => {
      expect(checkParamsType({ test: 'value' }, 'Object')).toBe(true);
      expect(checkParamsType({ test: 'value' }, 'object')).toBe(true);
      expect(checkParamsType({ test: 'value' }, 'Enum')).toBe(true);
      expect(checkParamsType({ test: 'value' }, 'enum')).toBe(true);
      expect(checkParamsType(null, 'Object')).toBe(false);
      expect(checkParamsType(undefined, 'Object')).toBe(false);
      expect(checkParamsType('', 'Object')).toBe(false);
    });

    test('should check Null type', () => {
      expect(checkParamsType(null, 'Null')).toBe(true);
      expect(checkParamsType(null, 'null')).toBe(true);
      expect(checkParamsType(undefined, 'Null')).toBe(false);
      expect(checkParamsType('null', 'Null')).toBe(false);
    });

    test('should check Undefined type', () => {
      expect(checkParamsType(undefined, 'Undefined')).toBe(true);
      expect(checkParamsType(undefined, 'undefined')).toBe(true);
      expect(checkParamsType(null, 'Undefined')).toBe(false);
      expect(checkParamsType('undefined', 'Undefined')).toBe(false);
    });

    test('should check Bigint type', () => {
      expect(checkParamsType(123n, 'Bigint')).toBe(true);
      expect(checkParamsType(456n, 'bigint')).toBe(true);
      expect(checkParamsType(123, 'Bigint')).toBe(false);
      expect(checkParamsType('123', 'Bigint')).toBe(false);
    });

    test('should return true for any other type', () => {
      expect(checkParamsType('anything', 'any')).toBe(true);
      expect(checkParamsType(123, 'unknown')).toBe(true);
      expect(checkParamsType(null, 'whatever')).toBe(true);
    });
  });

  describe('Chinese validation functions', () => {
    describe('cnName', () => {
      test('should validate Chinese names', () => {
        expect(cnName('张三')).toBe(true);
        expect(cnName('李四')).toBe(true);
        expect(cnName('王五')).toBe(true);
        expect(cnName('赵·六')).toBe(true); // with middle dot
        expect(cnName('abc123')).toBe(true); // alphanumeric allowed
      });

      test('should reject invalid Chinese names', () => {
        expect(cnName('张三李四王五赵六孙七周八')).toBe(false); // too long (>10)
        expect(cnName('')).toBe(false); // empty
        expect(cnName('张@三')).toBe(false); // invalid characters
        expect(cnName('李$四')).toBe(false); // invalid characters
      });
    });

    describe('idNumber', () => {
      test('should validate 15-digit ID numbers', () => {
        expect(idNumber('123456789012345')).toBe(true);
        expect(idNumber('987654321098765')).toBe(true);
      });

      test('should validate 18-digit ID numbers with checksum', () => {
        expect(idNumber('110101199001011237')).toBe(true); // valid checksum
        // Note: The idNumber function expects uppercase X, not lowercase x
      });

      test('should reject invalid ID numbers', () => {
        expect(idNumber('1234567890123456')).toBe(false); // 16 digits
        expect(idNumber('12345678901234')).toBe(false); // 14 digits
        expect(idNumber('11010119900101123Y')).toBe(false); // invalid char
        expect(idNumber('110101199001011234')).toBe(false); // invalid checksum
        expect(idNumber('abcdefghijklmnop')).toBe(false); // non-numeric
      });
    });

    describe('mobile', () => {
      test('should validate Chinese mobile numbers', () => {
        expect(mobile('13812345678')).toBe(true);
        expect(mobile('14812345678')).toBe(true);
        expect(mobile('15812345678')).toBe(true);
        expect(mobile('16812345678')).toBe(true);
        expect(mobile('17812345678')).toBe(true);
        expect(mobile('18812345678')).toBe(true);
        expect(mobile('19812345678')).toBe(true);
      });

      test('should reject invalid mobile numbers', () => {
        expect(mobile('12812345678')).toBe(false); // wrong prefix
        expect(mobile('1381234567')).toBe(false); // too short
        expect(mobile('138123456789')).toBe(false); // too long
        expect(mobile('1381234567a')).toBe(false); // non-numeric
        expect(mobile('')).toBe(false); // empty
      });
    });

    describe('zipCode', () => {
      test('should validate Chinese zip codes', () => {
        expect(zipCode('100000')).toBe(true);
        expect(zipCode('200000')).toBe(true);
        expect(zipCode('518000')).toBe(true);
      });

      test('should reject invalid zip codes', () => {
        expect(zipCode('10000')).toBe(false); // too short
        expect(zipCode('1000000')).toBe(false); // too long
        expect(zipCode('10000a')).toBe(false); // non-numeric
        expect(zipCode('')).toBe(false); // empty
      });
    });

    describe('plateNumber', () => {
      test('should validate traditional license plates', () => {
        expect(plateNumber('京A12345')).toBe(true);
        expect(plateNumber('沪B98765')).toBe(true);
        expect(plateNumber('粤C11111')).toBe(true);
        expect(plateNumber('川D22222')).toBe(true);
      });

      test('should validate new energy license plates', () => {
        expect(plateNumber('京AD12345')).toBe(true);
        expect(plateNumber('沪AF98765')).toBe(true);
        expect(plateNumber('粤DF11111')).toBe(true);
      });

      test('should reject invalid license plates', () => {
        expect(plateNumber('ABC123')).toBe(false); // wrong format
        expect(plateNumber('京1A2345')).toBe(false); // wrong format
        expect(plateNumber('')).toBe(false); // empty
        expect(plateNumber('京A1234')).toBe(false); // too short for traditional
        expect(plateNumber('京ABCD123')).toBe(false); // wrong format
      });
    });
  });
}); 