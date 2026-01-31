# range

Validates that a numeric value falls within a specified range.

## Import

```ts
import { rangeRule } from '@pliant/core';
```

## Signature

```ts
function rangeRule(options: RangeRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `min` | `number` | Yes | Minimum value (inclusive) |
| `max` | `number` | Yes | Maximum value (inclusive) |

## Error Detail

```ts
{
  code: 'range',
  min: number,    // Minimum allowed
  max: number,    // Maximum allowed
  value: number   // Actual value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, rangeRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  age: rangeRule({ min: 18, max: 120 })
});

// Too low
evaluateRules(registry, 15, { field: 'age' }, ['age']);
// { age: { code: 'range', min: 18, max: 120, value: 15 } }

// Too high
evaluateRules(registry, 150, { field: 'age' }, ['age']);
// { age: { code: 'range', min: 18, max: 120, value: 150 } }

// Just right
evaluateRules(registry, 25, { field: 'age' }, ['age']);
// null
```

### String Numbers

String values are automatically converted:

```ts
evaluateRules(registry, '25', { field: 'age' }, ['age']);
// null (passes - '25' becomes 25)

evaluateRules(registry, '15', { field: 'age' }, ['age']);
// { age: { code: 'range', min: 18, max: 120, value: 15 } }
```

### Non-Numeric Values

Non-numeric values fail validation:

```ts
evaluateRules(registry, 'abc', { field: 'age' }, ['age']);
// { age: { code: 'range', min: 18, max: 120, value: NaN } }
```

### Empty Values

Empty values pass validation:

```ts
evaluateRules(registry, '', { field: 'age' }, ['age']);
// null (passes)

evaluateRules(registry, null, { field: 'age' }, ['age']);
// null (passes)
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  range: (d) => `Must be between ${d.min} and ${d.max}`
});

// More helpful message
const messages = createMessageResolver({
  range: (d) => {
    if (d.value < d.min) return `Must be at least ${d.min}`;
    if (d.value > d.max) return `Must be at most ${d.max}`;
    return `Must be between ${d.min} and ${d.max}`;
  }
});
```

## Common Use Cases

### Age

```ts
addRules(registry, {
  age: rangeRule({ min: 18, max: 120 })
});
```

### Quantity

```ts
addRules(registry, {
  quantity: rangeRule({ min: 1, max: 100 })
});

const messages = createMessageResolver({
  range: (d) => `Order between ${d.min} and ${d.max} items`
});
```

### Rating

```ts
addRules(registry, {
  rating: rangeRule({ min: 1, max: 5 })
});
```

### Percentage

```ts
addRules(registry, {
  percentage: rangeRule({ min: 0, max: 100 })
});
```

### Price

```ts
addRules(registry, {
  price: rangeRule({ min: 0.01, max: 10000 })
});
```

## Related Rules

| Rule | Description |
|------|-------------|
| `range` | Both min and max |
| [min](/rules/min) | Minimum only |
| [max](/rules/max) | Maximum only |

::: tip When to use which?
- Use `range` when both bounds are known
- Use `min` for minimum only (e.g., price ≥ 0)
- Use `max` for maximum only (e.g., discount ≤ 100%)
:::

## See Also

- [min](/rules/min) — Minimum value
- [max](/rules/max) — Maximum value
- [numeric](/rules/numeric) — Digits-only strings
- [Built-in Rules](/rules/) — All rules
