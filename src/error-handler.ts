/**
 * Improved error handling mechanism
 * @author richen
 */

/**
 * Supported languages
 */
export type SupportedLanguage = 'zh' | 'en';

/**
 * Error message internationalization
 */
export const ERROR_MESSAGES = {
  zh: {
    // Chinese localization validation
    IsCnName: '必须是有效的中文姓名',
    IsIdNumber: '必须是有效的身份证号码',
    IsZipCode: '必须是有效的邮政编码',
    IsMobile: '必须是有效的手机号码',
    IsPlateNumber: '必须是有效的车牌号码',
    
    // Basic validation
    IsNotEmpty: '不能为空',
    IsDate: '必须是有效的日期',
    IsEmail: '必须是有效的邮箱地址',
    IsIP: '必须是有效的IP地址',
    IsPhoneNumber: '必须是有效的电话号码',
    IsUrl: '必须是有效的URL地址',
    IsHash: '必须是有效的哈希值',
    
    // Comparison validation
    Equals: '必须等于 {comparison}',
    NotEquals: '不能等于 {comparison}',
    Contains: '必须包含 {seed}',
    IsIn: '必须是以下值之一: {possibleValues}',
    IsNotIn: '不能是以下值之一: {possibleValues}',
    Gt: '必须大于 {min}',
    Gte: '必须大于或等于 {min}',
    Lt: '必须小于 {max}',
    Lte: '必须小于或等于 {max}',
    
    // Common errors
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
 * Validation error details
 */
export interface ValidationErrorDetail {
  field: string;
  value: any;
  constraint: string;
  message: string;
  context?: Record<string, any>;
}

/**
 * Enhanced validation error class
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
    
    // Ensure correct prototype chain
    Object.setPrototypeOf(this, KoattyValidationError.prototype);
  }

  /**
   * Get the first error message
   */
  public getFirstError(): ValidationErrorDetail | undefined {
    return this.errors[0];
  }

  /**
   * Get errors for a specific field
   */
  public getFieldErrors(field: string): ValidationErrorDetail[] {
    return this.errors.filter(error => error.field === field);
  }

  /**
   * Convert to JSON format
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
 * Error message formatter
 */
export class ErrorMessageFormatter {
  private language: SupportedLanguage = 'zh';

  constructor(language: SupportedLanguage = 'zh') {
    this.language = language;
  }

  /**
   * Set language
   */
  public setLanguage(language: SupportedLanguage): void {
    this.language = language;
  }

  /**
   * Format error message
   */
  public formatMessage(constraint: string, field: string, value?: any, context?: Record<string, any>): string {
    const messages = ERROR_MESSAGES[this.language];
    let template: string = (messages as any)[constraint] || messages.invalidParameter;
    
    // Replace placeholders
    template = template.replace('{field}', field);
    
    // Prioritize values from context, then use passed value
    if (context) {
      Object.entries(context).forEach(([key, val]) => {
        template = template.replace(`{${key}}`, this.formatValue(val));
      });
    }
    
    // If there's still a {value} placeholder and value was passed, replace it
    if (value !== undefined && template.includes('{value}')) {
      template = template.replace('{value}', this.formatValue(value));
    }
    
    return template;
  }

  /**
   * Format value for message display
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
        // Handle circular references
        return '[Circular Reference]';
      }
    }
    return String(value);
  }
}

/**
 * Global error message formatter instance
 */
export const errorFormatter = new ErrorMessageFormatter();

/**
 * Set global language
 */
export function setValidationLanguage(language: SupportedLanguage): void {
  errorFormatter.setLanguage(language);
}

/**
 * Create validation error
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
 * Create validation errors in batch
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