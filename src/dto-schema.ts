/**
 * DTO -> JSON Schema bridge for MCP tool input schemas (roadmap Phase F, F-1).
 *
 * Reads the class-validator metadata that `koatty_validation` / `class-validator`
 * decorators already register at class-definition time, so the MCP layer reuses
 * the exact same declaration as HTTP request validation instead of introducing a
 * second parameter-decorator vocabulary.
 *
 * Anything that cannot be mapped statically is listed under
 * `x-koatty-unresolved` instead of being silently dropped.
 *
 * @License BSD-3-Clause
 */
import 'reflect-metadata';
import { getMetadataStorage } from 'class-validator';
const MCP_UNRESOLVED_MARKER = 'x-koatty-unresolved';
type JsonSchema = Record<string, any>;

const PRIMITIVE_TYPES = [String, Number, Boolean, Array, Object, Date, Function];

import { applyDtoConstraint } from './schema-rules';
export { applyDtoConstraint } from './schema-rules';
function camelValidatorName(name: string): string { return String(name || '').toLowerCase(); }

function safeDesignType(Dto: any, property: string): any {
  try {
    return Reflect.getMetadata('design:type', Dto.prototype, property);
  } catch {
    return undefined;
  }
}

function applyDesignType(Dto: any, property: string, schema: JsonSchema, unresolved: string[], depth: number): void {
  const designType = safeDesignType(Dto, property);
  if (designType === String) {
    schema.type = 'string';
    return;
  }
  if (designType === Number) {
    schema.type = 'number';
    return;
  }
  if (designType === Boolean) {
    schema.type = 'boolean';
    return;
  }
  if (designType === Array) {
    schema.type = 'array';
    return;
  }
  if (designType === Date) {
    schema.type = 'string';
    schema.format = 'date-time';
    return;
  }
  if (designType === Object || !designType) {
    schema.type = 'object';
    return;
  }
  if (PRIMITIVE_TYPES.includes(designType)) {
    schema.type = 'object';
    return;
  }
  if (depth < 3 && typeof designType === 'function') {
    schema.type = 'object';
    Object.assign(schema, dtoToJsonSchema(designType, depth + 1));
    return;
  }
  unresolved.push(`${property}:<nested:${designType?.name ?? 'unknown'}>`);
}

/**
 * Convert a DTO class into a JSON Schema object.
 *
 * @param Dto DTO class decorated with class-validator / koatty_validation rules.
 * @param depth Internal recursion guard for nested DTOs.
 */
export function dtoToJsonSchema(Dto: any, depth = 0, partial = false): JsonSchema {
  const schema: JsonSchema = {
    type: 'object',
    properties: {},
    additionalProperties: false,
  };
  const unresolved: string[] = [];

  if (typeof Dto !== 'function') {
    schema[MCP_UNRESOLVED_MARKER] = ['<not-a-dto-class>'];
    return schema;
  }

  let metadatas: any[] = [];
  try {
    metadatas = getMetadataStorage().getTargetValidationMetadatas(Dto, Dto.name, false, false) ?? [];
  } catch (error) {
    unresolved.push(`metadata:${(error as Error).message}`);
  }

  const byProperty = new Map<string, any[]>();
  for (const metadata of metadatas) {
    if (!metadata?.propertyName) continue;
    const list = byProperty.get(metadata.propertyName) ?? [];
    list.push(metadata);
    byProperty.set(metadata.propertyName, list);
  }

  const required: string[] = [];
  for (const [property, list] of byProperty) {
    const propertySchema: JsonSchema = {};
    const itemSchema: JsonSchema = {};
    const each = list.some((item) => item.each === true);
    let optional = false;
    applyDesignType(Dto, property, propertySchema, unresolved, depth);

    for (const metadata of list) {
      const rawType = camelValidatorName(metadata.type);
      const rawName = camelValidatorName(metadata.name);
      // Standard class-validator rules are stored as `customValidation` with the
      // validator name in `metadata.name`; only the conditional/type kinds are
      // carried by `metadata.type` itself.
      const key = rawType === 'customvalidation' ? rawName : rawType;
      // `@IsOptional()` skips every other rule; class-validator records it as a
      // conditional validation, so both the type and the name are inspected.
      if (rawType === 'isoptional' || rawName === 'isoptional') {
        optional = true;
        continue;
      }
      // `@ValidateIf` / other conditional checks are runtime-only.
      if (rawType === 'conditionalvalidation') { optional = true; unresolved.push(`${property}:conditionalValidation`); continue; }
      if (key === 'isdefined' || key === 'allow') continue;
      const applied = applyDtoConstraint(metadata.each ? itemSchema : propertySchema, key, Array.isArray(metadata.constraints) ? metadata.constraints : []);
      if (!applied) unresolved.push(`${property}:${metadata.name ?? metadata.type}`);
    }

    if (!Object.keys(propertySchema).length) {
      applyDesignType(Dto, property, propertySchema, unresolved, depth);
    }

    const resolved = each ? { ...propertySchema, type: 'array', items: itemSchema } : propertySchema;
    schema.properties[property] = list.some(item => item.name === 'isOptional') ? { anyOf: [resolved, { type: 'null' }] } : resolved;

    if (!optional && (!partial || list.some(item => item.type === 'isDefined' || item.name === 'isDefined'))) required.push(property);
  }

  if (required.length) schema.required = required;
  if (unresolved.length) schema[MCP_UNRESOLVED_MARKER] = unresolved;
  return schema;
}

/** Empty object schema used when a tool declares no DTO. */
export function emptyInputSchema(): JsonSchema {
  return { type: 'object', properties: {}, additionalProperties: false };
}
