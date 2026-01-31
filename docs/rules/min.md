# min

Validates that a numeric value meets a minimum threshold.

## Import

```ts
import { minRule } from '@pliant/core';
```

## Signature

```ts
function minRule(options: MinRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `min` | `number` | Yes | Minimum value (inclusive) |

## Error Detail

```ts
{
  code: 'min',
  min: number,    // Minimum allowed
  value: number   // Actual value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, minRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  price: minRule({ min: 0 })
});

// Below minimum
evaluateRules(registry, -5, { field: 'price' }, ['price']);
// { price: { code: 'min', min: 0, value: -5 } }

// Passes
evaluateRules(registry, 10, { field: 'price' }, ['price']);
// null

evaluateRules(registry, 0, { field: 'price' }, ['price']);
// null (boundary is inclusive)
```

### Empty Values

Empty values pass validation:

```ts
evaluateRules(registry, '', { field: 'price' }, ['price']);
// null (passes)
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  min: (d) => `Must be at least ${d.min}`
});

// Currency formatting
const messages = createMessageResolver({
  min: (d) => `Minimum price is $${d.min.toFixed(2)}`
});
```

## Common Use Cases

### Price (Non-Negative)

```ts
addRules(registry, {
  price: minRule({ min: 0 })
});
```

### Quantity (At Least 1)

```ts
addRules(registry, {
  quantity: minRule({ min: 1 })
});
```

### Age

```ts
addRules(registry, {
  age: minRule({ min: 18 })
});

const messages = createMessageResolver({
  min: 'You must be at least 18 years old'
});
```

### Minimum Order

```ts
addRules(registry, {
  orderTotal: minRule({ min: 25 })
});

const messages = createMessageResolver({
  min: (d) => `Minimum order is $${d.min}`
});
```

## See Also

- [max](/rules/max) — Maximum value
- [range](/rules/range) — Both min and max
- [Built-in Rules](/rules/) — All rules
