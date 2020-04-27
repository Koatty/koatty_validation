/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-20 11:31:09
 */

// export for manual verification
export { checkParamsType, convertParamsType, paramterTypes, plainToClass } from "./lib";
export {
    setExpose, ClassValidator, FunctionValidator, Expose, ValidRules, ValidatorFuncs,
    IsDefined, IsCnName, IsIdNumber, IsZipCode, IsMobile, IsPlateNumber, IsEmail, IsIP, IsPhoneNumber, IsUrl, IsHash, IsNotEmpty, Equals, NotEquals, Contains, IsIn, IsNotIn, IsDate,
    Min, Max, Length
} from "./util";
// export decorators from class-validator
// export { IsHash } from "class-validator";
