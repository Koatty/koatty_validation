/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-19 16:41:36
 */

import { ClassValidator, Gt, Contains, Expose, Valid, Gte, ValidationOptions, IsNotEmpty, IsMobile, IsCnName, IsEmail } from "../src/index";
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

    test("ClassValidator", () => {
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

    // Test DTO for returnAllErrors functionality
    class MultipleErrorsDTO {
        @IsNotEmpty({ message: "字段1不能为空" })
        field1: string;

        @IsMobile({ message: "手机号无效" })
        phone: string;

        @IsEmail({ message: "邮箱无效" })
        email: string;
    }

    // Test backward compatibility - should return only first error by default
    test("ClassValidator - Default behavior returns only first error", async () => {
        const testData = {
            field1: "",
            phone: "123",
            email: "invalid-email"
        };

        try {
            await ClassValidator.valid(MultipleErrorsDTO, testData, true);
            assert.fail("Should have thrown validation error");
        } catch (error: any) {
            // Default behavior: only first error
            assert.ok(error.message, "Error message should exist");
            // Should NOT contain other errors
            assert.ok(!error.message.includes("手机号") || error.message.indexOf("手机号") !== 0,
                "Should not contain phone error");
            assert.ok(!error.message.includes("邮箱") || error.message.indexOf("邮箱") !== 0,
                "Should not contain email error");
            console.log("✅ Default behavior: Only first error returned");
        }
    });

    // Test returnAllErrors option - should return all errors
    test("ClassValidator - returnAllErrors=true returns all errors", async () => {
        const testData = {
            field1: "",
            phone: "123",
            email: "invalid-email"
        };

        const options: ValidationOptions = {
            returnAllErrors: true,
            errorSeparator: '; '
        };

        try {
            await ClassValidator.valid(MultipleErrorsDTO, testData, true, options);
            assert.fail("Should have thrown validation error");
        } catch (error: any) {
            // Should have errors array
            assert.ok(error.errors, "Should have errors array");
            assert.strictEqual(error.errors.length, 3, "Should have 3 errors");

            // Message should contain all three errors
            assert.ok(error.message.includes("字段1"), "Should contain field1 error");
            assert.ok(error.message.includes("手机号"), "Should contain phone error");
            assert.ok(error.message.includes("邮箱"), "Should contain email error");

            console.log("✅ All errors returned:", error.message);
            console.log("Error details:", JSON.stringify(error.errors, null, 2));
        }
    });

    // Test custom error separator
    test("ClassValidator - Custom error separator works", async () => {
        const testData = {
            field1: "",
            phone: "123",
            email: "invalid-email"
        };

        const options: ValidationOptions = {
            returnAllErrors: true,
            errorSeparator: ' | '
        };

        try {
            await ClassValidator.valid(MultipleErrorsDTO, testData, true, options);
            assert.fail("Should have thrown validation error");
        } catch (error: any) {
            // Should use custom separator
            assert.ok(error.message.includes(' | '), "Should use custom separator");
            console.log("✅ Custom separator:", error.message);
        }
    });

    // Test single error with returnAllErrors=true
    test("ClassValidator - Single error with returnAllErrors=true", async () => {
        const testData = {
            field1: "test",  // Valid
            phone: "123",      // Only this is invalid
            email: "test@example.com"  // Valid
        };

        const options: ValidationOptions = {
            returnAllErrors: true
        };

        try {
            await ClassValidator.valid(MultipleErrorsDTO, testData, true, options);
            assert.fail("Should have thrown validation error");
        } catch (error: any) {
            // Should have only 1 error
            assert.strictEqual(error.errors.length, 1, "Should have 1 error");
            assert.ok(error.message.includes("手机号"), "Should contain phone error");
            console.log("✅ Single error handled correctly");
        }
    });
})