/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-09 17:57:30
 */
import helper from "think_lib";
import { plainToClass, checkParamsType, cnname, idnumber, zipcode, mobile, platenumber } from "./Lib";
import { validate, Validator } from "class-validator";
export const ValidatorCls = new Validator();

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
     *
     *
     * @param {*} Clazz
     * @param {*} data
     * @returns {Promise<any>}
     * @memberof ValidateUtil
     */
    async valid(Clazz: any, data: any): Promise<any> {
        const obj = plainToClass(Clazz, data);
        const errors = await validate(obj, { skipMissingProperties: true });
        if (errors.length > 0) {
            const err: any = new Error(Object.values(errors[0].constraints)[0]);
            err.code = 400;
            err.status = 400;
            throw err;
        }

        return obj;
    }
}

/**
 * ClassValidator for manual
 */
export const ClassValidator = ValidateClass.getInstance();



interface IsEmailOptions {
    allow_display_name?: boolean;
    require_display_name?: boolean;
    allow_utf8_local_part?: boolean;
    require_tld?: boolean;
}
interface IsURLOptions {
    protocols?: string[];
    require_tld?: boolean;
    require_protocol?: boolean;
    require_host?: boolean;
    require_valid_protocol?: boolean;
    allow_underscores?: boolean;
    host_whitelist?: (string | RegExp)[];
    host_blacklist?: (string | RegExp)[];
    allow_trailing_dot?: boolean;
    allow_protocol_relative_urls?: boolean;
    disallow_auth?: boolean;
}
type HashAlgorithm = "md4" | "md5" | "sha1" | "sha256" | "sha384" | "sha512" | "ripemd128" | "ripemd160" | "tiger128" | "tiger160" | "tiger192" | "crc32" | "crc32b";
/**
 * Validator Functions
 */
