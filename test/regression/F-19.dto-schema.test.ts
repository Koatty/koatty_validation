import 'reflect-metadata';
import { IsOptional, IsPort, IsJSON, IsString, IsInt, Min, IsDefined } from 'class-validator';
import { dtoToJsonSchema, applyDtoConstraint } from '../../src/dto-schema';
class SchemaDto {
  @IsPort() port!: string;
  @IsJSON() document!: string;
  @IsString({ each: true }) tags!: string[];
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsDefined() @IsString() name!: string;
}
test('F-A19: JSON/port remain strings, each and nullable optional rules are preserved', () => {
  const schema = dtoToJsonSchema(SchemaDto);
  expect(schema.properties.port.type).toBe('string');
  expect(schema.properties.document.type).toBe('string');
  expect(schema.properties.tags).toEqual({ type: 'array', items: { type: 'string' } });
  expect(schema.properties.page.anyOf).toContainEqual({ type: 'null' });
  expect(dtoToJsonSchema(SchemaDto, 0, true).required).toEqual(['name']);
  expect(schema['x-koatty-unresolved']).toContain('port:isPort');
});
test('F-A19: runtime and CLI share rules; numeric enum reverse names and regexp flags are not misrepresented', () => {
  const schema: any = {}; expect(applyDtoConstraint(schema, 'IsEnum', [{ 0: 'Zero', Zero: 0 }])).toBe(true);
  expect(schema.enum).toEqual([0]);
  expect(applyDtoConstraint({}, 'Matches', [/abc/i])).toBe(false);
});
