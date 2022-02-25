/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-19 16:41:36
 */

import { ClassValidator, Gt, Contains, Expose, Valid, Gte } from "../src/index";
import assert from "assert";
import { FunctionValidator } from "../src/rule";

class TestClass {
    @Gte(3)
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

describe("koatty_validation", function () {

    it("FunctionValidator", () => {
        assert.ifError(FunctionValidator.IsNotEmpty("2", "参数不能为空"))
        try {
            FunctionValidator.IsNotEmpty("", "参数不能为空");
        } catch (error) {
            console.log(false);

        };

    })

    it("ClassValidator", () => {
        ClassValidator.valid(TestClass, {
            id: 3,
            name: '12',
            text: 'aaa',
            status: 2
        }).then(res => {
            assert.ok(res);
        }).catch(err => {
            assert.fail(err);
        })
    })
})