export const FunctionValidator: any = {
    /** 
     * Checks if value matches ("===") the comparison.
     */
    Equals: (value: unknown, comparison: unknown) => {
        return ValidatorCls.equals(value, comparison);
    },
    /**
     * Checks if value does not match ("!==") the comparison.
     */
    NotEquals: (value: unknown, comparison: unknown) => {
        return ValidatorCls.notEquals(value, comparison);
    },
    /**
     * Checks if the string contains the seed. If given value is not a string, then it returns false.
     */
    Contains: (value: unknown, seed: string) => {
        return ValidatorCls.contains(value, seed);
    },
    /**
     * Checks if given value is in a array of allowed values.
     */
    IsIn: (value: unknown, possibleValues: unknown[]) => {
        return ValidatorCls.isIn(value, possibleValues);
    },
    /**
     * Checks if given value not in a array of allowed values.
     */
    IsNotIn: (value: unknown, possibleValues: unknown[]) => {
        return ValidatorCls.isNotIn(value, possibleValues);
    },
    /**
     * Checks if a given value is a real date.
     */
    IsDate: (value: unknown) => {
        return ValidatorCls.isDate(value);
    },
    /**
     * Checks if the first number is greater than or equal to the second.
     */
    Min: (num: unknown, min: number) => {
        return ValidatorCls.min(num, min);
    },
    /**
     * Checks if the first number is less than or equal to the second.
     */
    Max: (num: unknown, max: number) => {
        return ValidatorCls.max(num, max);
    },
    /**
     * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs. If given value is not a string, then it returns false.
     */
    Length: (value: unknown, min: number, max?: number) => {
        return ValidatorCls.length(value, min, max);
    },
    /**
     * Checks if the string is an email. If given value is not a string, then it returns false.
     */
    IsEmail: (value: unknown, options?: IsEmailOptions) => {
        return ValidatorCls.isEmail(value, options);
    },
    /**
     * Checks if the string is an IP (version 4 or 6). If given value is not a string, then it returns false.
     */
    IsIP: (value: unknown, version?: number) => {
        return ValidatorCls.isIP(value, version);
    },
    /**
     * Checks if the string is a valid phone number.
     * @param value — the potential phone number string to test
     * @param region 2 characters uppercase country code (e.g. DE, US, CH). If users must enter the intl. prefix (e.g. +41), then you may pass "ZZ" or null as region. See [google-libphonenumber, metadata.js:countryCodeToRegionCodeMap on github]{@link https://github.com/ruimarinho/google-libphonenumber/blob/1e46138878cff479aafe2ce62175c6c49cb58720/src/metadata.js#L33}
     */
    IsPhoneNumber: (value: unknown, region: string) => {
        return ValidatorCls.isPhoneNumber(value, region);
    },
    /**
     * Checks if the string is an url. If given value is not a string, then it returns false.
     */
    IsUrl: (value: unknown, options?: IsURLOptions) => {
        return ValidatorCls.isURL(value, options);
    },
    /**
     * check if the string is a hash of type algorithm. Algorithm is one of ['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128', 'tiger160', 'tiger192', 'crc32', 'crc32b']
     */
    IsHash: (value: unknown, algorithm: HashAlgorithm) => {
        return ValidatorCls.isHash(value, algorithm);
    },
    /**
     * Checks if value is a chinese name.
     */
    IsCnName: (value: any) => {
        if (!helper.isString(value)) {
            return false;
        }
        return cnname(value);
    },
    /**
     * Checks if value is a idcard number.
     */
    IsIdNumber: (value: any) => {
        if (!helper.isString(value)) {
            return false;
        }
        return idnumber(value);
    },
    /**
     * Checks if value is a zipcode.
     */
    IsZipCode: (value: any) => {
        if (!helper.isString(value)) {
            return false;
        }
        return zipcode(value);
    },
    /**
     * Checks if value is a mobile phone number.
     */
    IsMobile: (value: any) => {
        if (!helper.isString(value)) {
            return false;
        }
        return mobile(value);
    },
    /**
     * Checks if value is a platenumber.
     */
    IsPlateNumber: (value: any) => {
        if (!helper.isString(value)) {
            return false;
        }
        return platenumber(value);
    },
    /**
     * Checks value is not empty, undefined, null, '', NaN, [], {} and any empty string(including spaces, tabs, formfeeds, etc.), returns false
     */
    IsNotEmpty: (value: any) => {
        return !helper.isEmpty(value);
    }
};

/**
 * type checked rules
 *
 * @export
 * @type {number}
 */
export type ValidRules = "IsNotEmpty" | "Equals" | "NotEquals" | "Contains" | "Min" | "Max" | "Length" | "IsIn" | "IsNotIn" | "IsDate" |
    "IsEmail" | "IsIP" | "IsPhoneNumber" | "IsUrl" | "IsHash" | "IsCnName" | "IsIdNumber" | "IsZipCode" | "IsMobile" | "IsPlateNumber";


/**
 * Function Validator
 *
 * @export
 * @param {string} name
 * @param {*} value
 * @param {string} type
 * @param {(ValidRules | [ValidRules] | Function)} rule
 * @param {string} [message]
 * @returns
 */
export function ValidatorFuncs(name: string, value: any, type: string, rule: ValidRules | ValidRules[] | Function, message?: string) {
    // check type
    if (!checkParamsType(value, type)) {
        const err: any = new Error(`TypeError: invalid arguments[${name}].`);
        err.code = 400;
        err.status = 400;
        throw err;
    }
    if (helper.isFunction(rule)) {
        if (!rule(value)) {
            const err: any = new Error(message || `ValidatorError: invalid arguments[${name}].`);
            err.code = 400;
            err.status = 400;
            throw err;
        }
        return value;
    } else {
        const funcs: any[] = <any[]>rule;
        if (helper.isString(rule)) {
            funcs.push(rule);
        }
        if (funcs.some((it: ValidRules) => FunctionValidator[it] && !FunctionValidator[it](value))) {
            const err: any = new Error(message || `ValidatorError: invalid arguments[${name}].`);
            err.code = 400;
            err.status = 400;
            throw err;
        }
    }

    return value;
}