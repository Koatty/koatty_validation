/**
 * Decorator Factory - Eliminate decorator code duplication
 * @author richen
 */
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { setExpose } from "./util";

/**
 * Validator function type definition
 */
export type ValidatorFunction = (value: any, ...args: any[]) => boolean;

/**
 * Decorator options
 */
export interface DecoratorOptions {
  name: string;
  validator: ValidatorFunction;
  defaultMessage?: string;
  requiresValue?: boolean;
}

/**
 * Factory function to create validation decorators
 * @param options Decorator configuration options
 * @returns Decorator factory function
 */
export function createValidationDecorator(options: DecoratorOptions) {
  const { name, validator, defaultMessage, requiresValue = false } = options;
  
  return function decoratorFactory(...args: any[]) {
    // Handle parameters: last parameter is ValidationOptions, previous ones are validator function parameters
    const validationOptions = args[args.length - 1] as ValidationOptions;
    const validatorArgs = requiresValue ? args.slice(0, -1) : [];
    
    return function propertyDecorator(object: Object, propertyName: string) {
      // Set property as exportable
      setExpose(object, propertyName);
      
      // Register validation decorator
      registerDecorator({
        name,
        target: object.constructor,
        propertyName,
        options: validationOptions,
        constraints: validatorArgs,
        validator: {
          validate(value: any) {
            try {
              return validator(value, ...validatorArgs);
            } catch {
              return false;
            }
          },
          defaultMessage(validationArguments: ValidationArguments) {
            const property = validationArguments.property;
            return defaultMessage 
              ? defaultMessage.replace('$property', property)
              : `Invalid value for ${property}`;
          }
        }
      });
    };
  };
}

/**
 * Create simple validation decorator (no additional parameters required)
 * @param name Decorator name
 * @param validator Validation function
 * @param defaultMessage Default error message
 * @returns Decorator function
 */
export function createSimpleDecorator(
  name: string, 
  validator: ValidatorFunction, 
  defaultMessage?: string
) {
  return createValidationDecorator({
    name,
    validator,
    defaultMessage,
    requiresValue: false
  });
}

/**
 * Create parameterized validation decorator
 * @param name Decorator name
 * @param validator Validation function
 * @param defaultMessage Default error message
 * @returns Decorator factory function
 */
export function createParameterizedDecorator(
  name: string,
  validator: ValidatorFunction,
  defaultMessage?: string
) {
  return createValidationDecorator({
    name,
    validator,
    defaultMessage,
    requiresValue: true
  });
} 