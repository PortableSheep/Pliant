# minLength

Validates that a string meets a minimum length requirement.

## Import

```ts
import { minLengthRule } from '@pliant/core';
```

## Signature

```ts
function minLengthRule(options: MinLengthRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `min` | `number` | Yes | Minimum length (inclusive) |

## Error Detail

```ts
{
  code: 'minLength',
  min: number,     // Required minimum
  actual: number   // Actual length
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, minLengthRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  password: minLengthRule({ min: 8 })
});

// Too short
evaluateRules(registry, 'short', { field: 'password' }, ['password']);
// { password: { code: 'minLength', min: 8, actual: 5 } }

// Passes
evaluateRules(registry, 'longenough', { field: 'password' }, ['password']);
// null
```

### Empty Values

Empty values pass validation:

```ts
evaluateRules(registry, '', { field: 'password' }, ['password']);
// null (passes)

// Combine with required:
evaluateRules(registry, '', ctx, ['required', 'password']);
// { required: { code: 'required' } }
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  minLength: (d) => `Must be at least ${d.min} characters (currently ${d.actual})`
});
```

## Common Use Cases

### Password Requirements

```ts
addRules(registry, {
  password: minLengthRule({ min: 8 })
});

const messages = createMessageResolver({
  minLength: (d) => `Password must be at least ${d.min} characters`
});
```

### Username

```ts
addRules(registry, {
  username: minLengthRule({ min: 3 })
});
```

### Comment/Review

```ts
addRules(registry, {
  review: minLengthRule({ min: 50 })
});

const messages = createMessageResolver({
  minLength: (d) => `Please write at least ${d.min} characters`
});
```

## Inherited Variants

Create specific rules with custom codes:

```ts
import { inheritRule, minLengthRule } from '@pliant/core';

addRules(registry, {
  passwordMinLength: inheritRule(minLengthRule({ min: 8 }), {
    code: 'passwordMinLength'
  }),
  usernameMinLength: inheritRule(minLengthRule({ min: 3 }), {
    code: 'usernameMinLength'
  })
});

const messages = createMessageResolver({
  passwordMinLength: 'Password must be at least 8 characters',
  usernameMinLength: 'Username must be at least 3 characters'
});
```

## See Also

- [maxLength](/rules/maxLength) — Maximum length
- [length](/rules/length) — Min and max combined
- [Built-in Rules](/rules/) — All rules
