/**
 * 自定义装饰器示例
 * 演示如何使用装饰器工厂创建各种自定义验证装饰器
 * @author richen
 */

import * as helper from "koatty_lib";
import { ValidationOptions } from "class-validator";
import { 
  createSimpleDecorator, 
  createParameterizedDecorator, 
  createValidationDecorator 
} from "../src/decorator-factory";

// ==================== 简单验证装饰器示例 ====================

/**
 * 检查是否为正整数
 */
export const IsPositiveInteger = createSimpleDecorator(
  'IsPositiveInteger',
  (value: any) => {
    const num = helper.toNumber(value);
    return Number.isInteger(num) && num > 0;
  },
  'must be a positive integer'
);

/**
 * 检查是否为有效的颜色代码（十六进制）
 */
export const IsHexColor = createSimpleDecorator(
  'IsHexColor',
  (value: any) => {
    if (!helper.isString(value)) return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  },
  'must be a valid hex color code (e.g., #FF0000 or #F00)'
);

/**
 * 检查是否为有效的JSON字符串
 */
export const IsJsonString = createSimpleDecorator(
  'IsJsonString',
  (value: any) => {
    if (!helper.isString(value)) return false;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  'must be a valid JSON string'
);

// ==================== 带参数的验证装饰器示例 ====================

/**
 * 检查字符串是否包含指定的所有子字符串
 */
export const ContainsAll = createParameterizedDecorator(
  'ContainsAll',
  (value: any, requiredSubstrings: string[]) => {
    if (!helper.isString(value)) return false;
    return requiredSubstrings.every(substring => value.includes(substring));
  },
  'must contain all required substrings: $constraint1'
);

/**
 * 检查数组长度是否在指定范围内
 */
export const ArrayLength = createParameterizedDecorator(
  'ArrayLength',
  (value: any, min: number, max?: number) => {
    if (!Array.isArray(value)) return false;
    if (max !== undefined) {
      return value.length >= min && value.length <= max;
    }
    return value.length >= min;
  },
  'array length must be within the specified range'
);

/**
 * 检查数值是否在指定范围内（包含边界）
 */
export const InRange = createParameterizedDecorator(
  'InRange',
  (value: any, min: number, max: number) => {
    const num = helper.toNumber(value);
    return num >= min && num <= max;
  },
  'must be between $constraint1 and $constraint2 (inclusive)'
);

// ==================== 复杂自定义装饰器示例 ====================

/**
 * 检查密码强度
 * 要求：至少8位，包含大小写字母、数字和特殊字符
 */
export const IsStrongPassword = createSimpleDecorator(
  'IsStrongPassword',
  (value: any) => {
    if (!helper.isString(value)) return false;
    
    const hasLowercase = /[a-z]/.test(value);
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;
    
    return hasLowercase && hasUppercase && hasNumbers && hasSpecialChar && isLongEnough;
  },
  'password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
);

/**
 * 检查业务时间（工作日的9:00-18:00）
 */
export const IsBusinessHours = createSimpleDecorator(
  'IsBusinessHours',
  (value: any) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();
    
    // 工作日（周一到周五）的9:00-18:00
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 18;
  },
  'must be during business hours (Mon-Fri 9:00-18:00)'
);

// ==================== 使用装饰器工厂的高级示例 ====================

/**
 * 动态文件扩展名验证器
 */
export function IsFileExtension(allowedExtensions: string[], validationOptions?: ValidationOptions) {
  return createValidationDecorator({
    name: 'IsFileExtension',
    validator: (value: any) => {
      if (!helper.isString(value)) return false;
      const extension = value.toLowerCase().split('.').pop();
      return extension ? allowedExtensions.includes(extension) : false;
    },
    defaultMessage: `file must have one of the following extensions: ${allowedExtensions.join(', ')}`,
    requiresValue: false
  })(validationOptions);
}

/**
 * 自定义正则表达式验证器
 */
export function MatchesPattern(pattern: RegExp, validationOptions?: ValidationOptions) {
  return createValidationDecorator({
    name: 'MatchesPattern',
    validator: (value: any) => {
      if (!helper.isString(value)) return false;
      return pattern.test(value);
    },
    defaultMessage: `must match the pattern ${pattern.toString()}`,
    requiresValue: false
  })(validationOptions);
}

/**
 * 异步验证器示例（注意：这只是概念示例，实际使用需要配合异步验证机制）
 */
export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return createValidationDecorator({
    name: 'IsUniqueEmail',
    validator: (value: any) => {
      // 在实际应用中，这里应该是异步的数据库查询
      // 这里只是一个同步的演示
      if (!helper.isString(value)) return false;
      
      // 模拟检查邮箱是否已存在
      const existingEmails = ['admin@example.com', 'test@example.com'];
      return !existingEmails.includes(value.toLowerCase());
    },
    defaultMessage: 'email address is already in use',
    requiresValue: false
  })(validationOptions);
}

// ==================== 使用示例 ====================

/**
 * 用户注册数据传输对象示例
 */
export class UserRegistrationDto {
  @IsStrongPassword()
  password: string;

  @IsUniqueEmail()
  email: string;

  @IsHexColor()
  favoriteColor: string;

  @IsPositiveInteger()
  age: number;

  @ContainsAll(['profile'])
  jsonData: string;

  @ArrayLength(1, 5)
  hobbies: string[];

  @InRange(18, 120)
  realAge: number;

  @IsFileExtension(['jpg', 'png', 'gif'])
  avatar: string;

  @MatchesPattern(/^[A-Z][a-z]+$/)
  firstName: string;

  @IsBusinessHours()
  interviewTime: Date;

  @IsJsonString()
  metadata: string;
}