# email

Validates that a value is a valid email address format.

## Import

```ts
import { emailRule } from '@pliant/core';
```

## Signature

```ts
function emailRule(options?: EmailRuleOptions): RuleDef
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `allowEmpty` | `boolean` | `true` | Allow empty/null/undefined values |

## Error Detail

```ts
{
  code: 'email',
  value: string  // The invalid value
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, emailRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  email: emailRule()
});

// Fails validation
evaluateRules(registry, 'notanemail', { field: 'email' }, ['email']);
// { email: { code: 'email', value: 'notanemail' } }

evaluateRules(registry, 'missing@domain', { field: 'email' }, ['email']);
// { email: { code: 'email', value: 'missing@domain' } }

// Passes validation
evaluateRules(registry, 'user@example.com', { field: 'email' }, ['email']);
// null

evaluateRules(registry, 'name+tag@sub.domain.co.uk', { field: 'email' }, ['email']);
// null
```

### Empty Values

By default, empty values pass validation:

```ts
// Default (allowEmpty: true)
addRules(registry, {
  email: emailRule()
});

evaluateRules(registry, '', { field: 'email' }, ['email']);
// null (passes)

evaluateRules(registry, null, { field: 'email' }, ['email']);
// null (passes)
```

### Required Email

To require a value, combine with `required`:

```ts
addRules(registry, {
  required: requiredRule(),
  email: emailRule()
});

// Check both required AND email format
evaluateRules(registry, '', ctx, ['required', 'email']);
// { required: { code: 'required' } }

evaluateRules(registry, 'bad', ctx, ['required', 'email']);
// { email: { code: 'email', value: 'bad' } }

evaluateRules(registry, 'good@email.com', ctx, ['required', 'email']);
// null (passes both)
```

### Strict Email (No Empty)

Alternatively, use `allowEmpty: false`:

```ts
addRules(registry, {
  email: emailRule({ allowEmpty: false })
});

evaluateRules(registry, '', { field: 'email' }, ['email']);
// { email: { code: 'email', value: '' } }
```

## Validation Pattern

The email rule uses a practical regex pattern that accepts most real-world email addresses:

- Local part: letters, numbers, and common special characters
- Single `@` symbol
- Domain with at least one dot
- TLD of 2+ characters

::: info Note
Email validation via regex cannot be 100% accurate per RFC 5322. For critical applications, consider server-side validation or confirmation emails.
:::

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  email: 'Please enter a valid email address'
});

// With value in message
const messages = createMessageResolver({
  email: (d) => `"${d.value}" is not a valid email address`
});
```

## Common Patterns

### Work Email Domain

Validate specific domains:

```ts
import { inheritRule, emailRule } from '@pliant/core';

const workEmail: RuleDef = {
  validate(value, ctx) {
    // First check basic email format
    const baseResult = emailRule().validate(value, ctx);
    if (baseResult) return baseResult;
    
    // Then check domain
    const email = String(value);
    if (!email.endsWith('@company.com')) {
      return { code: 'workEmail', value };
    }
    return null;
  }
};

addRules(registry, {
  workEmail
});

const messages = createMessageResolver({
  workEmail: 'Please use your company email (@company.com)'
});
```

### Multiple Variants

```ts
import { inheritRule, emailRule } from '@pliant/core';

addRules(registry, {
  // Base optional email
  email: emailRule(),
  
  // Required email (different code for different message)
  emailRequired: inheritRule(emailRule({ allowEmpty: false }), {
    code: 'emailRequired'
  })
});

const messages = createMessageResolver({
  email: 'Invalid email format',
  emailRequired: 'Email is required'
});
```

## See Also

- [required](/rules/required) — For required fields
- [regex](/rules/regex) — For custom patterns
- [Built-in Rules](/rules/) — All rules
