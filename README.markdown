Pliant - Modern Validation Engine
==================================

> **🎉 Pliant 2.0** – A framework-agnostic validation engine with typed rules, inheritance, and structured errors.

<p align="center">
  <strong>Core</strong> · <strong>Angular</strong> · <strong>TypeScript</strong> · <strong>Browser + Node</strong>
</p>

## ✨ Features

- **🎯 Named Rules** – Define validation rules once, use them everywhere by name
- **🧬 Rule Inheritance** – Extend base rules with custom options and messages
- **📦 Structured Errors** – Rich error objects with codes and contextual details
- **💬 Message Resolvers** – Static strings or dynamic functions with error details
- **📋 Rulesets** – Declarative field and group validation for forms
- **🔌 Framework Adapters** – Core is framework-agnostic, Angular adapter included

## 📦 Packages

| Package | Description |
|---------|-------------|
| [@pliant/core](packages/pliant-core) | Framework-agnostic validation engine |
| [@pliant/angular](packages/pliant-angular) | Angular Reactive Forms integration |

## 🚀 Quick Start

### Core (Browser/Node)

```typescript
import {
  createRegistry,
  addRules,
  evaluateRules,
  inheritRule,
  requiredRule,
  lengthRule,
  emailRule,
  applyMessages,
  createMessageResolver
} from "@pliant/core";

// 1. Create a registry
const registry = createRegistry();

// 2. Register rules
addRules(registry, {
  required: requiredRule(),
  email: emailRule(),
  length: lengthRule({ min: 0, max: 256 }),
  username: inheritRule("length", {
    options: { min: 3, max: 20 },
    message: "Username must be 3-20 characters"
  })
});

// 3. Create message resolver
const messages = createMessageResolver({
  required: "This field is required",
  email: "Please enter a valid email",
  length: (detail) => `Must be ${detail.min}-${detail.max} characters`
});

// 4. Validate
const errors = evaluateRules(registry, "ab", { field: "username" }, ["required", "username"]);
// → { username: { code: "length", min: 3, max: 20, actual: 2 } }

const resolved = applyMessages(errors, { field: "username" }, messages);
// → { username: { code: "length", message: "Username must be 3-20 characters", ... } }
```

### Angular

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { providePliantRules, providePliantMessages } from "@pliant/angular";
import { requiredRule, emailRule, lengthRule, equalsRule } from "@pliant/core";

bootstrapApplication(AppComponent, {
  providers: [
    providePliantRules({
      required: requiredRule(),
      email: emailRule(),
      length: lengthRule({ min: 8, max: 64 }),
      equals: equalsRule()
    }),
    providePliantMessages({
      required: "This field is required",
      email: "Please enter a valid email",
      equals: "Passwords must match"
    })
  ]
});
```

```typescript
// component.ts
import { pliant } from "@pliant/angular";
import { FormControl, FormGroup } from "@angular/forms";

form = new FormGroup({
  email: new FormControl("", { validators: [pliant(["required", "email"])] }),
  password: new FormControl("", { validators: [pliant(["required", "length"])] }),
  confirm: new FormControl("", { validators: [pliant([{ name: "equals", options: { field: "password" } }])] })
});
```

## 📚 Built-in Rules

| Rule | Options | Description |
|------|---------|-------------|
| `required` | – | Non-empty value |
| `email` | – | Email format |
| `length` | `{ min?, max? }` | String length bounds |
| `minLength` | `{ min }` | Minimum string length |
| `maxLength` | `{ max }` | Maximum string length |
| `numeric` | – | Digits only |
| `range` | `{ min?, max?, inclusive? }` | Numeric range |
| `min` | `{ min, inclusive? }` | Minimum value |
| `max` | `{ max, inclusive? }` | Maximum value |
| `regex` | `{ pattern: RegExp }` | Custom pattern |
| `equals` | `{ field?, value?, strict? }` | Equality check |

## 🎮 Examples

```bash
# Run the core example
npm run example:core

# Run the Angular example
npm run example:angular
```

- [Core Example](examples/core) – Interactive browser demo with all features
- [Angular Example](examples/angular) – Reactive Forms integration

## 🛠 Development

```bash
# Install dependencies
npm install

# Build packages
npm run build

# Build core only
npm run build:core

# Build Angular only
npm run build:angular
```
    * Refactored plugin to use new plugin format.
* **1.0.0**
    * Initial version.
