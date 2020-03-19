/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-19 16:41:36
 */

import { IsMobile, IsCnName, ClassValidator, IsNotEmpty, IsIn, IsNotIn, IsHash, IsUrl, IsPhoneNumber, IsIP, IsEmail, Min, Max, IsDate, Contains, NotEquals, Equals, FunctionValidator, Expose, Valid, validParamter } from "../src/index";
import { plainToClass } from "../src/lib";

class TestClass {
    @Min(3)
    id: number;

    @Contains("12")
    name: string;

    @Expose()
    text: string;

    @Expose()
    status = 1;

    test(@Valid(["IsNotEmpty"], "参数aa不正确") aa: string, @Valid("IsNotEmpty") bb: string) {
        console.log('TestClass.test');
        return bb;
    }
}

const ins = plainToClass(TestClass, {
    id: 3,
    name: '12',
    text: 'aaa',
    status: 2
}, true);

console.log({
    id: 3,
    name: '12',
    text: 'aaa',
    status: 2
} instanceof TestClass);

ClassValidator.valid(TestClass, {
    id: 3,
    name: '12',
    text: 'aaa',
    status: 2
}).catch(err => {
    console.log(err);
})

// console.log(FunctionValidator.Contains(2, '3'));