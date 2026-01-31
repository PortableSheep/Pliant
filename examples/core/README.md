# Pliant Core Example

A comprehensive interactive demo showcasing all features of `@pliant/core` – the framework-agnostic validation engine.

## Features Demonstrated

### Interactive Demo Tab
- **Required** – Basic non-empty validation
- **Email** – Email format validation
- **Username** – Inherited length rule (3-20 chars)
- **Age** – Range rule with min/max bounds (18-120)
- **Score** – Min rule (≥0)
- **Discount** – Max rule (≤100)
- **Numeric ID** – Digits-only validation
- **URL Slug** – Regex pattern validation
- **Password** – MinLength rule
- **Confirm Password** – Cross-field equals validation

### Documentation Tabs
- **All Rules** – Complete reference table of 11 built-in rules
- **Rule Inheritance** – How to extend rules with custom options/messages
- **Rulesets** – Form-level validation with field and group rules
- **Messages** – Static and dynamic message resolvers
- **API Reference** – All exports with TypeScript types

## Running Locally

```bash
# From repo root
npm run example:core
```

Then open http://localhost:4173 in your browser.

## How It Works

The example loads `@pliant/core` directly as an ES module from the built package. All validation happens in real-time as you type, with:

1. Structured error objects (code + contextual details)
2. Human-readable messages via `createMessageResolver()`
3. Visual feedback on each input field
4. Live JSON output showing raw error structure

## Key Concepts

```javascript
import {
  createRegistry,
  addRules,
  evaluateRules,
  inheritRule,
  requiredRule,
  lengthRule,
  applyMessages,
  createMessageResolver
} from "@pliant/core";

// Create and populate a registry
const registry = createRegistry();
addRules(registry, {
  required: requiredRule(),
  length: lengthRule({ min: 0, max: 256 }),
  username: inheritRule("length", {
    options: { min: 3, max: 20 },
    message: "Username must be 3-20 characters"
  })
});

// Validate a value
const errors = evaluateRules(registry, "ab", { field: "username" }, ["required", "username"]);
// → { username: { code: "length", min: 3, max: 20, actual: 2 } }

// Apply messages
const resolved = applyMessages(errors, ctx, messageResolver);
// → { username: { code: "length", message: "Username must be 3-20 characters", ... } }
```
