/**
 * 装饰器工厂 - 消除装饰器代码重复
 * @author richen
 */
import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { setExpose } from "./util";

/**
 * 验证函数类型定义
 */
export type ValidatorFunction = (value: any, ...args: any[]) => boolean;

/**
 * 装饰器选项
 */
export interface DecoratorOptions {
  name: string;
  validator: ValidatorFunction;
  defaultMessage?: string;
  requiresValue?: boolean;
}

/**
 * 创建验证装饰器的工厂函数
 * @param options 装饰器配置选项
 * @returns 装饰器工厂函数
 */
export function createValidationDecorator(options: DecoratorOptions) {
  const { name, validator, defaultMessage, requiresValue = false } = options;
  
  return function decoratorFactory(...args: any[]) {
    // 处理参数：最后一个参数是ValidationOptions，前面是验证函数的参数
    const validationOptions = args[args.length - 1] as ValidationOptions;
    const validatorArgs = requiresValue ? args.slice(0, -1) : [];
    
    return function propertyDecorator(object: Object, propertyName: string) {
      // 设置属性为可导出
      setExpose(object, propertyName);
      
      // 注册验证装饰器
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
 * 创建简单验证装饰器（不需要额外参数）
 * @param name 装饰器名称
 * @param validator 验证函数
 * @param defaultMessage 默认错误信息
 * @returns 装饰器函数
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
 * 创建带参数的验证装饰器
 * @param name 装饰器名称
 * @param validator 验证函数
 * @param defaultMessage 默认错误信息
 * @returns 装饰器工厂函数
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