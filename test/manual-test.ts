/**
 * Manual test script to verify returnAllErrors functionality
 */

import { ClassValidator, ValidationOptions, IsNotEmpty, IsMobile, IsCnName, IsEmail } from "../src/index";

// Test DTO class
class TestDTO {
  @IsNotEmpty({ message: "手机号不能为空" })
  @IsMobile({ message: "手机号格式不正确" })
  phoneNum: string;

  @IsCnName({ message: "姓名必须是有效的中文姓名" })
  userName: string;

  @IsEmail({ message: "邮箱格式不正确" })
  email: string;
}

async function testDefaultBehavior() {
  console.log('\n=== Test 1: Default behavior (backward compatibility) ===');

  const testData = {
    phoneNum: "123",        // 无效手机号
    userName: "123",        // 无效姓名
    email: "invalid-email" // 无效邮箱
  };

  try {
    await ClassValidator.valid(TestDTO, testData, true);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Error thrown as expected');
    console.log('Message:', error.message);
    console.log('Type:', error.constructor.name);

    // Check it contains only first error
    if (error.message.includes('手机号') &&
        !error.message.includes('姓名') &&
        !error.message.includes('邮箱')) {
      console.log('✅ Default behavior: Only first error returned');
    } else {
      console.log('❌ Unexpected: Message may contain multiple errors');
    }
  }
}

async function testReturnAllErrors() {
  console.log('\n=== Test 2: returnAllErrors=true ===');

  const testData = {
    phoneNum: "123",
    userName: "123",
    email: "invalid-email"
  };

  const options: ValidationOptions = {
    returnAllErrors: true,
    errorSeparator: '; '
  };

  try {
    await ClassValidator.valid(TestDTO, testData, true, options);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Error thrown as expected');
    console.log('Message:', error.message);
    console.log('Type:', error.constructor.name);
    console.log('Errors:', JSON.stringify(error.errors, null, 2));

    // Check it contains all three errors
    const hasAllErrors =
      error.message.includes('手机号') &&
      error.message.includes('姓名') &&
      error.message.includes('邮箱');

    if (hasAllErrors && error.errors.length === 3) {
      console.log('✅ All errors returned correctly');
    } else {
      console.log('❌ Expected 3 errors, got:', error.errors.length);
    }
  }
}

async function testCustomSeparator() {
  console.log('\n=== Test 3: Custom error separator ===');

  const testData = {
    phoneNum: "123",
    userName: "123",
    email: "invalid-email"
  };

  const options: ValidationOptions = {
    returnAllErrors: true,
    errorSeparator: ' | '
  };

  try {
    await ClassValidator.valid(TestDTO, testData, true, options);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Error thrown as expected');
    console.log('Message:', error.message);

    // Check custom separator is used
    if (error.message.includes(' | ')) {
      console.log('✅ Custom separator applied correctly');
    } else {
      console.log('❌ Custom separator not found');
    }
  }
}

async function testSingleError() {
  console.log('\n=== Test 4: Single error with returnAllErrors=true ===');

  const testData = {
    phoneNum: "123",  // 只有这一个错误
    userName: "张三",    // 有效姓名
    email: "test@example.com"  // 有效邮箱
  };

  const options: ValidationOptions = {
    returnAllErrors: true
  };

  try {
    await ClassValidator.valid(TestDTO, testData, true, options);
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Error thrown as expected');
    console.log('Message:', error.message);
    console.log('Error count:', error.errors.length);

    if (error.errors.length === 1 && error.message.includes('手机号')) {
      console.log('✅ Single error handled correctly');
    } else {
      console.log('❌ Expected 1 error, got:', error.errors.length);
    }
  }
}

async function testValidData() {
  console.log('\n=== Test 5: Valid data with returnAllErrors=true ===');

  const testData = {
    phoneNum: "13812345678",    // 有效手机号
    userName: "张三",           // 有效姓名
    email: "test@example.com"    // 有效邮箱
  };

  const options: ValidationOptions = {
    returnAllErrors: true
  };

  try {
    const result = await ClassValidator.valid(TestDTO, testData, true, options);
    console.log('✅ Validation passed');
    console.log('Validated DTO:', result);

    if (result instanceof TestDTO) {
      console.log('✅ Returned correct DTO instance');
    } else {
      console.log('❌ Unexpected return type');
    }
  } catch (error) {
    console.log('❌ Should not have thrown error');
    console.log('Error:', error.message);
  }
}

async function runAllTests() {
  console.log('========================================');
  console.log('Testing returnAllErrors Functionality');
  console.log('========================================');

  await testDefaultBehavior();
  await testReturnAllErrors();
  await testCustomSeparator();
  await testSingleError();
  await testValidData();

  console.log('\n========================================');
  console.log('All tests completed');
  console.log('========================================');
}

runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
