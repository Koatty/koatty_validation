# koatty_validation 使用示例

本目录包含了 koatty_validation 的各种使用示例，帮助您快速上手。

## 📁 文件结构

- `basic-usage.ts` - 基础使用示例
- `custom-decorators.ts` - 自定义装饰器使用示例  
- `advanced-validation.ts` - 高级验证场景示例
- `error-handling.ts` - 错误处理示例

## 🚀 快速开始

### 1. 基础验证

```typescript
import { IsNotEmpty, IsEmail, IsInt } from 'koatty_validation';

class UserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsInt({ min: 18, max: 100 })
  age: number;
}
```

### 2. 自定义装饰器

```typescript
import { createSimpleDecorator } from 'koatty_validation';

const IsStrongPassword = createSimpleDecorator(
  'IsStrongPassword',
  (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
  },
  'Password must be at least 8 characters with uppercase, lowercase, number and special character'
);

class RegisterDto {
  @IsStrongPassword()
  password: string;
}
```

### 3. 中文本土化验证

```typescript
import { IsCnName, IsIdNumber, IsMobile } from 'koatty_validation';

class ChineseUserDto {
  @IsCnName()
  name: string;

  @IsIdNumber()
  idCard: string;

  @IsMobile()
  phone: string;
}
```

## 📖 详细示例

查看各个示例文件了解更多用法：

- **基础使用**: 查看 `basic-usage.ts`
- **自定义装饰器**: 查看 `custom-decorators.ts`
- **高级验证**: 查看 `advanced-validation.ts`
- **错误处理**: 查看 `error-handling.ts`

## 🔧 运行示例

```bash
# 编译TypeScript
npm run build

# 运行示例
node dist/examples/basic-usage.js
```

## 📚 更多文档

- [自定义装饰器指南](../CUSTOM_DECORATORS_GUIDE.md)
- [API文档](../README.md)
- [测试用例](../test/) 