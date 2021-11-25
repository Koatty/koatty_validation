/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-19 16:41:36
 */

import { ClassValidator, Min, Contains, Expose, Valid } from "../src/index";
import assert from "assert";

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

describe("koatty_validation", function () {
    it("ClassValidator", function () {
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