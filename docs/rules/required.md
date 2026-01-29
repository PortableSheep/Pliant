# required

Validates that a value is present and not empty.

## Import

```ts
import { requiredRule } from '@pliant/core';
```

## Signature

```ts
function requiredRule(options?: RequiredRuleOptions): RuleDef
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trimWhitespace` | `boolean` | `true` | Treat whitespace-only strings as empty |

## Error Detail

```ts
{
  code: 'required'
}
```

## Examples

### Basic Usage

```ts
import { createRegistry, addRules, evaluateRules, requiredRule } from '@pliant/core';

const registry = createRegistry();
addRules(registry, {
  required: requiredRule()
});

// Fails validation
evaluateRules(registry, '', { field: 'name' }, ['required']);
// { required: { code: 'required' } }

evaluateRules(registry, null, { field: 'name' }, ['required']);
// { required: { code: 'required' } }

evaluateRules(registry, undefined, { field: 'name' }, ['required']);
// { required: { code: 'required' } }

// Passes validation
evaluateRules(registry, 'John', { field: 'name' }, ['required']);
// null
```

### Whitespace Handling

By default, whitespace-only strings are considered empty:

```ts
// Default behavior (trimWhitespace: true)
addRules(registry, {
  required: requiredRule() // or requiredRule({ trimWhitespace: true })
});

evaluateRules(registry, '   ', { field: 'name' }, ['required']);
// { required: { code: 'required' } }

// Allow whitespace-only values
addRules(registry, {
  required: requiredRule({ trimWhitespace: false })
});

evaluateRules(registry, '   ', { field: 'name' }, ['required']);
// null (passes)
```

## Empty Values

The following are considered empty:

- `null`
- `undefined`
- `''` (empty string)
- `'   '` (whitespace only, when `trimWhitespace: true`)

The following are NOT empty:

- `0` (number zero)
- `false` (boolean)
- `[]` (empty array)
- `{}` (empty object)

## Messages

```ts
import { createMessageResolver } from '@pliant/core';

const messages = createMessageResolver({
  required: 'This field is required'
});

// Or field-specific
const fieldMessages = {
  email: {
    required: 'Email address is required'
  },
  password: {
    required: 'Please enter your password'
  }
};
```

## Common Patterns

### First Rule

`required` is typically the first rule checked:

```ts
evaluateRules(registry, value, ctx, ['required', 'email', 'minLength']);
```

Since validation short-circuits, if `required` fails, other rules won't run.

### Optional Fields

For optional fields, simply don't include `required`:

```ts
// Optional email - only validated if provided
evaluateRules(registry, value, ctx, ['email']);

// Required email - must be present AND valid
evaluateRules(registry, value, ctx, ['required', 'email']);
```

### Inherited Required

Create semantic variants:

```ts
import { inheritRule, requiredRule } from '@pliant/core';

const nameRequired = inheritRule(requiredRule(), {
  code: 'nameRequired'
});

const emailRequired = inheritRule(requiredRule(), {
  code: 'emailRequired'
});

// Different messages for each
const messages = createMessageResolver({
  nameRequired: 'Please enter your name',
  emailRequired: 'Email is required for account creation'
});
```

## See Also

- [Built-in Rules](/rules/) — All rules
- [Rule Inheritance](/guide/rule-inheritance) — Creating variants
