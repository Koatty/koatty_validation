/**
 * 自定义装饰器示例测试
 * @author richen
 */

import { validate } from 'class-validator';
import {
  IsPositiveInteger,
  IsHexColor,
  IsJsonString
} from '../examples/custom-decorators-example';

describe('Custom Decorators Example', () => {
  
  describe('IsPositiveInteger', () => {
    class TestClass {
      @IsPositiveInteger()
      value: any;
    }

    it('should pass for positive integers', async () => {
      const test = new TestClass();
      test.value = 5;
      const errors = await validate(test);
      expect(errors).toHaveLength(0);
    });

    it('should fail for negative numbers', async () => {
      const test = new TestClass();
      test.value = -5;
      const errors = await validate(test);
      expect(errors).toHaveLength(1);
    });
  });

  describe('IsHexColor', () => {
    class TestClass {
      @IsHexColor()
      color: any;
    }

    it('should pass for valid hex colors', async () => {
      const test = new TestClass();
      test.color = '#FF0000';
      const errors = await validate(test);
      expect(errors).toHaveLength(0);
    });

    it('should fail for invalid hex colors', async () => {
      const test = new TestClass();
      test.color = 'red';
      const errors = await validate(test);
      expect(errors).toHaveLength(1);
    });
  });

  describe('IsJsonString', () => {
    class TestClass {
      @IsJsonString()
      json: any;
    }

    it('should pass for valid JSON strings', async () => {
      const test = new TestClass();
      test.json = '{"test": true}';
      const errors = await validate(test);
      expect(errors).toHaveLength(0);
    });

    it('should fail for invalid JSON strings', async () => {
      const test = new TestClass();
      test.json = '{invalid}';
      const errors = await validate(test);
      expect(errors).toHaveLength(1);
    });
  });
});