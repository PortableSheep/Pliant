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
| `trim` | `boolean` | `true` | Trim whitespace from strings before checking if empty |
| `allowFalse` | `boolean` | `false` | Allow `false` boolean value as valid (not empty) |
| `allowZero` | `boolean` | `true` | Allow `0` number value as valid (not empty) |

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

By default, whitespace is trimmed from strings before checking if empty:

```ts
// Default behavior (trim: true)
addRules(registry, {
  required: requiredRule() // or requiredRule({ trim: true })
});

evaluateRules(registry, '   ', { field: 'name' }, ['required']);
// { required: { code: 'required' } }

// Don't trim whitespace
addRules(registry, {
  required: requiredRule({ trim: false })
});

evaluateRules(registry, '   ', { field: 'name' }, ['required']);
// null (passes - whitespace is present)
```

### Boolean Values

By default, `false` is treated as empty:

```ts
// Default behavior (allowFalse: false)
evaluateRules(registry, false, { field: 'agreed' }, ['required']);
// { required: { code: 'required' } }

// Allow false as valid
addRules(registry, {
  required: requiredRule({ allowFalse: true })
});

evaluateRules(registry, false, { field: 'agreed' }, ['required']);
// null (passes)
```

### Numeric Zero

By default, `0` is allowed as valid:

```ts
// Default behavior (allowZero: true)
evaluateRules(registry, 0, { field: 'count' }, ['required']);
// null (passes)

// Treat zero as empty
addRules(registry, {
  required: requiredRule({ allowZero: false })
});

evaluateRules(registry, 0, { field: 'count' }, ['required']);
// { required: { code: 'required' } }
```

## Empty Values

The following are considered empty:

- `null`
- `undefined`
- `''` (empty string)
- `'   '` (whitespace only, when `trim: true`)
- `[]` (empty array)
- `false` (boolean, when `allowFalse: false`)
- `0` (number, when `allowZero: false`)

The following are NOT empty (with default options):

- `0` (number zero, since `allowZero: true` by default)
- Non-empty strings
- Non-empty arrays
- `true` (boolean)
- Objects (including empty objects like `{}`)

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
