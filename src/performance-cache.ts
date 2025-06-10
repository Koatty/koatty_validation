/**
 * 性能缓存模块 - 提供多层次缓存和性能监控
 * @author richen
 */
import { LRUCache } from 'lru-cache';

/**
 * 缓存配置选项
 */
interface CacheOptions {
  max?: number;
  ttl?: number;
  allowStale?: boolean;
  updateAgeOnGet?: boolean;
}

/**
 * 元数据缓存
 */
class MetadataCache {
  private static instance: MetadataCache;
  private cache = new WeakMap<Function, Map<string, any>>();

  static getInstance(): MetadataCache {
    if (!MetadataCache.instance) {
      MetadataCache.instance = new MetadataCache();
    }
    return MetadataCache.instance;
  }

  /**
   * 获取类的元数据缓存
   */
  getClassCache(target: Function): Map<string, any> {
    if (!this.cache.has(target)) {
      this.cache.set(target, new Map());
    }
    return this.cache.get(target)!;
  }

  /**
   * 缓存元数据
   */
  setMetadata(target: Function, key: string, value: any): void {
    const classCache = this.getClassCache(target);
    classCache.set(key, value);
  }

  /**
   * 获取缓存的元数据
   */
  getMetadata(target: Function, key: string): any {
    const classCache = this.getClassCache(target);
    return classCache.get(key);
  }

  /**
   * 检查是否已缓存
   */
  hasMetadata(target: Function, key: string): boolean {
    const classCache = this.getClassCache(target);
    return classCache.has(key);
  }

  /**
   * 清空指定类的缓存
   */
  clearClassCache(target: Function): void {
    if (this.cache.has(target)) {
      this.cache.delete(target);
    }
  }
}

/**
 * 验证结果缓存
 */
class ValidationCache {
  private static instance: ValidationCache;
  private cache: LRUCache<string, boolean>;

  constructor(options?: CacheOptions) {
    this.cache = new LRUCache<string, boolean>({
      max: options?.max || 5000,
      ttl: options?.ttl || 1000 * 60 * 10, // 10分钟
      allowStale: options?.allowStale || false,
      updateAgeOnGet: options?.updateAgeOnGet || true,
    });
  }

  static getInstance(options?: CacheOptions): ValidationCache {
    if (!ValidationCache.instance) {
      ValidationCache.instance = new ValidationCache(options);
    }
    return ValidationCache.instance;
  }

  /**
   * 生成缓存键
   */
  private generateKey(validator: string, value: any, ...args: any[]): string {
    const valueStr = this.serializeValue(value);
    const argsStr = args.length > 0 ? JSON.stringify(args) : '';
    return `${validator}:${valueStr}:${argsStr}`;
  }

  /**
   * 序列化值用于缓存键
   */
  private serializeValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `s:${value}`;
    if (typeof value === 'number') return `n:${value}`;
    if (typeof value === 'boolean') return `b:${value}`;
    if (Array.isArray(value)) return `a:${JSON.stringify(value)}`;
    if (typeof value === 'object') return `o:${JSON.stringify(value)}`;
    return String(value);
  }

  /**
   * 获取缓存的验证结果
   */
  get(validator: string, value: any, ...args: any[]): boolean | undefined {
    const key = this.generateKey(validator, value, ...args);
    return this.cache.get(key);
  }

  /**
   * 缓存验证结果
   */
  set(validator: string, value: any, result: boolean, ...args: any[]): void {
    const key = this.generateKey(validator, value, ...args);
    this.cache.set(key, result);
  }

  /**
   * 检查是否存在缓存
   */
  has(validator: string, value: any, ...args: any[]): boolean {
    const key = this.generateKey(validator, value, ...args);
    return this.cache.has(key);
  }

  /**
   * 删除特定缓存
   */
  delete(validator: string, value: any, ...args: any[]): boolean {
    const key = this.generateKey(validator, value, ...args);
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    size: number;
    max: number;
    calculatedSize: number;
    keyCount: number;
  } {
    return {
      size: this.cache.size,
      max: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
      keyCount: this.cache.size,
    };
  }

  /**
   * 设置缓存TTL
   */
  setTTL(validator: string, value: any, ttl: number, ...args: any[]): void {
    const key = this.generateKey(validator, value, ...args);
    const existingValue = this.cache.get(key);
    if (existingValue !== undefined) {
      this.cache.set(key, existingValue, { ttl });
    }
  }
}

/**
 * 正则表达式缓存
 */
class RegexCache {
  private static instance: RegexCache;
  private cache: LRUCache<string, RegExp>;

  constructor(options?: CacheOptions) {
    this.cache = new LRUCache({
      max: options?.max || 200,
      ttl: options?.ttl || 1000 * 60 * 30, // 30分钟
      allowStale: options?.allowStale || false,
      updateAgeOnGet: options?.updateAgeOnGet || true,
    });
  }

  static getInstance(options?: CacheOptions): RegexCache {
    if (!RegexCache.instance) {
      RegexCache.instance = new RegexCache(options);
    }
    return RegexCache.instance;
  }

