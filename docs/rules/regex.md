# regex

Validates that a value matches (or doesn't match) a regular expression pattern.

## Import

```ts
import { regexRule } from '@pliant/core';
```

## Signature

```ts
function regexRule(options: RegexRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `pattern` | `RegExp` | Yes | — | Pattern to match |
| `invert` | `boolean` | No | `false` | Fail if pattern matches |

## Error Detail

```ts
{
  code: 'regex',
  pattern: string,   // Pattern as string
  value: string      // Actual value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, regexRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  phone: regexRule({ pattern: /^\d{10}$/ })
});

// Doesn't match
evaluateRules(registry, '123-456-7890', { field: 'phone' }, ['phone']);
// { phone: { code: 'regex', pattern: '^\\d{10}$', value: '123-456-7890' } }

// Matches
evaluateRules(registry, '1234567890', { field: 'phone' }, ['phone']);
// null
```

### Inverted Match

Use `invert: true` to fail when the pattern matches:

```ts
addRules(registry, {
  // Disallow spaces
  noSpaces: regexRule({ pattern: /\s/, invert: true })
});

evaluateRules(registry, 'has space', { field: 'username' }, ['noSpaces']);
// { noSpaces: { code: 'regex', pattern: '\\s', value: 'has space' } }

evaluateRules(registry, 'nospaces', { field: 'username' }, ['noSpaces']);
// null (passes)
```

### Empty Values

Empty values pass validation:

```ts
evaluateRules(registry, '', { field: 'phone' }, ['phone']);
// null (passes)
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  regex: 'Invalid format'
});
```

For better messages, use inherited rules with custom codes:

```ts
import { inheritRule, regexRule } from '@pliant/core';

addRules(registry, {
  phone: inheritRule(regexRule({ pattern: /^\d{10}$/ }), {
    code: 'phone'
  }),
  zipCode: inheritRule(regexRule({ pattern: /^\d{5}(-\d{4})?$/ }), {
    code: 'zipCode'
  })
});

const messages = createMessageResolver({
  phone: 'Please enter a 10-digit phone number',
  zipCode: 'Please enter a valid ZIP code'
});
```

## Common Patterns

### Phone Number (US)

```ts
addRules(registry, {
  phone: regexRule({ pattern: /^\d{10}$/ })
  // Or with formatting:
  // phoneFormatted: regexRule({ pattern: /^\d{3}-\d{3}-\d{4}$/ })
});
```

### ZIP Code (US)

```ts
addRules(registry, {
  zipCode: regexRule({ pattern: /^\d{5}(-\d{4})?$/ })
});
```

### Postal Code (Canada)

```ts
addRules(registry, {
  postalCode: regexRule({ pattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i })
});
```

### Social Security Number

```ts
addRules(registry, {
  ssn: regexRule({ pattern: /^\d{3}-?\d{2}-?\d{4}$/ })
});
```

### Username (Alphanumeric + Underscore)

```ts
addRules(registry, {
  username: regexRule({ pattern: /^[a-zA-Z0-9_]+$/ })
});
```

### Slug (URL-safe)

```ts
addRules(registry, {
  slug: regexRule({ pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ })
});
```

### No Special Characters

```ts
addRules(registry, {
  name: regexRule({ pattern: /[<>\"'&]/, invert: true })
});
```

### Credit Card (Basic)

```ts
addRules(registry, {
  creditCard: regexRule({ pattern: /^\d{13,19}$/ })
});
```

### IP Address (v4)

```ts
addRules(registry, {
  ipv4: regexRule({ 
    pattern: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/ 
  })
});
```

### URL (Simple)

```ts
addRules(registry, {
  url: regexRule({ pattern: /^https?:\/\/.+$/ })
});
```

## Best Practices

### Use Anchors

Always use `^` and `$` for full-string matching:

```ts
// ❌ Matches '123' anywhere in the string
regexRule({ pattern: /\d{3}/ })

// ✅ Matches exactly 3 digits
regexRule({ pattern: /^\d{3}$/ })
```

### Create Semantic Rules

Don't just use generic "regex" messages:

```ts
// ❌ Generic
addRules(registry, {
  regex: regexRule({ pattern: /^\d{10}$/ })
});
const messages = { regex: 'Invalid format' };

// ✅ Semantic
addRules(registry, {
  phone: inheritRule(regexRule({ pattern: /^\d{10}$/ }), { code: 'phone' })
});
const messages = { phone: 'Enter a 10-digit phone number' };
```

### Test Edge Cases

```ts
const pattern = /^[a-zA-Z]+$/;

// Empty string - decide if allowed
// Unicode - decide if 'café' should pass
// Whitespace - trim before validating?
```

## See Also

- [numeric](/rules/numeric) — Digits only
- [email](/rules/email) — Email format
- [Built-in Rules](/rules/) — All rules
