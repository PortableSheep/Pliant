# createRegistry()

Creates a new rule registry. The registry stores all registered rules and is used when evaluating values.

## Signature

```ts
function createRegistry<TData = Record<string, unknown>>(): Registry<TData>
```

## Parameters

None.

## Returns

`Registry<TData>` — A new empty registry object.

## Example

```ts
import { createRegistry, addRules, requiredRule } from '@pliant/core';

// Create a registry
const registry = createRegistry();

// Add rules to it
addRules(registry, {
  required: requiredRule()
});
```

## Type Parameters

| Parameter | Description |
|-----------|-------------|
| `TData` | Optional type for the `data` property on the context. Defaults to `Record<string, unknown>` |

## Registry Structure

The registry is an opaque object. Use `addRules()` to register rules and `evaluateRules()` to validate:

```ts
// ✅ Correct usage
const registry = createRegistry();
addRules(registry, { required: requiredRule() });

// ❌ Don't access internal properties
registry._rules; // Implementation detail, may change
```

## Multiple Registries

You can create multiple isolated registries:

```ts
// Form-level registry
const formRegistry = createRegistry();
addRules(formRegistry, {
  required: requiredRule(),
  email: emailRule()
});

// Global app registry with more rules
const globalRegistry = createRegistry();
addRules(globalRegistry, {
  required: requiredRule(),
  email: emailRule(),
  phone: regexRule({ pattern: /^\d{10}$/ }),
  ssn: regexRule({ pattern: /^\d{9}$/ })
});
```

## See Also

- [addRules()](/core/add-rules) — Add rules to a registry
- [evaluateRules()](/core/evaluate-rules) — Validate using a registry
