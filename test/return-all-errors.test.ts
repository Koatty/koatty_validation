/**
 * Test for returnAllErrors option in ClassValidator.valid()
 * @description Tests that multiple validation errors can be returned
 */

import { ClassValidator, ValidOtpions, ValidationOptions } from "../src/index";
import { IsNotEmpty, IsMobile, IsCnName, IsEmail, createSimpleDecorator } from "../src/decorators";
import { KoattyValidationError } from "../src/error-handler";

// Test DTO class
export class TestDTO {
  @IsNotEmpty({ message: "手机号不能为空" })
  @IsMobile({ message: "手机号格式不正确" })
  phoneNum: string;

  @IsCnName({ message: "姓名必须是有效的中文姓名" })
  userName: string;

  @IsEmail({ message: "邮箱格式不正确" })
  email: string;
}

describe('ClassValidator.valid - returnAllErrors option', () => {

  it('should return only first error by default (backward compatibility)', async () => {
    const testData = {
      phoneNum: "123",        // 无效手机号
      userName: "123",        // 无效姓名
      email: "invalid-email" // 无效邮箱
    };

    try {
      await ClassValidator.valid(TestDTO, testData, true);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      // Default behavior: only first error
      expect(error instanceof Error).toBe(true);
      expect(error.message).not.toContain('姓名');
      expect(error.message).not.toContain('邮箱');
      console.log('Default behavior error:', error.message);
    }
  });

  it('should return all errors when returnAllErrors=true', async () => {
    const testData = {
      phoneNum: "123",        // 无效手机号
      userName: "aaaaaaaaaaa", // 无效姓名（超过长度限制）
      email: "invalid-email" // 无效邮箱
    };

    const options: ValidationOptions = {
      returnAllErrors: true,
      errorSeparator: '; '
    };

    try {
      await ClassValidator.valid(TestDTO, testData, true, options);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      // Check it's a KoattyValidationError with all errors
      expect(error).toBeInstanceOf(KoattyValidationError);
      const validationError = error as KoattyValidationError;

      // Message should contain all three errors
      expect(validationError.message).toContain('手机号');
      expect(validationError.message).toContain('姓名');
      expect(validationError.message).toContain('邮箱');

      // Should have 3 error details
      expect(validationError.errors.length).toBe(3);

      // Check each error field
      const phoneError = validationError.errors.find(e => e.field === 'phoneNum');
      expect(phoneError).toBeDefined();
      expect(phoneError?.constraint).toBe('IsMobile');

      const nameError = validationError.errors.find(e => e.field === 'userName');
      expect(nameError).toBeDefined();
      expect(nameError?.constraint).toBe('IsCnName');

      const emailError = validationError.errors.find(e => e.field === 'email');
      expect(emailError).toBeDefined();
      expect(emailError?.constraint).toBe('IsEmail');

      console.log('All errors:', validationError.message);
      console.log('Error details:', JSON.stringify(validationError.errors, null, 2));
    }
  });

  it('should use custom error separator when specified', async () => {
    const testData = {
      phoneNum: "123",
      userName: "aaaaaaaaaaa",
      email: "invalid-email"
    };

    const options: ValidationOptions = {
      returnAllErrors: true,
      errorSeparator: ' | '
    };

    try {
      await ClassValidator.valid(TestDTO, testData, true, options);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      const validationError = error as KoattyValidationError;

      // Should use custom separator
      expect(validationError.message).toContain(' | ');

      console.log('Custom separator error:', validationError.message);
    }
  });

  it('should handle single error with returnAllErrors=true', async () => {
    const testData = {
      phoneNum: "123",  // 只有这一个错误
      userName: "张三",    // 有效姓名
      email: "test@example.com"  // 有效邮箱
    };

    const options: ValidationOptions = {
      returnAllErrors: true
    };

    try {
      await ClassValidator.valid(TestDTO, testData, true, options);
      throw new Error('Should have thrown validation error');
    } catch (error) {
      const validationError = error as KoattyValidationError;

      // Should have only 1 error
      expect(validationError.errors.length).toBe(1);
      expect(validationError.message).toContain('手机号');

      console.log('Single error:', validationError.message);
    }
  });

  it('should return valid DTO when all fields pass validation', async () => {
    const testData = {
      phoneNum: "13812345678",    // 有效手机号
      userName: "张三",           // 有效姓名
      email: "test@example.com"    // 有效邮箱
    };

    const options: ValidationOptions = {
      returnAllErrors: true
    };

    const result = await ClassValidator.valid(TestDTO, testData, true, options);

    // Should return the validated DTO
    expect(result).toBeInstanceOf(TestDTO);
    expect(result.phoneNum).toBe("13812345678");
    expect(result.userName).toBe("张三");
    expect(result.email).toBe("test@example.com");

    console.log('Validated DTO:', result);
  });

  it('should handle empty validation errors array', async () => {
    const testData = {
      phoneNum: "13812345678",
      userName: "张三",
      email: "test@example.com"
    };

    const options: ValidationOptions = {
      returnAllErrors: true
    };

    // Should not throw
    const result = await ClassValidator.valid(TestDTO, testData, true, options);
    expect(result).toBeInstanceOf(TestDTO);
  });
});
