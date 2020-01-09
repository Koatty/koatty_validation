/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-09 16:53:37
 */

import { IsMobile, IsCnName, ClassValidator, IsNotEmpty, IsIn, IsNotIn, IsHash, IsUrl, IsPhoneNumber, IsIP, IsEmail, Min, Max, IsDate, Contains, NotEquals, Equals, FunctionValidator, Expose, Valid, validParamter } from "../src/index";

class TestClass {
    @Min(3)
    id: number;

    @Contains("12")
    name: string;

    @Expose()
    text: string;

    test(@Valid(["IsNotEmpty"], "参数aa不正确") aa: string, @Valid("IsNotEmpty") bb: string) {
        console.log('TestClass.test');
        return bb;
    }
}

// ClassValidator.valid(TestClass, {
//     id: 3,
//     name: '2',
//     text: 'aaa'
// }).catch(err => {
//     console.log(err);
// })

// console.log(FunctionValidator.Contains(2, '3'));

const testCls = new TestClass();
validParamter(TestClass, "test");

testCls.test('555555', '');