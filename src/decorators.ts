/**
 * Refactored decorator definitions - Using factory functions to eliminate duplication
 * @author richen
 */
import * as helper from "koatty_lib";
import { CountryCode } from 'libphonenumber-js';
import { ValidationOptions, isEmail, isIP, isPhoneNumber, isURL, isHash, validate } from "class-validator";
import { IOCContainer } from "koatty_container";
import { createSimpleDecorator, createParameterizedDecorator } from "./decorator-factory";
import { cnName, idNumber, mobile, plateNumber, zipCode, setExpose } from "./util";
import { IsEmailOptions, IsURLOptions, HashAlgorithm, ValidOtpions } from "./types";
import { ValidRules, PARAM_CHECK_KEY } from "./rule";
import { createValidationErrors } from "./error-handler";

// Chinese localization validation decorators
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

// Basic validation decorators
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

// Parameterized validation decorators
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

// Basic utility decorators (migrated from original decorator.ts)

/**
 * Mark property as exportable
 */
export function Expose(): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    setExpose(object, propertyName);
  };
}

/**
 * Alias for Expose
 */
export function IsDefined(): PropertyDecorator {
  return function (object: Object, propertyName: string) {
    setExpose(object, propertyName);
  };
}

/**
 * Parameter validation decorator
 */
export function Valid(rule: ValidRules | ValidRules[] | Function, options?: string | ValidOtpions): ParameterDecorator {
  return function (object: any, propertyName: string | symbol | undefined, parameterIndex: number) {
    // Keep consistent with original implementation
    const existingRules = Reflect.getOwnMetadata("validate", object, propertyName) || {};
    existingRules[parameterIndex] = { rule, options };
    Reflect.defineMetadata("validate", existingRules, object, propertyName);
  };
}

/**
 * Synchronous validation function - Executes the actual validation logic
 * @param args Method parameters
 * @param paramTypes Parameter type metadata
 * @returns Validated parameters and validation targets
 */
export async function checkValidated(
  args: any[],
  paramTypes: any[]
): Promise<{ validatedArgs: any[]; validationTargets: any[] }> {
  const validationTargets: any[] = [];
  
  // Validate each parameter
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const paramType = paramTypes[i];
    
    // If it's a class type and not a basic type, perform validation
    if (paramType && typeof paramType === 'function' && 
        paramType !== String && paramType !== Number && 
        paramType !== Boolean && paramType !== Array && 
        paramType !== Object && paramType !== Date) {
      
      try {
        // If parameter is not an instance of the target type, convert it to an instance
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
        
        validationTargets.push(validationTarget);
      } catch (error) {
        // If validation fails, rethrow the error
        throw error;
      }
    } else {
      validationTargets.push(arg);
    }
  }
  
  return { validatedArgs: args, validationTargets };
}

/**
 * Method validation decorator
 * Automatically validates DTO objects in method parameters
 * @param isAsync Whether to use async validation mode, default is true
 *   - true: Async mode, validation is handled by IOC container in the framework (suitable for scenarios where parameter values need to be obtained asynchronously)
 *   - false: Sync mode, validation is performed immediately when the method is called (suitable for scenarios where parameter values are already prepared)
 */
export function Validated(isAsync: boolean = true): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (isAsync) {
      // Async mode: Save metadata, validation will be performed by the framework after async parameter retrieval
      IOCContainer.savePropertyData(PARAM_CHECK_KEY, {
        dtoCheck: 1
      }, target, propertyKey);
    } else {
      // Sync mode: Perform validation immediately when the method is called
      const originalMethod = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        // Get parameter type metadata
        const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
        
        // Execute validation
        await checkValidated(args, paramTypes);
        
        // Execute original method
        return originalMethod.apply(this, args);
      };
    }
    
    return descriptor;
  };
} 