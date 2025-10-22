/*
 * @Description: 
 * @Usage: 
 * @Author: richen
 * @Date: 2021-11-25 10:47:04
 * @LastEditTime: 2024-01-03 14:32:49
 */
import * as helper from "koatty_lib";
import { CountryCode } from 'libphonenumber-js';
import { IsEmailOptions, IsURLOptions, HashAlgorithm, ValidOtpions } from "./types";
import { cnName, idNumber, mobile, plainToClass, plateNumber, zipCode } from "./util";
import {
  contains, equals, isEmail, isHash, isIn, isIP, isNotIn, isPhoneNumber,
  isURL, notEquals, validate, ValidationError
} from "class-validator";
import { validationCache } from "./performance-cache";

// constant

export const PARAM_RULE_KEY = 'PARAM_RULE_KEY';
export const PARAM_CHECK_KEY = 'PARAM_CHECK_KEY';
export const ENABLE_VALIDATED = "ENABLE_VALIDATED";

/**
 * paramterTypes
 *
 * @export
 * @enum {number}
 */
export enum paramterTypes {
  "Number", "number",
  "String", "string",
  "Boolean", "boolean",
  "Array", "array",
  "Tuple", "tuple",
  "Object", "object",
  "Enum", "enum",
  "Bigint", "bigint",
  "Null", "null",
  "Undefined", "undefined",
}


class ValidateClass {
  private static instance: ValidateClass;

  private constructor() {
  }

  /**
   * 
   *
   * @static
   * @returns
   * @memberof ValidateUtil
   */
  static getInstance() {
    return this.instance || (this.instance = new ValidateClass());
  }

  /**
   * validated data vs dto class
   *
   * @param {*} Clazz
   * @param {*} data
   * @param {boolean} [convert=false] auto convert parameters type
   * @returns {Promise<any>}
   * @memberof ValidateClass
   */
  async valid(Clazz: any, data: any, convert = false): Promise<any> {
    let obj: any = {};
    if (data instanceof Clazz) {
      obj = data;
    } else {
      obj = plainToClass(Clazz, data, convert);
    }
    let errors: ValidationError[] = [];
    if (convert) {
      errors = await validate(obj);
    } else {
      errors = await validate(obj, { skipMissingProperties: true });
    }
    if (errors.length > 0) {
      throw new Error(Object.values(errors[0].constraints)[0]);
    }
    return obj;
  }
}

/**
 * ClassValidator for manual
 */
export const ClassValidator = ValidateClass.getInstance();

/**
 * type checked rules
 *
 * @export
 * @type {number}
 */
export type ValidRules = "IsNotEmpty" | "IsDate" | "IsEmail" | "IsIP" |
  "IsPhoneNumber" | "IsUrl" | "IsHash" | "IsCnName" | "IsIdNumber" | "IsZipCode" | "IsMobile" | "IsPlateNumber" |
  "Equals" | "NotEquals" | "Contains" | "IsIn" | "IsNotIn" | "Gt" | "Lt" | "Gte" | "Lte";

/**
 * Helper function to wrap validation with cache
 */
function withCache<T extends any[]>(
  validatorName: string,
  validatorFunc: (value: unknown, ...args: T) => boolean
): (value: unknown, ...args: T) => boolean {
  return (value: unknown, ...args: T): boolean => {
    // Check cache first
    const cached = validationCache.get(validatorName, value, ...args);
    if (cached !== undefined) {
      return cached;
    }
    
    // Execute validation
    const result = validatorFunc(value, ...args);
    
    // Cache the result
    validationCache.set(validatorName, value, result, ...args);
    
    return result;
  };
}

/**
 * Validator Functions
 */
