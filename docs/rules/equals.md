# equals

Validates that a value matches another field's value or a static value. Perfect for "confirm password" fields.

## Import

```ts
import { equalsRule } from '@pliant/core';
```

## Signature

```ts
function equalsRule(options?: EqualsRuleOptions): RuleDef
```

## Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `field` | `string` | No* | Field name to compare against (from `ctx.data`) |
| `value` | `unknown` | No* | Static value to compare against |

\* At least one of `field` or `value` must be provided.

## Error Detail

```ts
{
  code: 'equals',
  expected: unknown,  // The expected value
  actual: unknown     // The actual value
}
```

## Examples

### Confirm Password

```ts
import { createRegistry, addRules, evaluateRules, equalsRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  confirmPassword: equalsRule({ field: 'password' })
});

const formData = {
  password: 'secret123',
  confirmPassword: 'secret124'  // Doesn't match!
};

evaluateRules(
  registry,
  formData.confirmPassword,
  { field: 'confirmPassword', data: formData },
  ['confirmPassword']
);
// { confirmPassword: { code: 'equals', expected: 'secret123', actual: 'secret124' } }

// When they match:
formData.confirmPassword = 'secret123';
evaluateRules(registry, formData.confirmPassword, ctx, ['confirmPassword']);
// null (passes)
```

### Confirm Email

```ts
addRules(registry, {
  confirmEmail: equalsRule({ field: 'email' })
});

const formData = {
  email: 'user@example.com',
  confirmEmail: 'user@exmaple.com'  // Typo!
};

const errors = evaluateRules(
  registry,
  formData.confirmEmail,
  { field: 'confirmEmail', data: formData },
  ['confirmEmail']
);
// { confirmEmail: { code: 'equals', expected: 'user@example.com', actual: 'user@exmaple.com' } }
```

### Static Value

Compare against a fixed value:

```ts
addRules(registry, {
  acceptTerms: equalsRule({ value: true })
});

evaluateRules(registry, false, { field: 'acceptTerms' }, ['acceptTerms']);
// { acceptTerms: { code: 'equals', expected: true, actual: false } }

evaluateRules(registry, true, { field: 'acceptTerms' }, ['acceptTerms']);
// null (passes)
```

### Confirmation Code

```ts
addRules(registry, {
  captcha: equalsRule({ value: 'ABC123' })  // Expected code from server
});
```

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  equals: 'Values do not match'
});

// More specific
const messages = createMessageResolver({
  equals: (d) => `Expected "${d.expected}", got "${d.actual}"`
});
```

For field-specific messages, use inherited rules:

```ts
import { inheritRule, equalsRule } from '@pliant/core';

addRules(registry, {
  confirmPassword: inheritRule(equalsRule({ field: 'password' }), {
    code: 'confirmPassword'
  }),
  confirmEmail: inheritRule(equalsRule({ field: 'email' }), {
    code: 'confirmEmail'
  }),
  acceptTerms: inheritRule(equalsRule({ value: true }), {
    code: 'acceptTerms'
  })
});

const messages = createMessageResolver({
  confirmPassword: 'Passwords do not match',
  confirmEmail: 'Email addresses do not match',
  acceptTerms: 'You must accept the terms and conditions'
});
```

## Important: Context Data

The `equals` rule with `field` option requires `ctx.data` to contain the comparison field:

```ts
// ✅ Correct - data includes password
evaluateRules(
  registry,
  confirmValue,
  { 
    field: 'confirmPassword',
    data: { password: 'secret123', confirmPassword: confirmValue }
  },
  ['confirmPassword']
);

// ❌ Wrong - data missing
evaluateRules(
  registry,
  confirmValue,
  { field: 'confirmPassword' },  // No data!
  ['confirmPassword']
);
```

## Empty Values

Empty values are compared normally:

```ts
// Both empty - passes
const formData = { password: '', confirmPassword: '' };
evaluateRules(registry, '', ctx, ['confirmPassword']);
// null (both empty, they match)

// One empty - fails
const formData = { password: 'secret', confirmPassword: '' };
evaluateRules(registry, '', ctx, ['confirmPassword']);
// { confirmPassword: { code: 'equals', expected: 'secret', actual: '' } }
```

## Common Patterns

### Registration Form

```ts
addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  password: minLengthRule({ min: 8 }),
  confirmPassword: equalsRule({ field: 'password' }),
  confirmEmail: equalsRule({ field: 'email' }),
  terms: equalsRule({ value: true })
});

// Validate confirm password
const formData = { password, confirmPassword };
evaluateRules(
  registry,
  formData.confirmPassword,
  { field: 'confirmPassword', data: formData },
  ['required', 'confirmPassword']
);
```

### Change Password Form

```ts
addRules(registry, {
  newPassword: minLengthRule({ min: 8 }),
  confirmNewPassword: equalsRule({ field: 'newPassword' })
});
```

## See Also

- [required](/rules/required) — Require a value
- [Built-in Rules](/rules/) — All rules
