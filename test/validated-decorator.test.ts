/**
 * Validated 装饰器测试
 * @author richen
 */
import { Validated } from '../src/decorators';
import { IsNotEmpty, IsCnName, IsMobile } from '../src/decorators';
import { KoattyValidationError } from '../src/error-handler';

describe('Validated Decorator', () => {
  
  class UserDTO {
    @IsNotEmpty({ message: "姓名不能为空" })
    @IsCnName({ message: "姓名必须是有效的中文姓名" })
    name: string;

    @IsMobile({ message: "手机号格式不正确" })
    phone: string;
  }

  class TestController {
    @Validated(false) // 使用同步模式进行测试
    async createUser(userData: UserDTO) {
      return { success: true, data: userData };
    }

    @Validated(false) // 使用同步模式进行测试
    async updateUser(id: number, userData: UserDTO) {
      return { success: true, id, data: userData };
    }

    // Method without DTO parameter
    @Validated(false) // 使用同步模式进行测试
    async simpleMethod(name: string, age: number) {
      return { name, age };
    }
  }

  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  describe('Valid DTO', () => {
    it('should pass validation with valid DTO', async () => {
      const validUser = Object.assign(new UserDTO(), {
        name: '张三',
        phone: '13812345678'
      });

      const result = await controller.createUser(validUser);
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('张三');
      expect(result.data.phone).toBe('13812345678');
    });

    it('should work with multiple parameters including DTO', async () => {
      const validUser = Object.assign(new UserDTO(), {
        name: '李四',
        phone: '13987654321'
      });

      const result = await controller.updateUser(123, validUser);
      
      expect(result.success).toBe(true);
      expect(result.id).toBe(123);
      expect(result.data.name).toBe('李四');
    });

    it('should work with non-DTO parameters', async () => {
      const result = await controller.simpleMethod('test', 25);
      
      expect(result.name).toBe('test');
      expect(result.age).toBe(25);
    });
  });

  describe('Invalid DTO', () => {
    it('should throw validation error with empty name', async () => {
      const invalidUser = Object.assign(new UserDTO(), {
        name: '',
        phone: '13812345678'
      });

      await expect(controller.createUser(invalidUser))
        .rejects
        .toThrow();
    });

    it('should throw validation error with invalid phone', async () => {
      const invalidUser = Object.assign(new UserDTO(), {
        name: '王五',
        phone: '123'  // Invalid phone number
      });

      await expect(controller.createUser(invalidUser))
        .rejects
        .toThrow();
    });

    it('should throw validation error with invalid Chinese name', async () => {
      const invalidUser = Object.assign(new UserDTO(), {
        name: 'John@Smith#123',  // Contains invalid characters
        phone: '13812345678'
      });

      await expect(controller.createUser(invalidUser))
        .rejects
        .toThrow();
    });

    it('should throw KoattyValidationError with error details', async () => {
      const invalidUser = Object.assign(new UserDTO(), {
        name: '',
        phone: '123'
      });

      try {
        await controller.createUser(invalidUser);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(KoattyValidationError);
        const validationError = error as KoattyValidationError;
        expect(validationError.errors.length).toBeGreaterThan(0);
        expect(validationError.errors[0]).toHaveProperty('field');
        expect(validationError.errors[0]).toHaveProperty('message');
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined DTO', async () => {
      await expect(controller.createUser(undefined as any))
        .rejects
        .toThrow();
    });

    it('should handle null DTO', async () => {
      await expect(controller.createUser(null as any))
        .rejects
        .toThrow();
    });

    it('should handle plain object (not DTO instance)', async () => {
      const plainObject = {
        name: '张三',
        phone: '13812345678'
      };

      // Plain object should still work if it passes validation
      const result = await controller.createUser(plainObject as any);
      expect(result.success).toBe(true);
    });
  });

  describe('Async mode', () => {
    class AsyncController {
      @Validated() // 默认为异步模式 (isAsync=true)
      async registerUser(userData: UserDTO) {
        return { success: true, data: userData };
      }
    }

    it('should save metadata in async mode', () => {
      const controller = new AsyncController();
      
      // 在异步模式下，装饰器应该保存元数据而不是包装方法
      // 验证逻辑由框架在异步获取参数后执行
      expect(controller.registerUser).toBeDefined();
    });
  });

  describe('Sync vs Async mode comparison', () => {
    class SyncController {
      @Validated(false) // 同步模式
      async syncCreate(userData: UserDTO) {
        return { mode: 'sync', data: userData };
      }
    }

    class AsyncController {
      @Validated(true) // 异步模式
      async asyncCreate(userData: UserDTO) {
        return { mode: 'async', data: userData };
      }
    }

    it('should execute sync validation immediately', async () => {
      const controller = new SyncController();
      const validUser = Object.assign(new UserDTO(), {
        name: '赵六',
        phone: '13912345678'
      });

      const result = await controller.syncCreate(validUser);
      expect(result.mode).toBe('sync');
      expect(result.data.name).toBe('赵六');
    });

    it('should defer validation in async mode', async () => {
      const controller = new AsyncController();
      const validUser = Object.assign(new UserDTO(), {
        name: '钱七',
        phone: '13712345678'
      });

      // 在异步模式下，方法本身不执行验证
      // 验证由框架处理
      const result = await controller.asyncCreate(validUser);
      expect(result.mode).toBe('async');
    });
  });
});

