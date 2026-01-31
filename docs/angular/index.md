# @pliant/angular

Angular integration for Pliant validation. Provides dependency injection, reactive form validators, and Angular-specific utilities.

## Installation

```sh
npm install @pliant/core @pliant/angular
```

## Requirements

- Angular 17+
- `@pliant/core` (peer dependency)

## Quick Start

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { providePliantRules, providePliantMessages } from '@pliant/angular';
import { requiredRule, emailRule, minLengthRule } from '@pliant/core';

export const appConfig: ApplicationConfig = {
  providers: [
    providePliantRules({
      required: requiredRule(),
      email: emailRule(),
      password: minLengthRule({ min: 8 })
    }),
    providePliantMessages({
      required: 'This field is required',
      email: 'Please enter a valid email',
      password: d => `Password must be at least ${d.min} characters`
    })
  ]
};
```

```ts
// login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { pliant, PLIANT_REGISTRY } from '@pliant/angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <input formControlName="email" placeholder="Email">
      <input formControlName="password" type="password" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private registry = inject(PLIANT_REGISTRY);
  
  form = this.fb.group({
    email: ['', pliant(this.registry, 'required', 'email')],
    password: ['', pliant(this.registry, 'required', 'password')]
  });
}
```

## Exports

### Providers

| Export | Description |
|--------|-------------|
| `providePliantRules(rules)` | Provide rules to DI |
| `providePliantMessages(messages)` | Provide messages to DI |

### Injection Tokens

| Export | Description |
|--------|-------------|
| `PLIANT_REGISTRY` | Registry injection token |
| `PLIANT_MESSAGES` | Message resolver token |

### Validators

| Export | Description |
|--------|-------------|
| `pliant(registry, ...rules)` | Create sync ValidatorFn |
| `pliantAsync(registry, ...rules)` | Create async ValidatorFn |

### Utilities

| Export | Description |
|--------|-------------|
| `getPliantError(control)` | Get resolved error from control |

## Features

- **Dependency Injection**: Rules and messages configured at app level
- **ValidatorFn Adapter**: Use Pliant rules with reactive forms
- **Type Safety**: Full TypeScript support
- **Tree-Shakeable**: Only import what you use
- **Signal-Ready**: Works with Angular's signal-based forms

## Pages

- [Setup](/angular/setup) — Configuration and providers
- [pliant() Validator](/angular/pliant-validator) — Reactive form validator
- [Async Rules](/rules/async) — Server-side validation
