<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [koatty\_validation](./koatty_validation.md) &gt; [IsHash](./koatty_validation.ishash.md)

## IsHash() function

check if the string is a hash of type algorithm. Algorithm is one of \['md4', 'md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd128', 'ripemd160', 'tiger128', 'tiger160', 'tiger192', 'crc32', 'crc32b'\]


**Signature:**

```typescript
export declare function IsHash(algorithm: HashAlgorithm, validationOptions?: ValidationOptions): PropertyDecorator;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  algorithm | [HashAlgorithm](./koatty_validation.hashalgorithm.md) |  |
|  validationOptions | ValidationOptions | _(Optional)_ |

**Returns:**

PropertyDecorator

{<!-- -->PropertyDecorator<!-- -->}

