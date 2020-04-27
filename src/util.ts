/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-04-22 20:22:45
 */
import helper from "think_lib";
import { plainToClass, checkParamsType, cnname, idnumber, zipcode, mobile, platenumber, recursiveGetMetadata, PARAM_RULE_KEY, defineNewProperty, getOriginMetadata, PARAM_TYPE_KEY, convertParamsType, ENABLE_VALIDATED } from "./lib";
import { validate, Validator, registerDecorator, ValidationArguments, ValidationOptions, ValidationError } from "class-validator";
export const ValidatorCls = new Validator();

// options for isEmail
interface IsEmailOptions {
    allow_display_name?: boolean;
    require_display_name?: boolean;
    allow_utf8_local_part?: boolean;
    require_tld?: boolean;
}

// options for isURL
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
     * @param {boolean} [convert=false] auto convert paramers type
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
export type ValidRules = "IsNotEmpty" | "IsDate" | "IsEmail" | "IsIP" | "IsPhoneNumber" | "IsUrl" | "IsHash" | "IsCnName" | "IsIdNumber" | "IsZipCode" | "IsMobile" | "IsPlateNumber";


/**
 * Use functions or built-in rules for validation.
 *
 * @export
 * @param {string} name
 * @param {*} value
 * @param {string} type
 * @param {(ValidRules | ValidRules[] | Function)} rule
 * @param {string} [message]
 * @param {boolean} [checkType=true]
 * @returns
 */
export function ValidatorFuncs(name: string, value: any, type: string, rule: ValidRules | ValidRules[] | Function, message?: string, checkType = true) {
    // check type
    if (checkType && !checkParamsType(value, type)) {
        const err: any = new Error(`TypeError: invalid arguments '${name}'.`);
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


/**
 * append to the target class method to validated parameter.
 *
 * @export
 * @param {*} target
 * @param {string} propertyKey
 */
// export function validParamter(target: any, propertyKey: string, metaDataTypes: any[]) {
//     const vaildMetaDatas = recursiveGetMetadata(PARAM_RULE_KEY, target, propertyKey);
//     defineNewProperty(target, propertyKey, function (props: any[]) {
//         //convert type
//         props = props.map((v, k) => {
//             if (helper.isString(metaDataTypes[k])) {
//                 v = convertParamsType(v, metaDataTypes[k]);
//                 //@Valid()
//                 if (vaildMetaDatas[k] && vaildMetaDatas[k].type && vaildMetaDatas[k].rule) {
//                     ValidatorFuncs(`${k}`, v, vaildMetaDatas[k].type, vaildMetaDatas[k].rule, vaildMetaDatas[k].message);
//                 }
//             } else if (helper.isClass(metaDataTypes[k])) {
//                 v = plainToClass(metaDataTypes[k], v, true);
//             }
//             return v;
//         });
//         return props;
//     });
// }

/**
 * Set property as included in the process of transformation.
 *
 * @export
 * @param {Object} object
 * @param {(string | symbol)} propertyName
 */
export function setExpose(object: Object, propertyName: string | symbol) {
    const types = Reflect.getMetadata("design:type", object, propertyName);
    if (types) {
        const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
        originMap.set(propertyName, types.name);
    }
}

/**
 * Marks property as included in the process of transformation.
 *
 * @export
 * @returns {PropertyDecorator}
 */
export function Expose(): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }
    };
}

/**
 * Identifies that the field needs to be defined
 *
 * @export
 * @returns {PropertyDecorator}
 */
export function IsDefined(): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);
    };
}

