type JsonSchema = Record<string, any>;
type ConstraintApplier = (schema: JsonSchema, constraints: any[]) => boolean;

/** class-validator validator name -> JSON Schema constraint. */
const CONSTRAINT_MAP: Record<string, ConstraintApplier> = {
  isstring: (s) => ((s.type = 'string'), true),
  isboolean: (s) => ((s.type = 'boolean'), true),
  isnumber: (s) => ((s.type = 'number'), true),
  isint: (s) => ((s.type = 'integer'), true),
  ispositive: (s) => ((s.type = s.type ?? 'number'), (s.exclusiveMinimum = 0), true),
  isnegative: (s) => ((s.type = s.type ?? 'number'), (s.exclusiveMaximum = 0), true),
  isport: (s) => ((s.type = 'string'), false),
  isdecimal: (s) => ((s.type = 'string'), false),
  isdate: (s) => ((s.type = 'string'), (s.format = 'date-time'), true),
  isarray: (s) => ((s.type = 'array'), true),
  arrayunique: (s) => ((s.type = 'array'), (s.uniqueItems = true), true),
  arrayminsize: (s, c) => ((s.minItems = c[0]), typeof c[0] === 'number'),
  arraymaxsize: (s, c) => ((s.maxItems = c[0]), typeof c[0] === 'number'),
  equals: (s, c) => ((s.const = c[0]), c[0] !== undefined),
  gte: (s, c) => ((s.minimum = c[0]), typeof c[0] === 'number'),
  lte: (s, c) => ((s.maximum = c[0]), typeof c[0] === 'number'),
  gt: (s, c) => ((s.exclusiveMinimum = c[0]), typeof c[0] === 'number'),
  lt: (s, c) => ((s.exclusiveMaximum = c[0]), typeof c[0] === 'number'),
  arraycontains: () => false,
  isnumberstring: (s) => ((s.type = 'string'), true),
  isemail: (s) => ((s.type = 'string'), (s.format = 'email'), true),
  isurl: (s) => ((s.type = 'string'), (s.format = 'uri'), true),
  isuuid: (s) => ((s.type = 'string'), (s.format = 'uuid'), true),
  isip: (s) => ((s.type = 'string'), true),
  isphonenumber: (s) => ((s.type = 'string'), true),
  isjson: (s) => ((s.type = 'string'), false),
  isobject: (s) => ((s.type = 'object'), true),
  isnotempty: (s) => { if (s.type === 'string') s.minLength = Math.max(1, s.minLength ?? 0); return s.type === 'string'; },
  isdefined: () => true,
  minlength: (s, c) => {
    if (typeof c[0] !== 'number') return false;
    s.minLength = c[0];
    return true;
  },
  maxlength: (s, c) => {
    if (typeof c[0] !== 'number') return false;
    s.maxLength = c[0];
    return true;
  },
  length: (s, c) => {
    if (typeof c[0] !== 'number' || typeof c[1] !== 'number') return false;
    s.minLength = c[0];
    s.maxLength = c[1];
    return true;
  },
  min: (s, c) => {
    if (typeof c[0] !== 'number') return false;
    s.minimum = c[0];
    return true;
  },
  max: (s, c) => {
    if (typeof c[0] !== 'number') return false;
    s.maximum = c[0];
    return true;
  },
  matches: (s, c) => {
    const pattern = c[0] instanceof RegExp ? c[0].source : typeof c[0] === 'string' ? c[0] : undefined;
    if (!pattern || (c[0] instanceof RegExp && c[0].flags) || (typeof c[1] === 'string' && c[1])) return false;
    s.pattern = pattern;
    return true;
  },
  isin: (s, c) => {
    if (!Array.isArray(c[0])) return false;
    s.enum = [...c[0]];
    return true;
  },
  isnotin: (s, c) => { s.not = { enum: c[0] }; return Array.isArray(c[0]); },
  isenum: (s, c) => {
    const enumObject = c[0];
    if (!enumObject || typeof enumObject !== 'object') return false;
    const values = Object.keys(enumObject).filter(k => Number.isNaN(Number(k))).map(k => enumObject[k]);
    if (!values.length) return false;
    s.enum = values as any[];
    return true;
  },
  isbooleanstring: (s) => ((s.type = 'string'), true),
  iscurrency: (s) => ((s.type = 'string'), false),
};


/** Shared by static manifest extraction and runtime DTO schemas. False means
 * the rule is only partially represented and must be marked unresolved. */
export function applyDtoConstraint(schema: JsonSchema, name: string, constraints: any[] = []): boolean {
  return CONSTRAINT_MAP[name.toLowerCase()]?.(schema, constraints) ?? false;
}

