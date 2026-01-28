#!/usr/bin/env node

/**
 * Simple Node.js test to verify returnAllErrors functionality without Jest
 */

const assert = require('assert');

// Load built module
const { ClassValidator, ValidationOptions, IsNotEmpty, IsMobile, IsEmail } = require('./dist/index.js');

// Test DTO (plain JS object with validation metadata)
class MultipleErrorsDTO {
    constructor(data) {
        this.field1 = data.field1;
        this.phone = data.phone;
        this.email = data.email;
    }
}

// Add metadata for validation
require('reflect-metadata');

async function test1() {
    console.log('\n=== Test 1: Default behavior (backward compatibility) ===');

    const testData = {
        field1: "",
        phone: "123",
        email: "invalid-email"
    };

    try {
        await ClassValidator.valid(MultipleErrorsDTO, testData, true);
        console.log('❌ Should have thrown error');
        process.exit(1);
    } catch (error) {
        console.log('✅ Error thrown as expected');
        console.log('Message:', error.message);

        // Default behavior: only first error
        const hasOnlyFirstError = error.message.includes('field1') &&
            !error.message.includes('phone') &&
            !error.message.includes('email');

        if (hasOnlyFirstError) {
            console.log('✅ Default behavior verified');
        } else {
            console.log('❌ Unexpected: Message may contain multiple errors');
            process.exit(1);
        }
    }
}

async function test2() {
    console.log('\n=== Test 2: returnAllErrors=true ===');

    const testData = {
        field1: "",
        phone: "123",
        email: "invalid-email"
    };

    const options = {
        returnAllErrors: true,
        errorSeparator: '; '
    };

    try {
        await ClassValidator.valid(MultipleErrorsDTO, testData, true, options);
        console.log('❌ Should have thrown error');
        process.exit(1);
    } catch (error) {
        console.log('✅ Error thrown as expected');
        console.log('Message:', error.message);

        // Check it contains all errors
        const hasAllErrors = error.message.includes('field1') &&
            error.message.includes('phone') &&
            error.message.includes('email') &&
            error.errors &&
            error.errors.length === 3;

        if (hasAllErrors) {
            console.log('✅ All errors returned correctly');
            console.log('Error details:', JSON.stringify(error.errors, null, 2));
        } else {
            console.log('❌ Expected 3 errors');
            console.log('Errors:', error.errors);
            process.exit(1);
        }
    }
}

async function test3() {
    console.log('\n=== Test 3: Custom separator ===');

    const testData = {
        field1: "",
        phone: "123",
        email: "invalid-email"
    };

    const options = {
        returnAllErrors: true,
        errorSeparator: ' | '
    };

    try {
        await ClassValidator.valid(MultipleErrorsDTO, testData, true, options);
        console.log('❌ Should have thrown error');
        process.exit(1);
    } catch (error) {
        console.log('✅ Error thrown as expected');
        console.log('Message:', error.message);

        if (error.message.includes(' | ')) {
            console.log('✅ Custom separator applied');
        } else {
            console.log('❌ Custom separator not found');
            process.exit(1);
        }
    }
}

async function runAllTests() {
    console.log('========================================');
    console.log('Testing returnAllErrors Functionality');
    console.log('========================================');

    try {
        await test1();
        await test2();
        await test3();

        console.log('\n========================================');
        console.log('✅ All tests passed successfully!');
        console.log('========================================');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

runAllTests();