/**
 * Checks if value is a chinese name.
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsCnName(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "IsCnName",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return cnname(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return "invalid parameter ($property).";
                }
            }
        });
    };
}

/**
 * Checks if value is a idcard number(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsIdNumber(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "IsIdNumber",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return idnumber(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return "invalid parameter ($property).";
                }
            }
        });
    };
}

/**
 * Checks if value is a zipcode(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsZipCode(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "IsZipCode",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return zipcode(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return "invalid parameter ($property).";
                }
            }
        });
    };
}

/**
 * Checks if value is a mobile phone number(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsMobile(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "IsMobile",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return mobile(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return "invalid parameter ($property).";
                }
            }
        });
    };
}

/**
 * Checks if value is a plate number(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsPlateNumber(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "IsPlateNumber",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return platenumber(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return "invalid parameter ($property).";
                }
            }
        });
    };

}

/**
 * Checks value is not empty, undefined, null, '', NaN, [], {} and any empty string(including spaces, tabs, formfeeds, etc.), returns false.
 *
 * @export
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsNotEmpty(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "IsNotEmpty",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return !helper.isEmpty(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return "invalid parameter ($property).";
                }
            }
        });
    };
}

/**
 * Checks if value matches ("===") the comparison.
 *
 * @export
 * @param {*} comparison
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function Equals(comparison: any, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vEquals",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.equals(value, comparison);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter, ($property) must be equals ${comparison}.`;
                }
            }
        });
    };
}

/**
 * Checks if value does not match ("!==") the comparison.
 *
 * @export
 * @param {*} comparison
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function NotEquals(comparison: any, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vNotEquals",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.notEquals(value, comparison);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter, ($property) must be not equals ${comparison}.`;
                }
            }
        });
    };
}

/**
 * Checks if the string contains the seed.
 *
 * @export
 * @param {string} seed
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function Contains(seed: string, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vContains",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.contains(value, seed);
                    // return typeof value === "string" && (value.indexOf(seed) > -1);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter, ($property) must be contains ${seed}.`;
                }
            }
        });
    };
}

/**
 * Checks if given value is in a array of allowed values.
 *
 * @export
 * @param {any[]} possibleValues
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsIn(possibleValues: any[], validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsIn",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isIn(value, possibleValues);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if given value not in a array of allowed values.
 *
 * @export
 * @param {any[]} possibleValues
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsNotIn(possibleValues: any[], validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsNotIn",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isNotIn(value, possibleValues);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if a given value is a real date.
 *
 * @export
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsDate(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsDate",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isDate(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the first number is greater than or equal to the min value.
 *
 * @export
 * @param {number} min
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function Min(min: number, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vMin",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.min(value, min);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the first number is less than or equal to the max value.
 *
 * @export
 * @param {number} max
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function Max(max: number, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vMax",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.max(value, max);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the string's length falls in a range. Note: this function takes into account surrogate pairs. If given value is not a string, then it returns false.
 *
 * @export
 * @param {number} min
 * @param {number} [max]
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function Length(min: number, max?: number, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vLength",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.length(value, min, max);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the string is an email. If given value is not a string, then it returns false.
 *
 * @export
 * @param {IsEmailOptions} [options]
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsEmail(options?: IsEmailOptions, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsEmail",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isEmail(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the string is an IP (version 4 or 6). If given value is not a string, then it returns false.
 *
 * @export
 * @param {number} [version]
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsIP(version?: number, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsIP",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isIP(value, version);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the string is a valid phone number.
 *
 * @export
 * @param {string} {string} region 2 characters uppercase country code (e.g. DE, US, CH).
 * If users must enter the intl. prefix (e.g. +41), then you may pass "ZZ" or null as region.
 * See [google-libphonenumber, metadata.js:countryCodeToRegionCodeMap on github]{@link https://github.com/ruimarinho/google-libphonenumber/blob/1e46138878cff479aafe2ce62175c6c49cb58720/src/metadata.js#L33}
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsPhoneNumber(region: string, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsPhoneNumber",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isPhoneNumber(value, region);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * Checks if the string is an url.
 *
 * @export
 * @param {IsURLOptions} [options]
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsUrl(options?: IsURLOptions, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsUrl",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isURL(value, options);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter ($property).`;
                }
            }
        });
    };
}

/**
 * check if the string is a hash of type algorithm. Algorithm is one of ['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128', 'tiger160', 'tiger192', 'crc32', 'crc32b']
 *
 * @export
 * @param {HashAlgorithm} algorithm
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsHash(algorithm: HashAlgorithm, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        setExpose(object, propertyName);

        registerDecorator({
            name: "vIsHash",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ValidatorCls.isHash(value, algorithm);
                },
                defaultMessage(args: ValidationArguments) {
                    return `invalid parameter, ($property) must be is an ${algorithm} Hash string.`;
                }
            }
        });
    };
}
