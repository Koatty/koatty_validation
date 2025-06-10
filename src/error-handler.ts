/**
 * 改进的错误处理机制
 * @author richen
 */

/**
 * 支持的语言
 */
export type SupportedLanguage = 'zh' | 'en';

/**
 * 错误信息国际化
 */
export const ERROR_MESSAGES = {
  zh: {
    // 中国本土化验证
    IsCnName: '必须是有效的中文姓名',
    IsIdNumber: '必须是有效的身份证号码',
    IsZipCode: '必须是有效的邮政编码',
    IsMobile: '必须是有效的手机号码',
    IsPlateNumber: '必须是有效的车牌号码',
    
    // 基础验证
    IsNotEmpty: '不能为空',
    IsDate: '必须是有效的日期',
    IsEmail: '必须是有效的邮箱地址',
    IsIP: '必须是有效的IP地址',
    IsPhoneNumber: '必须是有效的电话号码',
    IsUrl: '必须是有效的URL地址',
    IsHash: '必须是有效的哈希值',
    
    // 比较验证
    Equals: '必须等于 {comparison}',
    NotEquals: '不能等于 {comparison}',
    Contains: '必须包含 {seed}',
    IsIn: '必须是以下值之一: {possibleValues}',
    IsNotIn: '不能是以下值之一: {possibleValues}',
    Gt: '必须大于 {min}',
    Gte: '必须大于或等于 {min}',
    Lt: '必须小于 {max}',
    Lte: '必须小于或等于 {max}',
    
    // 通用错误
    invalidParameter: '参数 {field} 无效',
    validationFailed: '验证失败',
  },
  en: {
    // Chinese localization validators
    IsCnName: 'must be a valid Chinese name',
    IsIdNumber: 'must be a valid ID number',
    IsZipCode: 'must be a valid zip code',
    IsMobile: 'must be a valid mobile number',
    IsPlateNumber: 'must be a valid plate number',
    
    // Basic validators
    IsNotEmpty: 'should not be empty',
    IsDate: 'must be a valid date',
    IsEmail: 'must be a valid email',
    IsIP: 'must be a valid IP address',
    IsPhoneNumber: 'must be a valid phone number',
    IsUrl: 'must be a valid URL',
    IsHash: 'must be a valid hash',
    
    // Comparison validators
    Equals: 'must equal to {comparison}',
    NotEquals: 'should not equal to {comparison}',
    Contains: 'must contain {seed}',
    IsIn: 'must be one of the following values: {possibleValues}',
    IsNotIn: 'should not be one of the following values: {possibleValues}',
    Gt: 'must be greater than {min}',
    Gte: 'must be greater than or equal to {min}',
    Lt: 'must be less than {max}',
    Lte: 'must be less than or equal to {max}',
    
    // Common errors
    invalidParameter: 'invalid parameter {field}',
    validationFailed: 'validation failed',
  }
} as const;

/**
 * 验证错误详情
 */
export interface ValidationErrorDetail {
  field: string;
  value: any;
  constraint: string;
  message: string;
  context?: Record<string, any>;
}

/**
 * 增强的验证错误类
 */
export class KoattyValidationError extends Error {
  public readonly errors: ValidationErrorDetail[];
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(errors: ValidationErrorDetail[], message?: string) {
    const errorMessage = message || 'Validation failed';
    super(errorMessage);
    
    this.name = 'KoattyValidationError';
    this.errors = errors;
    this.statusCode = 400;
    this.timestamp = new Date();
    
    // 确保正确的原型链
    Object.setPrototypeOf(this, KoattyValidationError.prototype);
  }

  /**
   * 获取第一个错误信息
   */
  public getFirstError(): ValidationErrorDetail | undefined {
    return this.errors[0];
  }

  /**
   * 获取指定字段的错误
   */
  public getFieldErrors(field: string): ValidationErrorDetail[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * 转换为JSON格式
   */
  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      errors: this.errors
    };
  }
}

/**
 * 错误信息格式化器
 */
export class ErrorMessageFormatter {
  private language: SupportedLanguage = 'zh';

  constructor(language: SupportedLanguage = 'zh') {
    this.language = language;
  }

  /**
   * 设置语言
   */
  public setLanguage(language: SupportedLanguage): void {
    this.language = language;
  }

  /**
   * 格式化错误消息
   */
  public formatMessage(constraint: string, field: string, value?: any, context?: Record<string, any>): string {
    const messages = ERROR_MESSAGES[this.language];
    let template: string = (messages as any)[constraint] || messages.invalidParameter;
    
    // 替换占位符
    template = template.replace('{field}', field);
    
    // 优先使用上下文中的值，然后是传入的value
    if (context) {
      Object.entries(context).forEach(([key, val]) => {
        template = template.replace(`{${key}}`, this.formatValue(val));
      });
    }
    
    // 如果还有{value}占位符且传入了value，则替换
    if (value !== undefined && template.includes('{value}')) {
      template = template.replace('{value}', this.formatValue(value));
    }
    
    return template;
  }

  /**
   * 格式化值用于消息显示
   * @private
   */
  private formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return `"${value}"`;
    if (Array.isArray(value)) return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        // 处理循环引用
        return '[Circular Reference]';
      }
    }
    return String(value);
  }
}

/**
 * 全局错误信息格式化器实例
 */
export const errorFormatter = new ErrorMessageFormatter();

/**
 * 设置全局语言
 */
export function setValidationLanguage(language: SupportedLanguage): void {
  errorFormatter.setLanguage(language);
}

/**
 * 创建验证错误
 */
export function createValidationError(
  field: string,
  value: any,
  constraint: string,
  customMessage?: string,
  context?: Record<string, any>
): ValidationErrorDetail {
  const message = customMessage || errorFormatter.formatMessage(constraint, field, value, context);
  
  return {
    field,
    value,
    constraint,
    message,
    context
  };
}

/**
 * 批量创建验证错误
 */
export function createValidationErrors(
  errors: Array<{
    field: string;
    value: any;
    constraint: string;
    message?: string;
    context?: Record<string, any>;
  }>
): KoattyValidationError {
  const validationErrors = errors.map(error => 
    createValidationError(
      error.field,
      error.value,
      error.constraint,
      error.message,
      error.context
    )
  );
  
  return new KoattyValidationError(validationErrors);
} 