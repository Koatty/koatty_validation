/**
 * Validated Decorator Usage Example - Sync and Async Modes
 * @author richen
 */

import { Validated, checkValidated, IsNotEmpty, IsCnName, IsMobile } from '../src/index';

// DTO class definition
class UserDTO {
  @IsNotEmpty({ message: "Name cannot be empty" })
  @IsCnName({ message: "Name must be a valid Chinese name" })
  name: string;

  @IsMobile({ message: "Invalid phone number format" })
  phone: string;
}

/**
 * Example 1: Async Mode (Default, suitable for framework scenarios)
 * 
 * In the Koatty framework, controller method parameters are obtained asynchronously through requests.
 * When using async mode, the @Validated() decorator saves validation metadata,
 * and the framework's IOC container performs validation after asynchronously retrieving parameters.
 */
class AsyncController {
  /**
   * Async mode - Default behavior
   * Decorator saves metadata to IOCContainer, validation handled by framework
   */
  @Validated() // Equivalent to @Validated(true)
  async createUser(userData: UserDTO) {
    // Framework will automatically validate userData before calling this method
    return { success: true, data: userData };
  }

  /**
   * Explicitly specify async mode
   */
  @Validated(true)
  async updateUser(id: number, userData: UserDTO) {
    return { success: true, id, data: userData };
  }
}

/**
 * Example 2: Sync Mode (Suitable for non-framework scenarios or when parameters are ready)
 * 
 * If parameter values are already prepared (no need for async retrieval), you can use sync mode.
 * Sync mode performs validation immediately when the method is called.
 */
class SyncController {
  /**
   * Sync mode - Immediate validation
   * Decorator wraps the original method and performs validation on call
   */
  @Validated(false)
  async createUser(userData: UserDTO) {
    // Validation completed before method execution
    return { success: true, data: userData };
  }

  /**
   * Sync mode - Multiple parameters
   */
  @Validated(false)
  async updateUser(id: number, userData: UserDTO) {
    // Only validates class-type parameters (UserDTO), primitive types (number) are not validated
    return { success: true, id, data: userData };
  }
}

/**
 * Example 3: Manually using checkValidated function
 * 
 * If you need to manually perform validation in framework code, you can directly call the checkValidated function.
 * This is particularly useful in framework interceptors or middleware.
 */
async function manualValidationExample() {
  // Prepare parameters
  const userData = {
    name: 'Zhang San',
    phone: '13812345678'
  };

  // Get parameter types
  const paramTypes = [UserDTO];

  try {
    // Manually perform validation
    const { validatedArgs, validationTargets } = await checkValidated(
      [userData],
      paramTypes
    );

    console.log('Validation passed:', validationTargets);
    return validationTargets[0];
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}

/**
 * Example 4: Real-world application in Koatty framework
 * 
 * This is a typical Koatty controller example demonstrating how to use async validation mode.
 */
class KoattyUserController {
  /**
   * User registration endpoint
   * 
   * In Koatty framework:
   * 1. Framework receives HTTP request
   * 2. Framework parses request body asynchronously and constructs UserDTO instance
   * 3. Framework detects @Validated() metadata
   * 4. Framework calls checkValidated() to validate parameters
   * 5. Calls register method after validation passes
   */
  @Validated() // Async mode, handled by framework
  async register(user: UserDTO) {
    // User has been validated at this point
    console.log('Registering user:', user.name, user.phone);
    return {
      code: 0,
      message: 'Registration successful',
      data: { userId: 123 }
    };
  }

  /**
   * User update endpoint
   */
  @Validated()
  async update(id: number, user: UserDTO) {
    console.log('Updating user:', id, user.name);
    return {
      code: 0,
      message: 'Update successful'
    };
  }
}

/**
 * Example 5: Decision guide for choosing sync or async mode
 */
class DecisionGuideController {
  /**
   * Scenarios for using async mode:
   * 
   * ✅ In Koatty framework controllers (recommended)
   * ✅ Parameter values need to be obtained asynchronously (e.g., parsed from request body)
   * ✅ Validation handled uniformly by framework
   * ✅ Validation needs to be performed after parameters are ready
   */
  @Validated(true) // Or @Validated()
  async frameworkMethod(dto: UserDTO) {
    return { type: 'async' };
  }

  /**
   * Scenarios for using sync mode:
   * 
   * ✅ In unit tests
   * ✅ Parameter values are already prepared
   * ✅ Not running in a framework environment
   * ✅ Need immediate validation and error return
   */
  @Validated(false)
  async standaloneMethod(dto: UserDTO) {
    return { type: 'sync' };
  }
}

/**
 * Run examples
 */
async function runExamples() {
  console.log('=== Example 1: Async Mode ===');
  const asyncController = new AsyncController();
  // Note: In actual framework, validation is handled by framework
  // Here for demonstration, directly calling the method

  console.log('\n=== Example 2: Sync Mode ===');
  const syncController = new SyncController();
  try {
    const validUser = Object.assign(new UserDTO(), {
      name: 'Li Si',
      phone: '13912345678'
    });
    const result = await syncController.createUser(validUser);
    console.log('Sync validation passed:', result);
  } catch (error) {
    console.error('Sync validation failed:', error);
  }

  console.log('\n=== Example 3: Manual Validation ===');
  await manualValidationExample();

  console.log('\n=== Complete ===');
}

// If running this file directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export {
  AsyncController,
  SyncController,
  KoattyUserController,
  DecisionGuideController,
  manualValidationExample
};
