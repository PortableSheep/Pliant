# TypeScript Types

Pliant is written in TypeScript and exports comprehensive type definitions.

## Core Types

### Registry

```ts
interface Registry<TData = Record<string, unknown>> {
  // Opaque - use addRules() and evaluateRules()
}
```

### RuleDef

The shape of a validation rule:

```ts
interface RuleDef<TData = Record<string, unknown>> {
  /** Validates a value. Returns ErrorDetail on failure, null on success */
  validate(value: unknown, ctx: Context<TData>): ErrorDetail | null;
  
  /** Error code (defaults to rule name) */
  code?: string;
  
  /** Reference to parent rule when using inheritRule() */
  parent?: RuleDef<TData>;
}
```

### Context

Passed to rules during validation:

```ts
interface Context<TData = Record<string, unknown>> {
  /** Field name being validated */
  field: string;
  
  /** Additional data (form values, etc.) */
  data?: TData;
}
```

### ErrorDetail

A single validation error:

```ts
interface ErrorDetail {
  /** Error code identifying the failure */
  code: string;
  
  /** Additional error data (varies by rule) */
  [key: string]: unknown;
}
```

### ErrorMap

Collection of errors keyed by rule name:

```ts
type ErrorMap = Record<string, ErrorDetail>;
```

### ResolvedError

Error with message applied:

```ts
interface ResolvedError extends ErrorDetail {
  /** Human-readable message */
  message?: string;
}
```

### ResolvedErrorMap

```ts
type ResolvedErrorMap = Record<string, ResolvedError>;
```

## Message Types

### MessageCatalog

Maps error codes to messages:

```ts
type MessageCatalog = Record<string, string | MessageFunction>;
```

### MessageFunction

Dynamic message generator:

```ts
type MessageFunction = (detail: ErrorDetail, ctx?: Context) => string;
```

### MessageResolver

Function returned by `createMessageResolver()`:

```ts
type MessageResolver = (code: string, detail: ErrorDetail, ctx?: Context) => string | undefined;
```

## Rule Option Types

### RequiredRuleOptions

```ts
interface RequiredRuleOptions {
  /** Treat whitespace-only as empty (default: true) */
  trimWhitespace?: boolean;
}
```

### EmailRuleOptions

```ts
interface EmailRuleOptions {
  /** Allow empty values (default: true) */
  allowEmpty?: boolean;
}
```

### LengthRuleOptions

```ts
interface LengthRuleOptions {
  /** Minimum length */
  min?: number;
  
  /** Maximum length */
  max?: number;
}
```

### MinLengthRuleOptions

```ts
interface MinLengthRuleOptions {
  /** Minimum length required */
  min: number;
}
```

### MaxLengthRuleOptions

```ts
interface MaxLengthRuleOptions {
  /** Maximum length allowed */
  max: number;
}
```

### RangeRuleOptions

```ts
interface RangeRuleOptions {
  /** Minimum value (inclusive) */
  min: number;
  
  /** Maximum value (inclusive) */
  max: number;
}
```

### MinRuleOptions

```ts
interface MinRuleOptions {
  /** Minimum value (inclusive) */
  min: number;
}
```

### MaxRuleOptions

```ts
interface MaxRuleOptions {
  /** Maximum value (inclusive) */
  max: number;
}
```

### RegexRuleOptions

```ts
interface RegexRuleOptions {
  /** Pattern to match */
  pattern: RegExp;
  
  /** Invert match - fail if pattern matches (default: false) */
  invert?: boolean;
}
```

### EqualsRuleOptions

```ts
interface EqualsRuleOptions {
  /** Field to compare against (from ctx.data) */
  field?: string;
  
  /** Static value to compare against */
  value?: unknown;
}
```

## Usage Examples

### Typed Registry

```ts
import type { Registry } from '@pliant/core';

interface FormData {
  password: string;
  confirmPassword: string;
}

const registry: Registry<FormData> = createRegistry<FormData>();
```

### Custom Rule with Types

```ts
import type { RuleDef, Context, ErrorDetail } from '@pliant/core';

interface FormData {
  otherField: string;
}

const myRule: RuleDef<FormData> = {
  validate(value: unknown, ctx: Context<FormData>): ErrorDetail | null {
    if (ctx.data?.otherField === value) {
      return { code: 'matchesOther', field: 'otherField' };
    }
    return null;
  }
};
```

### Typed Message Resolver

```ts
import type { MessageCatalog, MessageFunction } from '@pliant/core';

const rangeMessage: MessageFunction = (detail) => {
  const { min, max, value } = detail as { min: number; max: number; value: number };
  return `Value ${value} must be between ${min} and ${max}`;
};

const messages: MessageCatalog = {
  required: 'This field is required',
  range: rangeMessage
};
```

### Generic Helper Function

```ts
import type { Registry, Context, ErrorMap } from '@pliant/core';
import { evaluateRules } from '@pliant/core';

function validateField<TData>(
  registry: Registry<TData>,
  field: string,
  value: unknown,
  rules: string[],
  data?: TData
): ErrorMap | null {
  const ctx: Context<TData> = { field, data };
  return evaluateRules(registry, value, ctx, rules);
}
```

## Augmenting Types

If you need to extend the types:

```ts
declare module '@pliant/core' {
  interface Context<TData> {
    /** Custom property */
    locale?: string;
  }
}
```

## See Also

- [@pliant/core](/core/) — Package overview
- [Built-in Rules](/rules/) — Rule reference
