/**
 * SEC-03 regression tests: DTO validation whitelist (B-3).
 *
 * - fields not declared on the DTO are stripped (whitelist, default on)
 * - strict profile can additionally reject them (forbidNonWhitelisted)
 * - `__proto__`/`constructor`/`prototype` keys never reach DTO instances
 * - app security profile overrides the policy
 *
 * @ license: BSD (3-Clause)
 */
import { IsNotEmpty } from "../../src/decorators";
import { ClassValidator } from "../../src/rule";
import { IOCContainer } from "koatty_container";

class Sec03UserDto {
  @IsNotEmpty({ message: "name required" })
  name: string;

  @IsNotEmpty({ message: "age required" })
  age: number;
}

describe("SEC-03: DTO whitelist validation", () => {
  const originalApp = (IOCContainer as any).app;

  afterAll(() => {
    (IOCContainer as any).app = originalApp;
  });

  test("undeclared fields are stripped (whitelist on by default)", async () => {
    const obj: any = await ClassValidator.valid(
      Sec03UserDto,
      { name: "tom", age: 21, role: "admin", extra: "payload" },
      true
    );
    expect(obj.name).toBe("tom");
    expect(obj.age).toBe(21);
    expect(obj.role).toBeUndefined();
    expect(obj.extra).toBeUndefined();
  });

  test("strict profile (forbidNonWhitelisted) rejects undeclared fields", async () => {
    (IOCContainer as any).app = {
      security: { validation: { whitelist: true, forbidNonWhitelisted: true } },
    };
    try {
      // instance branch: extra fields live on the object, so the strict
      // policy must reject them instead of silently stripping
      const dto = Object.assign(new Sec03UserDto(), {
        name: "tom", age: 21, role: "admin",
      });
      await expect(ClassValidator.valid(Sec03UserDto, dto, true)).rejects.toThrow();
      await expect(ClassValidator.valid(Sec03UserDto, { name: "tom", age: 21, role: "admin" }, true)).rejects.toThrow();
    } finally {
      (IOCContainer as any).app = originalApp;
    }
  });

  test("profile can restore legacy behavior (whitelist off)", async () => {
    (IOCContainer as any).app = {
      security: { validation: { whitelist: false, forbidNonWhitelisted: false } },
    };
    try {
      const dto = Object.assign(new Sec03UserDto(), {
        name: "tom", age: 21, role: "admin",
      });
      const obj: any = await ClassValidator.valid(Sec03UserDto, dto, true);
      expect(obj.role).toBe("admin");
    } finally {
      (IOCContainer as any).app = originalApp;
    }
  });

  test("prototype pollution keys never reach the DTO instance", async () => {
    const payload = JSON.parse('{"name":"tom","age":21,"__proto__":{"polluted":true}}');
    const obj: any = await ClassValidator.valid(Sec03UserDto, payload, true);

    expect(obj.name).toBe("tom");
    expect((Sec03UserDto.prototype as any).polluted).toBeUndefined();
    expect((Object.prototype as any).polluted).toBeUndefined();
    expect(obj.constructor).toBe(Sec03UserDto);
  });

  test("constructor key is ignored, not merged", async () => {
    const obj: any = await ClassValidator.valid(
      Sec03UserDto,
      { name: "tom", age: 21, constructor: { malicious: true } },
      true
    );
    expect(obj.name).toBe("tom");
    expect((obj.constructor as any).malicious).toBeUndefined();
    expect(obj.constructor).toBe(Sec03UserDto);
  });
});
