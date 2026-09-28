import 'reflect-metadata';
import { IsString } from 'class-validator';
import { Validated, checkValidated, Gte, Expose } from '../../src/decorators';
import { ClassValidator } from '../../src/rule';
import { IOCContainer } from 'koatty_container';
class User { @IsString() name: string = ''; }
class Service { @Validated(false) save(user: User) { return user; } }
describe('AB-04: business receives validated arguments', () => {
  const old = (IOCContainer as any).app;
  beforeEach(() => { (IOCContainer as any).app = { security: { validation: { whitelist: true, forbidNonWhitelisted: false } } }; });
  afterEach(() => { (IOCContainer as any).app = old; });
  test('decorator passes the cleaned DTO, never the original object', async () => {
    const input = JSON.parse('{"name":"x","admin":true,"__proto__":{"polluted":true}}');
    const output = await new Service().save(input);
    expect(output).toBeInstanceOf(User); expect(output).toEqual({ name: 'x' });
    expect(input.admin).toBe(true);
  });
  test('checkValidated exposes the same validated argument list', async () => {
    const result = await checkValidated([{ name: 'x', admin: true }], [User]);
    expect(result.validatedArgs).toEqual(result.validationTargets);
    expect(result.validatedArgs[0]).toEqual({ name: 'x' });
  });
  test('strict rejects extra fields in plain objects, before conversion drops them', async () => {
    (IOCContainer as any).app.security.validation.forbidNonWhitelisted = true;
    await expect(ClassValidator.valid(User, { name: 'x', admin: true }, false)).rejects.toThrow();
  });
});

test('AB-04: partial is an explicit option and full validation rejects missing fields', async () => {
  class Required { @IsString() name!: string; }
  class PartialService {
    @Validated({ async: false, partial: false }) full(user: Required) { return user; }
    @Validated({ async: false, partial: true }) patch(user: Required) { return user; }
  }
  await expect(new PartialService().full({} as any)).rejects.toThrow();
  await expect(new PartialService().patch({} as any)).resolves.toEqual({});
});

 test('declared Expose properties survive whitelist and one-argument constraints keep their value', async () => {
  class Input { @Gte(3) id!: number; @Expose() note!: string; }
  const result = await ClassValidator.valid(Input, { id: 3, note: 'ok', extra: 'removed' });
  expect(result).toEqual({ id: 3, note: 'ok' });
  await expect(ClassValidator.valid(Input, { id: 2, note: 'ok' })).rejects.toThrow();
});
