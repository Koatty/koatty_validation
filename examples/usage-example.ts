/**
 * 使用示例 - 展示优化后的验证模块功能
 * @author richen
 */

// 1. 使用重构后的装饰器
import { 
  IsCnName, IsIdNumber, IsMobile, IsNotEmpty, 
  Gt, Contains, IsEmail 
} from '../src/decorators-refactored';

// 2. 使用错误处理机制
import { 
  setValidationLanguage, 
  KoattyValidationError,
  createValidationErrors 
} from '../src/error-handler';

// 3. 使用性能缓存
import { 
  getAllCacheStats, 
  warmupCaches, 
  configureCaches,
  performanceMonitor 
} from '../src/performance-cache';

// 4. 使用原有的验证功能
import { ClassValidator } from '../src/rule';
import { Valid, Validated } from '../src/decorators';

/**
 * 用户DTO示例 - 使用重构后的装饰器
 */
export class UserDTO {
  @IsNotEmpty({ message: "用户名不能为空" })
  @IsCnName({ message: "必须是有效的中文姓名" })
  name: string;

  @IsIdNumber({ message: "身份证号码格式不正确" })
  idNumber: string = "110101199001011237";

  @IsMobile({ message: "手机号格式不正确" })
  phone: string;

  @IsEmail({}, { message: "邮箱格式不正确" })
  email: string;

  @Gt(0, { message: "年龄必须大于0" })
  age: number;

  @Contains("@", { message: "用户名必须包含@符号" })
  username: string;
}

/**
 * 控制器示例
 */
export class UserController {
  
  /**
   * 使用@Valid装饰器进行参数验证
   */
  getUserById(
    @Valid("IsNotEmpty", "用户ID不能为空") id: string,
    @Valid(["IsNotEmpty", "IsEmail"], "邮箱格式不正确") email: string
  ) {
    return { id, email };
  }

  /**
   * 使用@Validated装饰器进行DTO验证
   */
  @Validated()
  createUser(userData: UserDTO) {
    return { success: true, data: userData };
  }
}

/**
 * 错误处理示例
 */
export class ValidationExample {
  
  /**
   * 设置验证语言
   */
  static setupLanguage() {
    // 设置为中文
    setValidationLanguage('zh');
    
    // 或设置为英文
    // setValidationLanguage('en');
  }

  /**
   * 手动创建验证错误
   */
  static createCustomErrors() {
    const errors = createValidationErrors([
      {
        field: 'name',
        value: '',
        constraint: 'IsNotEmpty',
        message: '姓名不能为空'
      },
      {
        field: 'age',
        value: -1,
        constraint: 'Gt',
        message: '年龄必须大于0',
        context: { min: 0 }
      }
    ]);

    console.log('验证错误:', errors.toJSON());
    return errors;
  }

  /**
   * 处理验证错误
   */
  static async handleValidation() {
    try {
      const invalidUser = {
        name: '',
        idNumber: '123',
        phone: '456',
        email: 'invalid-email',
        age: -1,
        username: 'noatsymbol'
      };

      await ClassValidator.valid(UserDTO, invalidUser, true);
    } catch (error) {
      if (error instanceof KoattyValidationError) {
        console.log('验证失败:', error.getFirstError());
        console.log('所有错误:', error.errors);
      } else {
        console.log('其他错误:', error.message);
      }
    }
  }
}

/**
 * 性能优化示例
 */
export class PerformanceExample {
  
  /**
   * 初始化性能优化
   */
  static setup() {
    // 1. 预热缓存
    warmupCaches();
    
    // 2. 配置缓存设置
    configureCaches({
      validation: {
        max: 10000,      // 最大缓存条目数
        ttl: 1000 * 60 * 15, // 15分钟过期时间
        allowStale: false,
        updateAgeOnGet: true
      },
      regex: {
        max: 500,
        ttl: 1000 * 60 * 30, // 30分钟过期时间
      }
    });
  }

  /**
   * 性能监控示例
   */
  static async performanceMonitoring() {
    console.log('=== 性能监控示例 ===');
    
    // 执行一些验证操作
    const testData = [
      { name: '张三', phone: '13812345678' },
      { name: '李四', phone: '13987654321' },
      { name: '王五', phone: '15612345678' },
    ];

    for (const data of testData) {
      const timer = performanceMonitor.startTimer('user-validation');
      try {
        await ClassValidator.valid(UserDTO, data, true);
      } catch (error) {
        // 忽略验证错误，我们只关心性能
      } finally {
        timer();
      }
    }

    // 获取性能报告
    const stats = getAllCacheStats();
    console.log('缓存统计:', stats);
    
    // 获取性能热点
    const hotspots = performanceMonitor.getHotspots(5);
    console.log('性能热点:', hotspots);
    
    // 导出性能数据
    const csvData = performanceMonitor.exportToCSV();
    console.log('性能数据CSV:', csvData);
  }

  /**
   * 缓存效果演示
   */
  static demonstrateCaching() {
    console.log('=== 缓存效果演示 ===');
    
    const testValue = '张三';
    
    // 第一次调用（无缓存）
    console.time('第一次验证');
    const result1 = ClassValidator.valid(UserDTO, { name: testValue });
    console.timeEnd('第一次验证');
    
    // 第二次调用（有缓存）
    console.time('第二次验证');
    const result2 = ClassValidator.valid(UserDTO, { name: testValue });
    console.timeEnd('第二次验证');
    
    console.log('缓存统计:', getAllCacheStats());
  }
}

/**
 * 完整使用示例
 */
export async function completeExample() {
  console.log('=== Koatty Validation 完整示例 ===');
  
  // 1. 设置语言和性能优化
  ValidationExample.setupLanguage();
  PerformanceExample.setup();
  
  // 2. 创建用户控制器
  const userController = new UserController();
  
  // 3. 测试参数验证
  try {
    const result = userController.getUserById('123', 'test@example.com');
    console.log('参数验证成功:', result);
  } catch (error) {
    console.log('参数验证失败:', error.message);
  }
  
  // 4. 测试DTO验证
  try {
    const userData = {
      name: '张三',
      idNumber: '110101199001011234',
      phone: '13812345678',
      email: 'zhangsan@example.com',
      age: 25,
      username: 'zhangsan@123'
    };
    
    const result = userController.createUser(userData);
    console.log('DTO验证成功:', result);
  } catch (error) {
    console.log('DTO验证失败:', error.message);
  }
  
  // 5. 错误处理示例
  await ValidationExample.handleValidation();
  
  // 6. 性能监控
  await PerformanceExample.performanceMonitoring();
  
  // 7. 缓存效果演示
  PerformanceExample.demonstrateCaching();
  
  console.log('=== 示例完成 ===');
}

// 如果直接运行此文件，执行完整示例
if (require.main === module) {
  completeExample().catch(console.error);
} 