export const ValidFuncs = {
  /**
   * Checks value is not empty, undefined, null, '', NaN, [], {} and any empty string(including spaces, 
   * tabs, formfeeds, etc.), returns false
   */
  IsNotEmpty: withCache('IsNotEmpty', (value: unknown) => {
    return !helper.isEmpty(value);
  }),
  /**
   * Checks if a given value is a real date.
   */
  IsDate: withCache('IsDate', (value: unknown) => {
    return helper.isDate(value);
  }),
  /**
   * Checks if the string is an email. If given value is not a string, then it returns false.
   */
  IsEmail: withCache('IsEmail', (value: unknown, options?: IsEmailOptions) => {
    return isEmail(value, options);
  }),
  /**
   * Checks if the string is an IP (version 4 or 6). If given value is not a string, then it returns false.
   */
  IsIP: withCache('IsIP', (value: unknown, version?: any) => {
    return isIP(value, version);
  }),
  /**
   * Checks if the string is a valid phone number.
   * @param value — the potential phone number string to test
   * @param region 2 characters uppercase country code (e.g. DE, US, CH). If users must enter the intl. 
   * prefix (e.g. +41), then you may pass "ZZ" or null as region. 
   * See [google-libphonenumber, metadata.js:countryCodeToRegionCodeMap on github]
   * {@link https://github.com/ruimarinho/google-libphonenumber/blob/1e46138878cff479aafe2ce62175c6c49cb58720/src/metadata.js#L33}
   */
  IsPhoneNumber: withCache('IsPhoneNumber', (value: string, region?: CountryCode) => {
    return isPhoneNumber(value, region);
  }),
  /**
   * Checks if the string is an url. If given value is not a string, then it returns false.
   */
  IsUrl: withCache('IsUrl', (value: string, options?: IsURLOptions) => {
    return isURL(value, options);
  }),
  /**
   * check if the string is a hash of type algorithm. Algorithm is one of 
   * ['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128', 'tiger160', 'tiger192', 'crc32', 'crc32b']
   */
  IsHash: withCache('IsHash', (value: unknown, algorithm: HashAlgorithm) => {
    return isHash(value, algorithm);
  }),
  /**
   * Checks if value is a chinese name.
   */
  IsCnName: withCache('IsCnName', (value: any) => {
    if (!helper.isString(value)) {
      return false;
    }
    return cnName(value);
  }),
  /**
   * Checks if value is a idcard number.
   */
  IsIdNumber: withCache('IsIdNumber', (value: any) => {
    if (!helper.isString(value)) {
      return false;
    }
    return idNumber(value);
  }),
  /**
   * Checks if value is a zipCode.
   */
  IsZipCode: withCache('IsZipCode', (value: any) => {
    if (!helper.isString(value)) {
      return false;
    }
    return zipCode(value);
  }),
  /**
   * Checks if value is a mobile phone number.
   */
  IsMobile: withCache('IsMobile', (value: any) => {
    if (!helper.isString(value)) {
      return false;
    }
    return mobile(value);
  }),
  /**
   * Checks if value is a plateNumber.
   */
  IsPlateNumber: withCache('IsPlateNumber', (value: any) => {
    if (!helper.isString(value)) {
      return false;
    }
    return plateNumber(value);
  }),
  /** 
   * Checks if value matches ("===") the comparison.
   */
  Equals: withCache('Equals', (value: unknown, comparison: unknown) => {
    return equals(value, comparison);
  }),
  /**
   * Checks if value does not match ("!==") the comparison.
   */
  NotEquals: withCache('NotEquals', (value: unknown, comparison: unknown) => {
    return notEquals(value, comparison);
  }),
  /**
   * Checks if the string contains the seed. If given value is not a string, then it returns false.
   */
  Contains: withCache('Contains', (value: unknown, seed: string) => {
    return contains(value, seed);
  }),
  /**
   * Checks if given value is in a array of allowed values.
   */
  IsIn: withCache('IsIn', (value: unknown, possibleValues: unknown[]) => {
    return isIn(value, possibleValues);
  }),
  /**
   * Checks if given value not in a array of allowed values.
   */
  IsNotIn: withCache('IsNotIn', (value: unknown, possibleValues: unknown[]) => {
    return isNotIn(value, possibleValues);
  }),
  /**
   * Checks if the first number is greater than or equal to the second.
   */
  Gt: withCache('Gt', (num: unknown, min: number) => {
    return helper.toNumber(num) > min;
  }),
  /**
   * Checks if the first number is less than or equal to the second.
   */
  Lt: withCache('Lt', (num: unknown, max: number) => {
    return helper.toNumber(num) < max;
  }),
  /**
   * Checks if the first number is greater than or equal to the second.
   */
  Gte: withCache('Gte', (num: unknown, min: number) => {
    return helper.toNumber(num) >= min;
  }),
  /**
   * Checks if the first number is less than or equal to the second.
   */
  Lte: withCache('Lte', (num: unknown, max: number) => {
    return helper.toNumber(num) <= max;
  }),
}

