# maxLength

Validates that a string does not exceed a maximum length.

## Import

```ts
import { maxLengthRule } from '@pliant/core';
```

## Signature

```ts
function maxLengthRule(options: MaxLengthRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `max` | `number` | Yes | Maximum length (inclusive) |

## Error Detail

```ts
{
  code: 'maxLength',
  max: number,     // Maximum allowed
  actual: number   // Actual length
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, maxLengthRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  title: maxLengthRule({ max: 100 })
});

// Too long
evaluateRules(registry, 'a'.repeat(150), { field: 'title' }, ['title']);
// { title: { code: 'maxLength', max: 100, actual: 150 } }

// Passes
evaluateRules(registry, 'A normal title', { field: 'title' }, ['title']);
// null
```

### Empty Values

Empty values pass validation:

```ts
evaluateRules(registry, '', { field: 'title' }, ['title']);
// null (passes)
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  maxLength: (d) => `Maximum ${d.max} characters (currently ${d.actual})`
});

// Or with remaining count
const messages = createMessageResolver({
  maxLength: (d) => `${d.actual - d.max} characters over the limit`
});
```

## Common Use Cases

### Database Limits

```ts
addRules(registry, {
  title: maxLengthRule({ max: 255 }),      // VARCHAR(255)
  description: maxLengthRule({ max: 1000 }) // TEXT limit
});
```

### Social Media

```ts
addRules(registry, {
  tweet: maxLengthRule({ max: 280 }),
  bio: maxLengthRule({ max: 160 })
});

const messages = createMessageResolver({
  maxLength: (d) => `${d.actual}/${d.max} characters`
});
```

### Form Fields

```ts
addRules(registry, {
  name: maxLengthRule({ max: 50 }),
  email: maxLengthRule({ max: 254 }),  // RFC 5321
  comment: maxLengthRule({ max: 500 })
});
```

## Character Counter UI

The error detail is perfect for character counters:

```ts
function getCharacterCount(value: string, maxLength: number) {
  const errors = evaluateRules(registry, value, ctx, ['maxLength']);
  
  if (errors?.maxLength) {
    return {
      current: errors.maxLength.actual,
      max: errors.maxLength.max,
      over: true
    };
  }
  
  return {
    current: value.length,
    max: maxLength,
    over: false
  };
}
```

## See Also

- [minLength](/rules/minLength) — Minimum length
- [length](/rules/length) — Min and max combined
- [Built-in Rules](/rules/) — All rules