  /**
   * 获取缓存的正则表达式
   */
  get(pattern: string, flags?: string): RegExp {
    const key = flags ? `${pattern}:::${flags}` : pattern;
    let regex = this.cache.get(key);
    
    if (!regex) {
      try {
        regex = new RegExp(pattern, flags);
        this.cache.set(key, regex);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // 如果正则表达式无效，抛出错误
        throw new Error(`Invalid regex pattern: ${pattern}`);
      }
    }
    
    return regex;
  }

  /**
   * 预编译常用正则表达式
   */
  precompile(patterns: Array<{ pattern: string; flags?: string }>): void {
    patterns.forEach(({ pattern, flags }) => {
      try {
        this.get(pattern, flags);
      } catch (error) {
        console.warn(`Failed to precompile regex: ${pattern}`, error);
      }
    });
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      calculatedSize: this.cache.calculatedSize,
    };
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * 性能监控
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
    lastExecutionTime: Date;
  }>();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 开始计时
   */
  startTimer(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }

  /**
   * 记录性能指标
   */
  private recordMetric(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        maxTime: 0,
        minTime: Infinity,
        lastExecutionTime: new Date(),
      });
    }

    const metric = this.metrics.get(name)!;
    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.minTime = Math.min(metric.minTime, duration);
    metric.lastExecutionTime = new Date();
  }

  /**
   * 获取性能报告
   */
  getReport(): Record<string, any> {
    const report: Record<string, any> = {};
    
    for (const [name, metric] of this.metrics) {
      report[name] = {
        ...metric,
        minTime: metric.minTime === Infinity ? 0 : metric.minTime,
        avgTimeFormatted: `${metric.avgTime.toFixed(2)}ms`,
        totalTimeFormatted: `${metric.totalTime.toFixed(2)}ms`,
      };
    }
    
    return report;
  }

  /**
   * 获取热点分析（执行时间最长的操作）
   */
  getHotspots(limit: number = 10): Array<{ name: string; avgTime: number; count: number }> {
    return Array.from(this.metrics.entries())
      .map(([name, metric]) => ({
        name,
        avgTime: metric.avgTime,
        count: metric.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  /**
   * 清空指标
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * 导出性能数据为CSV格式
   */
  exportToCSV(): string {
    const headers = ['Name', 'Count', 'Total Time (ms)', 'Avg Time (ms)', 'Max Time (ms)', 'Min Time (ms)', 'Last Execution'];
    const rows = [headers.join(',')];
    
    for (const [name, metric] of this.metrics) {
      const row = [
        name,
        metric.count.toString(),
        metric.totalTime.toFixed(2),
        metric.avgTime.toFixed(2),
        metric.maxTime.toFixed(2),
        (metric.minTime === Infinity ? 0 : metric.minTime).toFixed(2),
        metric.lastExecutionTime.toISOString(),
      ];
      rows.push(row.join(','));
    }
    
    return rows.join('\n');
  }
}

// 导出单例实例
export const metadataCache = MetadataCache.getInstance();
export const validationCache = ValidationCache.getInstance();
export const regexCache = RegexCache.getInstance();
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * 缓存装饰器 - 用于缓存验证函数结果
 */
export function cached(validator: string, ttl?: number) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const value = args[0];
      const additionalArgs = args.slice(1);
      
      // 尝试从缓存获取结果
      const cachedResult = validationCache.get(validator, value, ...additionalArgs);
      if (cachedResult !== undefined) {
        return cachedResult;
      }
      
      // 执行验证并缓存结果
      const endTimer = performanceMonitor.startTimer(validator);
      try {
        const result = originalMethod.apply(this, args);
        validationCache.set(validator, value, result, ...additionalArgs);
        
        // 如果指定了TTL，设置过期时间
        if (ttl && ttl > 0) {
          validationCache.setTTL(validator, value, ttl, ...additionalArgs);
        }
        
        return result;
      } finally {
        endTimer();
      }
    };
    
    return descriptor;
  };
}

/**
 * 获取所有缓存统计信息
 */
export function getAllCacheStats() {
  return {
    validation: validationCache.getStats(),
    regex: regexCache.getStats(),
    performance: performanceMonitor.getReport(),
    hotspots: performanceMonitor.getHotspots(),
  };
}

/**
 * 预热缓存 - 预编译常用正则表达式
 */
export function warmupCaches(): void {
  // 预编译中文验证相关的正则表达式
  const commonPatterns = [
    { pattern: '^[\u4e00-\u9fa5]{2,8}$' }, // 中文姓名
    { pattern: '^1[3-9]\\d{9}$' },         // 手机号
    { pattern: '^\\d{6}$' },               // 邮政编码
    { pattern: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]' }, // 车牌号开头
  ];
  
  regexCache.precompile(commonPatterns);
}

/**
 * 清空所有缓存
 */
export function clearAllCaches(): void {
  validationCache.clear();
  regexCache.clear();
  performanceMonitor.clear();
}

/**
 * 配置缓存设置
 */
export function configureCaches(options: {
  validation?: CacheOptions;
  regex?: CacheOptions;
}): void {
  if (options.validation) {
    // 重新创建验证缓存实例
    (ValidationCache as any).instance = new ValidationCache(options.validation);
  }
  
  if (options.regex) {
    // 重新创建正则缓存实例
    (RegexCache as any).instance = new RegexCache(options.regex);
  }
}

// 导出类型定义
export type { CacheOptions }; 