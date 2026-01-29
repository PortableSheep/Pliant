# numeric

Validates that a value contains only numeric digits (0-9).

## Import

```ts
import { numericRule } from '@pliant/core';
```

## Signature

```ts
function numericRule(): RuleDef
```

## Options

None.

## Error Detail

```ts
{
  code: 'numeric',
  value: string  // The invalid value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, numericRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  numeric: numericRule()
});

// Fails validation
evaluateRules(registry, 'abc123', { field: 'id' }, ['numeric']);
// { numeric: { code: 'numeric', value: 'abc123' } }

evaluateRules(registry, '12.34', { field: 'id' }, ['numeric']);
// { numeric: { code: 'numeric', value: '12.34' } }

evaluateRules(registry, '-123', { field: 'id' }, ['numeric']);
// { numeric: { code: 'numeric', value: '-123' } }

// Passes validation
evaluateRules(registry, '12345', { field: 'id' }, ['numeric']);
// null

evaluateRules(registry, '0', { field: 'id' }, ['numeric']);
// null
```

### Empty Values

Empty values pass validation (use `required` for non-empty):

```ts
evaluateRules(registry, '', { field: 'id' }, ['numeric']);
// null (passes)

// To require a value:
evaluateRules(registry, '', { field: 'id' }, ['required', 'numeric']);
// { required: { code: 'required' } }
```

## Use Cases

The `numeric` rule is for validating strings that should only contain digits:

- **ID Numbers**: Social Security, Employee IDs
- **ZIP Codes**: US postal codes (basic)
- **PINs**: Security codes
- **Account Numbers**: Bank accounts, customer IDs

::: warning Important
`numeric` validates **string format**, not numeric value. For validating numbers and their values, use [range](/rules/range), [min](/rules/min), or [max](/rules/max).
:::

## Numeric vs Number Validation

```ts
// numeric - validates string contains only digits
evaluateRules(registry, '123', ctx, ['numeric']);    // ✅ passes
evaluateRules(registry, '12.5', ctx, ['numeric']);   // ❌ fails (has dot)
evaluateRules(registry, '-10', ctx, ['numeric']);    // ❌ fails (has dash)

// range - validates numeric value
evaluateRules(registry, 12.5, ctx, ['range']);       // ✅ can pass
evaluateRules(registry, -10, ctx, ['range']);        // ✅ can pass
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  numeric: 'Please enter only numbers'
});

// Or more specific
const messages = createMessageResolver({
  numeric: 'This field must contain only digits (0-9)'
});
```

## Common Patterns

### ZIP Code (US)

```ts
import { inheritRule, numericRule, lengthRule } from '@pliant/core';

// US ZIP is 5 digits
addRules(registry, {
  numeric: numericRule(),
  zipLength: lengthRule({ min: 5, max: 5 }),
  
  // Or create a combined rule
  usZip: {
    validate(value, ctx) {
      const str = String(value ?? '');
      if (!str) return null; // Allow empty
      
      if (!/^\d{5}$/.test(str)) {
        return { code: 'usZip', value };
      }
      return null;
    }
  }
});
```

### Phone Number Digits

```ts
// Validate phone has exactly 10 digits
addRules(registry, {
  numeric: numericRule(),
  phoneDigits: lengthRule({ min: 10, max: 10 })
});

// Validate together
evaluateRules(registry, phoneValue, ctx, ['numeric', 'phoneDigits']);
```

### PIN Code

```ts
addRules(registry, {
  numeric: numericRule(),
  pinLength: lengthRule({ min: 4, max: 6 })
});

// 4-6 digit PIN
evaluateRules(registry, pin, ctx, ['required', 'numeric', 'pinLength']);
```

## See Also

- [range](/rules/range) — For numeric value ranges
- [regex](/rules/regex) — For custom patterns
- [length](/rules/length) — For string length
- [Built-in Rules](/rules/) — All rules