/**
 * Helper function to create validator function
 */
function createValidatorFunction(
  validatorFunc: Function,
  defaultMessage: string
): (value: unknown, options?: string | ValidOtpions) => void {
  return (value: unknown, options?: string | ValidOtpions): void => {
    let validOptions: ValidOtpions;
    if (typeof options === 'string') {
      validOptions = { message: options, value: null };
    } else {
      validOptions = options || { message: defaultMessage, value: null };
    }
    
    if (!validatorFunc(value, validOptions.value)) {
      // Priority: validOptions.message -> defaultMessage -> fallback error
      let errorMessage = validOptions.message;
      
      // If message is empty or whitespace, use defaultMessage
      if (!errorMessage || !errorMessage.trim()) {
        errorMessage = defaultMessage;
      }
      
      // If defaultMessage is also empty, use fallback
      if (!errorMessage || !errorMessage.trim()) {
        errorMessage = 'ValidatorError: invalid arguments.';
      }
      
      throw new Error(errorMessage);
    }
  };
}

/**
 * Use functions or built-in rules for validation.
 * Throws error if validation fails.
 *
 * @export
 */
export const FunctionValidator = {
  IsNotEmpty: createValidatorFunction(
    ValidFuncs.IsNotEmpty,
    'Value should not be empty'
  ),
  
  IsDate: createValidatorFunction(
    ValidFuncs.IsDate,
    'Must be a valid date'
  ),
  
  IsEmail: createValidatorFunction(
    ValidFuncs.IsEmail,
    'Must be a valid email'
  ),
  
  IsIP: createValidatorFunction(
    ValidFuncs.IsIP,
    'Must be a valid IP address'
  ),
  
  IsPhoneNumber: createValidatorFunction(
    ValidFuncs.IsPhoneNumber,
    'Must be a valid phone number'
  ),
  
  IsUrl: createValidatorFunction(
    ValidFuncs.IsUrl,
    'Must be a valid URL'
  ),
  
  IsHash: createValidatorFunction(
    ValidFuncs.IsHash,
    'Must be a valid hash'
  ),
  
  IsCnName: createValidatorFunction(
    ValidFuncs.IsCnName,
    'Must be a valid Chinese name'
  ),
  
  IsIdNumber: createValidatorFunction(
    ValidFuncs.IsIdNumber,
    'Must be a valid ID number'
  ),
  
  IsZipCode: createValidatorFunction(
    ValidFuncs.IsZipCode,
    'Must be a valid zip code'
  ),
  
  IsMobile: createValidatorFunction(
    ValidFuncs.IsMobile,
    'Must be a valid mobile number'
  ),
  
  IsPlateNumber: createValidatorFunction(
    ValidFuncs.IsPlateNumber,
    'Must be a valid plate number'
  ),
  
  Equals: createValidatorFunction(
    ValidFuncs.Equals,
    'Values must be equal'
  ),
  
  NotEquals: createValidatorFunction(
    ValidFuncs.NotEquals,
    'Values must not be equal'
  ),
  
  Contains: createValidatorFunction(
    ValidFuncs.Contains,
    'Value must contain specified substring'
  ),
  
  IsIn: createValidatorFunction(
    ValidFuncs.IsIn,
    'Value must be in the allowed list'
  ),
  
  IsNotIn: createValidatorFunction(
    ValidFuncs.IsNotIn,
    'Value must not be in the forbidden list'
  ),
  
  Gt: createValidatorFunction(
    ValidFuncs.Gt,
    'Value must be greater than threshold'
  ),
  
  Lt: createValidatorFunction(
    ValidFuncs.Lt,
    'Value must be less than threshold'
  ),
  
  Gte: createValidatorFunction(
    ValidFuncs.Gte,
    'Value must be greater than or equal to threshold'
  ),
  
  Lte: createValidatorFunction(
    ValidFuncs.Lte,
    'Value must be less than or equal to threshold'
  ),
} as const;