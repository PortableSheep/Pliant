# length

Validates that a string's length is within a specified range.

## Import

```ts
import { lengthRule } from '@pliant/core';
```

## Signature

```ts
function lengthRule(options: LengthRuleOptions): RuleDef
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `min` | `number` | `undefined` | Minimum length (inclusive) |
| `max` | `number` | `undefined` | Maximum length (inclusive) |

At least one of `min` or `max` must be provided.

## Error Detail

```ts
{
  code: 'length',
  min?: number,    // If min was specified
  max?: number,    // If max was specified
  actual: number   // Actual length of the value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, lengthRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  username: lengthRule({ min: 3, max: 20 })
});

// Too short
evaluateRules(registry, 'ab', { field: 'username' }, ['username']);
// { username: { code: 'length', min: 3, max: 20, actual: 2 } }

// Too long
evaluateRules(registry, 'a'.repeat(25), { field: 'username' }, ['username']);
// { username: { code: 'length', min: 3, max: 20, actual: 25 } }

// Just right
evaluateRules(registry, 'john_doe', { field: 'username' }, ['username']);
// null
```

### Min Only

```ts
addRules(registry, {
  bio: lengthRule({ min: 10 })  // At least 10 characters
});

evaluateRules(registry, 'Short', { field: 'bio' }, ['bio']);
// { bio: { code: 'length', min: 10, actual: 5 } }
```

### Max Only

```ts
addRules(registry, {
  title: lengthRule({ max: 100 })  // Up to 100 characters
});

evaluateRules(registry, 'a'.repeat(150), { field: 'title' }, ['title']);
// { title: { code: 'length', max: 100, actual: 150 } }
```

### Empty Values

Empty values pass validation by default:

```ts
evaluateRules(registry, '', { field: 'username' }, ['username']);
// null (passes)

// To require a value:
addRules(registry, {
  required: requiredRule(),
  username: lengthRule({ min: 3, max: 20 })
});

evaluateRules(registry, '', ctx, ['required', 'username']);
// { required: { code: 'required' } }
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  length: (d) => {
    if (d.min !== undefined && d.max !== undefined) {
      return `Must be between ${d.min} and ${d.max} characters`;
    }
    if (d.min !== undefined) {
      return `Must be at least ${d.min} characters`;
    }
    return `Must be at most ${d.max} characters`;
  }
});
```

Or separate rules with specific messages:

```ts
addRules(registry, {
  usernameLength: inheritRule(lengthRule({ min: 3, max: 20 }), {
    code: 'usernameLength'
  }),
  passwordLength: inheritRule(lengthRule({ min: 8, max: 128 }), {
    code: 'passwordLength'
  })
});

const messages = createMessageResolver({
  usernameLength: (d) => `Username must be ${d.min}-${d.max} characters`,
  passwordLength: (d) => `Password must be at least ${d.min} characters`
});
```

## Related Rules

| Rule | Description |
|------|-------------|
| `length` | Both min and max |
| [minLength](/rules/minLength) | Minimum only |
| [maxLength](/rules/maxLength) | Maximum only |

::: tip When to use which?
- Use `length` when you need both bounds
- Use `minLength` when only minimum matters (passwords)
- Use `maxLength` when only maximum matters (database limits)
:::

## Common Patterns

### Username

```ts
addRules(registry, {
  username: lengthRule({ min: 3, max: 20 })
});
```

### Password

```ts
addRules(registry, {
  password: lengthRule({ min: 8, max: 128 })
});
```

### Tweet/Short Text

```ts
addRules(registry, {
  tweet: lengthRule({ max: 280 })
});
```

### Bio/Description

```ts
addRules(registry, {
  bio: lengthRule({ min: 50, max: 500 })
});
```

## See Also

- [minLength](/rules/minLength) — Minimum length only
- [maxLength](/rules/maxLength) — Maximum length only
- [required](/rules/required) — Non-empty requirement
- [Built-in Rules](/rules/) — All rules
