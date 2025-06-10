/**
 * koatty_validation 基础使用示例
 * @author richen
 */

import { validate } from 'class-validator';
import {
  IsNotEmpty,
  IsEmail,
  IsCnName,
  IsIdNumber,
  IsMobile,
  Expose
} from '../src/index';
import {
  IsStrongPassword,
  IsHexColor,
  IsPositiveInteger,
  IsFileExtension,
  MatchesPattern,
  ArrayLength,
  InRange
} from '../examples/custom-decorators-example';

// =============== 用户注册示例 ===============

class UserRegistrationDto {
  @IsNotEmpty()
  @IsCnName()
  name: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsPositiveInteger()
  age: number;

  @IsIdNumber()
  idCard: string;

  @IsMobile()
  phone: string;

  @IsHexColor()
  favoriteColor: string;

  @IsFileExtension(['jpg', 'png', 'gif'])
  avatar: string;

  @MatchesPattern(/^[A-Z]{2,3}$/)
  countryCode: string;

  @ArrayLength(1, 5)
  hobbies: string[];

  @InRange(0, 100)
  completionRate: number;

  @Expose()
  createdAt: Date = new Date();
}

// =============== 产品信息示例 ===============

class ProductDto {
  @IsNotEmpty()
  @MatchesPattern(/^[A-Z0-9-]+$/)
  sku: string;

  @IsNotEmpty()
  title: string;

  @InRange(0.01, 9999999.99)
  price: number;

  @InRange(0, 10000)
  stock: number;

  @ArrayLength(1, 10)
  tags: string[];

  @IsHexColor()
  primaryColor: string;

  @IsFileExtension(['jpg', 'png', 'webp'])
  mainImage: string;

  @Expose()
  isActive: boolean = true;
}

// =============== 验证演示函数 ===============

async function demonstrateValidation() {
  console.log('🚀 koatty_validation 基础使用示例\n');

  // ========== 成功验证示例 ==========
  console.log('✅ 成功验证示例:');
  
  const validUser = new UserRegistrationDto();
  validUser.name = '张三';
  validUser.email = 'zhangsan@example.com';
  validUser.password = 'MySecure123!';
  validUser.age = 25;
  validUser.idCard = '110101199001011234';
  validUser.phone = '13812345678';
  validUser.favoriteColor = '#FF5733';
  validUser.avatar = 'profile.jpg';
  validUser.countryCode = 'CN';
  validUser.hobbies = ['reading', 'coding'];
  validUser.completionRate = 85;

  const validErrors = await validate(validUser);
  if (validErrors.length === 0) {
    console.log('用户注册数据验证通过 ✓');
  } else {
    console.log('用户注册数据验证失败:', validErrors.map(e => e.constraints));
  }

  // ========== 失败验证示例 ==========
  console.log('\n❌ 失败验证示例:');
  
  const invalidUser = new UserRegistrationDto();
  invalidUser.name = 'John123';          // 不是中文名
  invalidUser.email = 'invalid-email';   // 无效邮箱
  invalidUser.password = 'weak';          // 弱密码
  invalidUser.age = -5;                  // 负数年龄
  invalidUser.idCard = '123';            // 无效身份证
  invalidUser.phone = '123';             // 无效手机号
  invalidUser.favoriteColor = 'red';     // 不是十六进制颜色
  invalidUser.avatar = 'profile.pdf';    // 不允许的文件类型
  invalidUser.countryCode = 'china';     // 不符合模式
  invalidUser.hobbies = [];              // 数组为空
  invalidUser.completionRate = 150;      // 超出范围

  const invalidErrors = await validate(invalidUser);
  console.log(`发现 ${invalidErrors.length} 个验证错误:`);
  
  invalidErrors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.property}:`);
    Object.values(error.constraints || {}).forEach(message => {
      console.log(`   - ${message}`);
    });
  });

  // ========== 产品验证示例 ==========
  console.log('\n📦 产品信息验证示例:');
  
  const product = new ProductDto();
  product.sku = 'PROD-2024-001';
  product.title = 'Gaming Laptop';
  product.price = 1299.99;
  product.stock = 50;
  product.tags = ['gaming', 'laptop', 'electronics'];
  product.primaryColor = '#1E1E1E';
  product.mainImage = 'laptop.jpg';

  const productErrors = await validate(product);
  if (productErrors.length === 0) {
    console.log('产品信息验证通过 ✓');
    console.log('产品详情:', {
      sku: product.sku,
      title: product.title,
      price: `$${product.price}`,
      stock: product.stock,
      tags: product.tags.join(', '),
      primaryColor: product.primaryColor,
      isActive: product.isActive
    });
  } else {
    console.log('产品信息验证失败:', productErrors.map(e => e.constraints));
  }
}

// =============== 性能测试示例 ===============

async function performanceDemo() {
  console.log('\n⚡ 性能测试示例:');
  
  const testCount = 1000;
  const startTime = Date.now();
  
  for (let i = 0; i < testCount; i++) {
    const user = new UserRegistrationDto();
    user.name = '测试用户';
    user.email = `user${i}@example.com`;
    user.password = 'Test123!';
    user.age = 25;
    user.idCard = '110101199001011234';
    user.phone = '13812345678';
    user.favoriteColor = '#FF5733';
    user.avatar = 'avatar.jpg';
    user.countryCode = 'CN';
    user.hobbies = ['test'];
    user.completionRate = 50;
    
    await validate(user);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log(`验证 ${testCount} 个对象耗时: ${duration}ms`);
  console.log(`平均每个对象: ${(duration / testCount).toFixed(2)}ms`);
}

// =============== 主函数 ===============

async function main() {
  try {
    await demonstrateValidation();
    await performanceDemo();
    
    console.log('\n🎉 所有示例运行完成！');
    console.log('\n📚 更多示例请查看:');
    console.log('  - custom-decorators.ts - 自定义装饰器示例');
    console.log('  - advanced-validation.ts - 高级验证示例');
    console.log('  - error-handling.ts - 错误处理示例');
    
  } catch (error) {
    console.error('示例运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

export {
  UserRegistrationDto,
  ProductDto,
  demonstrateValidation,
  performanceDemo
}; 