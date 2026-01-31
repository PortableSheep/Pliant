# @pliant/core

Framework-agnostic validation engine that preserves Pliant’s named rules, inheritance, and rulesets.

## Install

```
npm install @pliant/core
```

## Usage

```ts
import {
  createRegistry,
  addRules,
  evaluateRules,
  requiredRule,
  lengthRule,
  inheritRule
} from "@pliant/core";

const registry = createRegistry();
addRules(registry, {
  required: requiredRule(),
  length: lengthRule({ min: 0, max: 256 }),
  usernameLength: inheritRule("length", { options: { min: 3, max: 20 } })
});

const errors = evaluateRules(registry, "ab", { field: "username" }, ["required", "usernameLength"]);
// errors => { length: { code: "length", min: 3, max: 20, actual: 2, message?: "..." } }
```

## Messages

```ts
import { applyMessages, createMessageResolver } from "@pliant/core";

const resolver = createMessageResolver({
  required: "Required",
  length: (detail) => `Length ${detail.actual}`
});

const resolved = applyMessages(errors, { field: "username" }, resolver);
```

## Rules included

- `requiredRule`
- `lengthRule`
- `numericRule`
- `regexRule`
- `emailRule`
- `rangeRule`
- `minRule`
- `maxRule`
- `minLengthRule`
- `maxLengthRule`
- `equalsRule`
