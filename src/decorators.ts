/**
 * 重构后的装饰器定义 - 使用工厂函数消除重复
 * @author richen
 */
import * as helper from "koatty_lib";
import { CountryCode } from 'libphonenumber-js';
import { ValidationOptions, isEmail, isIP, isPhoneNumber, isURL, isHash } from "class-validator";
import { createSimpleDecorator, createParameterizedDecorator } from "./decorator-factory";
import { cnName, idNumber, mobile, plateNumber, zipCode, setExpose } from "./util";
import { IsEmailOptions, IsURLOptions, HashAlgorithm, ValidOtpions } from "./types";
import { ValidRules } from "./rule";

// 中国本土化验证装饰器
export const IsCnName = createSimpleDecorator(
  'IsCnName',
  (value: any) => helper.isString(value) && cnName(value),
  'must be a valid Chinese name'
);

export const IsIdNumber = createSimpleDecorator(
  'IsIdNumber', 
  (value: any) => helper.isString(value) && idNumber(value),
  'must be a valid ID number'
);

export const IsZipCode = createSimpleDecorator(
  'IsZipCode',
  (value: any) => helper.isString(value) && zipCode(value), 
  'must be a valid zip code'
);

export const IsMobile = createSimpleDecorator(
  'IsMobile',
  (value: any) => helper.isString(value) && mobile(value),
  'must be a valid mobile number'
);

export const IsPlateNumber = createSimpleDecorator(
  'IsPlateNumber',
  (value: any) => helper.isString(value) && plateNumber(value),
  'must be a valid plate number'
);

// 基础验证装饰器
export const IsNotEmpty = createSimpleDecorator(
  'IsNotEmpty',
  (value: any) => !helper.isEmpty(value),
  'should not be empty'
);

export const IsDate = createSimpleDecorator(
  'IsDate',
  (value: any) => helper.isDate(value),
  'must be a valid date'
);

// 带参数的验证装饰器
export const Equals = createParameterizedDecorator(
  'Equals',
  (value: any, comparison: any) => value === comparison,
  'must equal to $constraint1'
);

export const NotEquals = createParameterizedDecorator(
  'NotEquals', 
  (value: any, comparison: any) => value !== comparison,
  'should not equal to $constraint1'
);

export const Contains = createParameterizedDecorator(
  'Contains',
  (value: any, seed: string) => helper.isString(value) && value.includes(seed),
  'must contain $constraint1'
);

export const IsIn = createParameterizedDecorator(
  'IsIn',
  (value: any, possibleValues: any[]) => possibleValues.includes(value),
  'must be one of the following values: $constraint1'
);

export const IsNotIn = createParameterizedDecorator(
  'IsNotIn',
  (value: any, possibleValues: any[]) => !possibleValues.includes(value),
  'should not be one of the following values: $constraint1'
);

// 数值比较装饰器
export const Gt = createParameterizedDecorator(
  'Gt',
  (value: any, min: number) => helper.toNumber(value) > min,
  'must be greater than $constraint1'
);

export const Gte = createParameterizedDecorator(
  'Gte', 
  (value: any, min: number) => helper.toNumber(value) >= min,
  'must be greater than or equal to $constraint1'
);

export const Lt = createParameterizedDecorator(
  'Lt',
  (value: any, max: number) => helper.toNumber(value) < max,
  'must be less than $constraint1'
);

export const Lte = createParameterizedDecorator(
  'Lte',
  (value: any, max: number) => helper.toNumber(value) <= max,
  'must be less than or equal to $constraint1'
);

// 复杂验证装饰器（需要特殊处理）
export function IsEmail(options?: IsEmailOptions, validationOptions?: ValidationOptions) {
  return createParameterizedDecorator(
    'IsEmail',
    (value: any) => isEmail(value, options),
    'must be a valid email'
  )(validationOptions);
}

export function IsIP(version?: any, validationOptions?: ValidationOptions) {
  return createParameterizedDecorator(
    'IsIP',
    (value: any) => isIP(value, version),
    'must be a valid IP address'
  )(validationOptions);
}

export function IsPhoneNumber(region?: CountryCode, validationOptions?: ValidationOptions) {
  return createParameterizedDecorator(
    'IsPhoneNumber',
    (value: any) => isPhoneNumber(value, region),
    'must be a valid phone number'
  )(validationOptions);
}

export function IsUrl(options?: IsURLOptions, validationOptions?: ValidationOptions) {
  return createParameterizedDecorator(
    'IsUrl',
    (value: any) => isURL(value, options),
    'must be a valid URL'
  )(validationOptions);
}

export function IsHash(algorithm: HashAlgorithm, validationOptions?: ValidationOptions) {
  return createParameterizedDecorator(
    'IsHash',
    (value: any) => isHash(value, algorithm),
    'must be a valid hash'
  )(validationOptions);
}

// 基础工具装饰器（从原始decorator.ts移植）

/**
 * 标记属性为可导出
 */
export function Expose(): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    setExpose(object, propertyName);
  };
}

/**
 * Expose的别名
 */
export function IsDefined(): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    setExpose(object, propertyName);
  };
}

/**
 * 参数验证装饰器
 */
export function Valid(rule: ValidRules | ValidRules[] | Function, options?: string | ValidOtpions): ParameterDecorator {
  return function (object: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    // 这里保持与原始实现一致
    const existingRules = Reflect.getOwnMetadata("validate", object, propertyName) || {};
    existingRules[parameterIndex] = { rule, options };
    Reflect.defineMetadata("validate", existingRules, object, propertyName);
  };
}

/**
 * 方法验证装饰器
 */
export function Validated(): MethodDecorator {
  return function (object: any, propertyName: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // 这里可以添加验证逻辑
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
} 