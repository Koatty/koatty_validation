/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-09 17:26:25
 */
// tslint:disable-next-line: no-import-side-effect
import "reflect-metadata";
import helper from "think_lib";
import { ValidatorCls, ValidRules, ClassValidator, ValidatorFuncs } from "./ValidateUtil";
import { cnname, idnumber, zipcode, mobile, platenumber, getOriginMetadata, recursiveGetMetadata, defineNewProperty, PARAM_TYPE_KEY, PARAM_RULE_KEY } from "./Lib";
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

// export checkParamsType
export { checkParamsType } from "./Lib";
export { ClassValidator, FunctionValidator } from "./ValidateUtil";
// export decorators of class-validator
export { IsDefined } from "class-validator";

/**
 * Validtion paramer's type and values from DTO class.
 *
 * @export
 * @returns {MethodDecorator}
 */
export function Validated(): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        // 获取成员参数类型
        const paramtypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        const { value, configurable, enumerable } = descriptor;
        descriptor = {
            configurable,
            enumerable,
            writable: true,
            value: async function valid(...props: any[]) {
                const ps: any[] = [];
                // tslint:disable-next-line: no-unused-expression
                props.map && props.map((value: any, index: number) => {
                    if (helper.isObject(value) && helper.isClass(paramtypes[index])) {
                        ps.push(ClassValidator.valid(paramtypes[index], value));
                    }
                });
                if (ps.length > 0) {
                    await Promise.all(ps);
                }
                // tslint:disable-next-line: no-invalid-this
                return value.apply(this, props);
            }
        };
        return descriptor;
    };

}

/**
 * Validtion paramer's type and values.
 *
 * @export
 * @param {(ValidRules | ValidRules[] | Function)} rule
 * @param {string} [message]
 * @returns {ParameterDecorator}
 */
export function Valid(rule: ValidRules | ValidRules[] | Function, message?: string): ParameterDecorator {
    let rules: any = [];
    if (helper.isString(rule)) {
        rules = (<string>rule).split(",");
    } else {
        rules = rule;
    }
    return (target: any, propertyKey: string, descriptor: any) => {
        // 获取成员参数类型
        const paramtypes = Reflect.getMetadata("design:paramtypes", target, propertyKey);

        const originMap = getOriginMetadata(PARAM_RULE_KEY, target, propertyKey);
        originMap.set(descriptor, {
            type: paramtypes[descriptor] && paramtypes[descriptor].name ? paramtypes[descriptor].name : "",
            rule: rules,
            message
        });
    };
}

/**
 *
 *
 * @export
 * @param {*} target
 * @param {string} propertyKey
 */
export function validParamter(target: any, propertyKey: string) {
    const vaildMetaDatas = recursiveGetMetadata(PARAM_RULE_KEY, target, propertyKey);
    defineNewProperty(target, propertyKey, function (props: any[]) {
        // tslint:disable-next-line: forin
        for (const n in vaildMetaDatas) {
            if (vaildMetaDatas[n].type && vaildMetaDatas[n].rule) {
                ValidatorFuncs(n, props[n], vaildMetaDatas[n].type, vaildMetaDatas[n].rule, vaildMetaDatas[n].message);
            }
        }
        return props;
    });
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
 * Checks if value is a chinese name.
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsCnName(validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return "The ($property) must be an chinese name!";
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return "The ($property) must be an idcard number!";
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return "The ($property) must be an zip code!";
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return "The ($property) must be an mobile number!";
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return "The ($property) must be an plate number!";
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return "The ($property)'s value must be not empty!";
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be equals ${comparison}!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be not equals ${comparison}!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be contains ${seed}!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be in possibleValues!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be not in possibleValues!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be a real date!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be greater than or equal to the min value!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) must be less than or equal to the max value!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            if (types.name !== "String") {
                throw Error('The Length decorator is only used for string type parameters.');
            }
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) string's length must be falls in a range!`;
                }
            }
        });
    };
}

/**
 * Checks if the string is an email. If given value is not a string, then it returns false.
 *
 * @export
 * @param {ValidatorJS.IsEmailOptions} [options]
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsEmail(options?: ValidatorJS.IsEmailOptions, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) string must be is an email!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) string must be is an IP!`;
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
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) string must be is a valid phone number!`;
                }
            }
        });
    };
}

/**
 * Checks if the string is an url.
 *
 * @export
 * @param {ValidatorJS.IsURLOptions} [options]
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsUrl(options?: ValidatorJS.IsURLOptions, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) string must be is an url!`;
                }
            }
        });
    };
}

/**
 * check if the string is a hash of type algorithm. Algorithm is one of ['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128', 'tiger160', 'tiger192', 'crc32', 'crc32b']
 *
 * @export
 * @param {ValidatorJS.HashAlgorithm} algorithm
 * @param {ValidationOptions} [validationOptions]
 * @returns {PropertyDecorator}
 */
export function IsHash(algorithm: ValidatorJS.HashAlgorithm, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: Object, propertyName: string) {
        const types = Reflect.getMetadata("design:type", object, propertyName);
        if (types) {
            const originMap = getOriginMetadata(PARAM_TYPE_KEY, object);
            originMap.set(propertyName, types.name);
        }

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
                    return `The ($property) string must be is an ${algorithm} Hash string!`;
                }
            }
        });
    };
}
