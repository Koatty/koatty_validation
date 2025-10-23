# koatty_validation

基于 class-validator 扩展的 Koatty 验证工具库，支持中文本地化验证规则、自定义装饰器、性能缓存和错误处理。

[![npm version](https://badge.fury.io/js/koatty_validation.svg)](https://badge.fury.io/js/koatty_validation)
[![Node.js CI](https://github.com/koatty/koatty_validation/workflows/Node.js%20CI/badge.svg)](https://github.com/koatty/koatty_validation/actions)

## ✨ 特性

- 🚀 **高性能**: 内置缓存机制，提升验证性能
- 🌏 **中文支持**: 内置中文验证规则（姓名、身份证、手机号等）
- 🔧 **自定义装饰器**: 支持装饰器工厂模式，轻松创建自定义验证器
- 📊 **性能监控**: 内置性能监控和缓存统计
- 🎯 **错误处理**: 多语言错误信息支持
- 📦 **TypeScript**: 完整的 TypeScript 支持

## 📦 安装

```bash
npm install koatty_validation
# 或
yarn add koatty_validation
```

## 🎯 快速开始

### 基础用法

```typescript
import { IsNotEmpty, IsCnName, IsMobile, Valid, Validated } from 'koatty_validation';

// 在控制器中使用参数验证
export class Controller {
    // 参数验证
    Test(@Valid("IsNotEmpty", "不能为空") id: number) {
        // 业务逻辑
    }

    // DTO 验证 - 异步模式（默认，适用于 Koatty 框架）
    @Validated()
    TestDto(user: UserDTO) {
        // 框架会在异步获取参数后自动验证 UserDTO
    }
    
    // DTO 验证 - 同步模式（适用于参数已准备好的场景）
    @Validated(false)
    TestDtoSync(user: UserDTO) {
        // 方法执行前立即验证 UserDTO
    }
}

// 定义 DTO 类
export class UserDTO {
    @IsNotEmpty({ message: "手机号不能为空" })
    @IsMobile({ message: "手机号格式不正确" })
    phoneNum: string;

    @IsCnName({ message: "姓名必须是有效的中文姓名" })
    userName: string;
}
```

## 📋 可用装饰器

### 🇨🇳 中文验证装饰器

```typescript
@IsCnName()        // 中文姓名
@IsIdNumber()      // 身份证号
@IsMobile()        // 手机号
@IsZipCode()       // 邮政编码
@IsPlateNumber()   // 车牌号
```

### 🌐 通用验证装饰器

```typescript
@IsNotEmpty()      // 非空
@IsEmail()         // 邮箱
@IsIP()            // IP地址
@IsPhoneNumber()   // 国际电话号码
@IsUrl()           // URL
@IsHash()          // 哈希值
@IsDate()          // 日期
```

### 🔢 数值比较装饰器

```typescript
@Gt(10)           // 大于
@Gte(10)          // 大于等于
@Lt(100)          // 小于
@Lte(100)         // 小于等于
@Equals('value')  // 等于
@NotEquals('x')   // 不等于
```

### 📝 字符串验证装饰器

```typescript
@Contains('test')           // 包含字符串
@IsIn(['a', 'b', 'c'])     // 在数组中
@IsNotIn(['x', 'y', 'z'])  // 不在数组中
```

### 🛠️ 控制装饰器

```typescript
@Valid(rule, options)   // 参数验证
@Validated()           // DTO验证 (默认异步模式)
@Validated(true)       // DTO验证 (异步模式)
@Validated(false)      // DTO验证 (同步模式)
@Expose()             // 暴露属性
@IsDefined()          // 已定义（Expose别名）
```

## 🎭 Validated 装饰器

`@Validated` 装饰器支持同步和异步两种验证模式，以适应不同的应用场景。

### 异步模式（默认）

适用于 **Koatty 框架**中，控制器方法的参数需要异步获取的场景。

```typescript
import { Validated, checkValidated } from 'koatty_validation';

class UserController {
  // 默认异步模式
  @Validated()
  async register(user: UserDTO) {
    // 框架流程：
    // 1. 框架接收 HTTP 请求
    // 2. 框架异步解析请求体，构造 UserDTO 实例
    // 3. 框架检测到 @Validated() 元数据
    // 4. 框架调用 checkValidated() 验证参数
    // 5. 验证通过后调用此方法
    return { success: true };
  }
  
  // 显式指定异步模式
  @Validated(true)
  async update(id: number, user: UserDTO) {
    return { success: true };
  }
}
```

**异步模式特点：**
- ✅ 装饰器保存验证元数据到 IOC 容器
- ✅ 由框架在异步获取参数后执行验证
- ✅ 适用于参数值需要异步获取的场景
- ✅ 是 Koatty 框架的推荐模式

### 同步模式

适用于**单元测试**或参数值已经准备好的场景。

```typescript
class UserService {
  // 同步模式 - 立即验证
  @Validated(false)
  async createUser(user: UserDTO) {
    // 方法执行前已经完成验证
    return { success: true };
  }
  
  // 适用于多个参数的场景
  @Validated(false)
  async updateUser(id: number, user: UserDTO) {
    // 只验证类类型参数（UserDTO），基础类型（number）不验证
    return { success: true };
  }
}
```

**同步模式特点：**
- ✅ 装饰器包装原方法，在调用时立即执行验证
- ✅ 适用于单元测试场景
- ✅ 适用于参数已准备好的场景
- ✅ 验证失败立即抛出错误

### 手动调用 checkValidated

在框架拦截器或中间件中，可以手动调用 `checkValidated` 函数：

```typescript
import { checkValidated } from 'koatty_validation';

async function validateInMiddleware(args: any[], paramTypes: any[]) {
  try {
    const { validatedArgs, validationTargets } = await checkValidated(args, paramTypes);
    console.log('验证通过');
    return validationTargets;
  } catch (error) {
    console.error('验证失败:', error);
    throw error;
  }
}
```

### 选择合适的模式

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| Koatty 框架控制器 | 异步 `@Validated()` | 参数需要异步获取 |
| 单元测试 | 同步 `@Validated(false)` | 参数已准备好，立即验证 |
| 独立服务/工具 | 同步 `@Validated(false)` | 不依赖框架，立即验证 |
| 框架拦截器 | 手动 `checkValidated()` | 完全控制验证时机 |

## 🔧 自定义装饰器

### 使用装饰器工厂创建自定义验证器

```typescript
import { createSimpleDecorator, createParameterizedDecorator } from 'koatty_validation';

// 简单装饰器
export const IsPositiveInteger = createSimpleDecorator(
  'IsPositiveInteger',
  (value: any) => {
    const num = Number(value);
    return Number.isInteger(num) && num > 0;
  },
  'must be a positive integer'
);

// 带参数的装饰器
export const InRange = createParameterizedDecorator(
  'InRange',
  (value: any, min: number, max: number) => {
    const num = Number(value);
    return num >= min && num <= max;
  },
  'must be between $constraint1 and $constraint2'
);

// 使用自定义装饰器
class ProductDto {
  @IsPositiveInteger()
  quantity: number;

  @InRange(0, 100)
  discountPercent: number;
}
```

### 高级自定义装饰器

```typescript
import { createValidationDecorator } from 'koatty_validation';

// 复杂验证逻辑
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return createValidationDecorator({
    name: 'IsStrongPassword',
    validator: (value: string) => {
      const hasLowercase = /[a-z]/.test(value);
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      return value.length >= 8 && hasLowercase && hasUppercase && hasNumbers && hasSpecialChar;
    },
    defaultMessage: 'password must be at least 8 characters with uppercase, lowercase, number and special character',
    requiresValue: false
  })(validationOptions);
}
```

## 🚀 性能优化

### 缓存预热

```typescript
import { warmupCaches, performanceMonitor } from 'koatty_validation';

// 应用启动时预热缓存
await warmupCaches();

// 性能监控
const timer = performanceMonitor.startTimer('validation');
// ... 执行验证
timer(); // 结束计时

// 获取性能报告
const report = performanceMonitor.getReport();
console.log(report);
```

### 缓存统计

```typescript
import { getAllCacheStats, clearAllCaches } from 'koatty_validation';

// 获取缓存统计
const stats = getAllCacheStats();
console.log(stats);

// 清理缓存（用于测试或内存管理）
clearAllCaches();
```

## 🌐 错误处理

### 多语言支持

```typescript
import { setValidationLanguage, KoattyValidationError } from 'koatty_validation';

// 设置中文错误信息
setValidationLanguage('zh');

// 自定义错误处理
try {
  await validate(userDto);
} catch (error) {
  if (error instanceof KoattyValidationError) {
    console.log('验证错误:', error.message);
    console.log('错误详情:', error.errors);
  }
}
```

### 错误格式化

```typescript
import { errorFormatter } from 'koatty_validation';

const errors = await validate(dto);
if (errors.length > 0) {
  const formatted = errorFormatter(errors, 'zh');
  console.log(formatted);
}
```

## 📖 手动验证

### FunctionValidator

```typescript
import { FunctionValidator } from 'koatty_validation';

// 手动验证并抛出错误
try {
  FunctionValidator.IsNotEmpty("", "不能为空");
  FunctionValidator.IsMobile("123", "手机号格式不正确");
} catch (error) {
  console.log(error.message);
}

// 带选项的验证
FunctionValidator.Contains(str, {
  message: "必须包含字母s", 
  value: "s"
});
```

### ValidFuncs (纯函数)

```typescript
import { ValidFuncs } from 'koatty_validation';

// 返回布尔值的验证函数
if (!ValidFuncs.IsNotEmpty(str)) {
    console.log("字符串为空");
}

if (!ValidFuncs.IsCnName("张三")) {
    console.log("不是有效的中文姓名");
}

if (!ValidFuncs.IsMobile("13812345678")) {
    console.log("不是有效的手机号");
}
```

### ClassValidator

```typescript
import { ClassValidator } from 'koatty_validation';

class UserSchema {
    @IsDefined()
    id: number;
    
    @IsNotEmpty()
    name: string;

    @IsMobile()
    phone: string;
}

// 验证对象
try {
  const result = await ClassValidator.valid(UserSchema, {
    id: 1,
    name: '',
    phone: '123'
  });
} catch (error) {
  console.log('验证失败:', error.message);
}

// 转换并验证
const validatedData = await ClassValidator.valid(UserSchema, rawData, true);
```

## 📚 更多示例

查看 [examples](./examples/) 目录获取更多使用示例：

- [基础用法示例](./examples/basic-usage.ts)
- [自定义装饰器示例](./examples/custom-decorators-example.ts)
- [完整使用示例](./examples/usage-example.ts)
- [Validated 异步/同步模式示例](./examples/validated-async-sync-example.ts)

## 🔍 可用验证函数

所有验证函数都同时提供装饰器和函数两种形式：

| 函数名 | 描述 | 示例 |
|--------|------|------|
| IsCnName | 中文姓名 | `ValidFuncs.IsCnName("张三")` |
| IsIdNumber | 身份证号 | `ValidFuncs.IsIdNumber("110101199001011234")` |
| IsMobile | 手机号 | `ValidFuncs.IsMobile("13812345678")` |
| IsZipCode | 邮政编码 | `ValidFuncs.IsZipCode("100000")` |
| IsPlateNumber | 车牌号 | `ValidFuncs.IsPlateNumber("京A12345")` |
| IsEmail | 邮箱 | `ValidFuncs.IsEmail("test@example.com")` |
| IsIP | IP地址 | `ValidFuncs.IsIP("192.168.1.1")` |
| IsPhoneNumber | 国际电话 | `ValidFuncs.IsPhoneNumber("+86-138-1234-5678")` |
| IsUrl | URL | `ValidFuncs.IsUrl("https://example.com")` |
| IsHash | 哈希值 | `ValidFuncs.IsHash("abc123", "md5")` |
| IsNotEmpty | 非空 | `ValidFuncs.IsNotEmpty("test")` |
| Equals | 相等 | `ValidFuncs.Equals("a", "a")` |
| NotEquals | 不相等 | `ValidFuncs.NotEquals("a", "b")` |
| Contains | 包含 | `ValidFuncs.Contains("hello", "ell")` |
| IsIn | 在数组中 | `ValidFuncs.IsIn("a", ["a", "b"])` |
| IsNotIn | 不在数组中 | `ValidFuncs.IsNotIn("c", ["a", "b"])` |
| IsDate | 日期 | `ValidFuncs.IsDate(new Date())` |
| Gt | 大于 | `ValidFuncs.Gt(10, 5)` |
| Gte | 大于等于 | `ValidFuncs.Gte(10, 10)` |
| Lt | 小于 | `ValidFuncs.Lt(5, 10)` |
| Lte | 小于等于 | `ValidFuncs.Lte(10, 10)` |

## 📊 测试覆盖率

当前测试覆盖率：**76%+**

- 语句覆盖率: 76.23%
- 分支覆盖率: 77.92%
- 函数覆盖率: 69.62%
- 行覆盖率: 76.14%

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[BSD-3-Clause License](LICENSE)

## 🔗 相关项目

- [koatty](https://github.com/koatty/koatty) - 基于 Koa2 的 Node.js 框架
- [class-validator](https://github.com/typestack/class-validator) - 基础验证库

