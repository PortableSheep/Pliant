# max

Validates that a numeric value does not exceed a maximum threshold.

## Import

```ts
import { maxRule } from '@pliant/core';
```

## Signature

```ts
function maxRule(options: MaxRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `max` | `number` | Yes | Maximum value (inclusive) |

## Error Detail

```ts
{
  code: 'max',
  max: number,    // Maximum allowed
  value: number   // Actual value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, maxRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  discount: maxRule({ max: 100 })
});

// Exceeds maximum
evaluateRules(registry, 150, { field: 'discount' }, ['discount']);
// { discount: { code: 'max', max: 100, value: 150 } }

// Passes
evaluateRules(registry, 50, { field: 'discount' }, ['discount']);
// null

evaluateRules(registry, 100, { field: 'discount' }, ['discount']);
// null (boundary is inclusive)
```

### Empty Values

Empty values pass validation:

```ts
evaluateRules(registry, '', { field: 'discount' }, ['discount']);
// null (passes)
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  max: (d) => `Cannot exceed ${d.max}`
});

// Percentage
const messages = createMessageResolver({
  max: (d) => `Maximum ${d.max}%`
});
```

## Common Use Cases

### Percentage/Discount

```ts
addRules(registry, {
  discount: maxRule({ max: 100 })
});

const messages = createMessageResolver({
  max: 'Discount cannot exceed 100%'
});
```

### File Size (MB)

```ts
addRules(registry, {
  fileSize: maxRule({ max: 10 })
});

const messages = createMessageResolver({
  max: (d) => `File size cannot exceed ${d.max}MB`
});
```

### Quantity Limit

```ts
addRules(registry, {
  quantity: maxRule({ max: 99 })
});

const messages = createMessageResolver({
  max: (d) => `Maximum ${d.max} items per order`
});
```

### Credit/Points

```ts
addRules(registry, {
  points: maxRule({ max: 1000 })
});
```

## See Also

- [min](/rules/min) — Minimum value
- [range](/rules/range) — Both min and max
- [Built-in Rules](/rules/) — All rules
