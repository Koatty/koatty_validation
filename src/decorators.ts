/**
 * 重构后的装饰器定义 - 使用工厂函数消除重复
 * @author richen
 */
import * as helper from "koatty_lib";
import { CountryCode } from 'libphonenumber-js';
import { ValidationOptions, isEmail, isIP, isPhoneNumber, isURL, isHash, validate } from "class-validator";
import { createSimpleDecorator, createParameterizedDecorator } from "./decorator-factory";
import { cnName, idNumber, mobile, plateNumber, zipCode, setExpose } from "./util";
import { IsEmailOptions, IsURLOptions, HashAlgorithm, ValidOtpions } from "./types";
import { ValidRules } from "./rule";
import { createValidationErrors } from "./error-handler";

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
 * 自动验证方法参数中的 DTO 对象
 */
export function Validated(): MethodDecorator {
  return function (object: any, propertyName: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // 获取参数类型元数据
      const paramTypes = Reflect.getMetadata('design:paramtypes', object, propertyName) || [];
      
      // 验证每个参数
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const paramType = paramTypes[i];
        
        // 如果是类类型且不是基础类型，执行验证
        if (paramType && typeof paramType === 'function' && 
            paramType !== String && paramType !== Number && 
            paramType !== Boolean && paramType !== Array && 
            paramType !== Object && paramType !== Date) {
          
          try {
            // 如果参数不是目标类型的实例，转换为实例
            let validationTarget = arg;
            if (!(arg instanceof paramType)) {
              validationTarget = Object.assign(new paramType(), arg);
            }
            
            const errors = await validate(validationTarget);
            
            if (errors.length > 0) {
              throw createValidationErrors(
                errors.map(e => ({
                  field: e.property,
                  value: e.value,
                  constraint: Object.keys(e.constraints || {})[0] || 'unknown',
                  message: Object.values(e.constraints || {})[0] || 'Validation failed',
                  context: e.constraints
                }))
              );
            }
          } catch (error) {
            // 如果验证失败，重新抛出错误
            throw error;
          }
        }
      }
      
      // 执行原始方法
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
} 