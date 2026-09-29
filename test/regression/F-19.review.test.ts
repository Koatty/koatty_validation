import 'reflect-metadata';
import { Type } from 'class-transformer';
import { IsDate, IsString, ValidateNested, IsNumberString, IsIP, IsBooleanString, IsUrl } from 'class-validator';
import { checkValidated, dtoToJsonSchema } from '../../src';
class Child { @IsString() label!: string; }
class Input { @IsDate() at!: Date; @ValidateNested() child!: Child; @ValidateNested({ each: true }) @Type(() => Child) children!: Child[]; }
test('P1-12 JSON dates and nested DTOs transform without primitive coercion', async () => {
  const result = await checkValidated([{ at: '2026-09-29T00:00:00.000Z', child: { label: 'ok' }, children: [{ label: 'ok' }] }], [Input]);
  expect(result.validatedArgs[0].at).toBeInstanceOf(Date); expect(result.validatedArgs[0].child).toBeInstanceOf(Child); expect(result.validatedArgs[0].children[0]).toBeInstanceOf(Child);
  await expect(checkValidated([{ at: 'bad', child: { label: 42 }, children: [] }], [Input])).rejects.toThrow();
});
test('P2 approximate rules explicitly declare unresolved schema constraints', () => {
  class Approx { @IsNumberString() number!: string; @IsIP() ip!: string; @IsBooleanString() boolean!: string; @IsUrl() url!: string; }
  expect(dtoToJsonSchema(Approx)['x-koatty-unresolved']).toEqual(expect.arrayContaining(['number:isNumberString', 'ip:isIp', 'boolean:isBooleanString', 'url:isUrl']));
});
