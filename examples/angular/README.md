# Pliant Angular Example

A comprehensive interactive demo showcasing `@pliant/angular` – Angular Reactive Forms integration with DI-powered validation.

## Features Demonstrated

### Live Demo Tab
- **Email** – Required + email format validation
- **Username** – Inherited length rule (3-20 chars) with custom message
- **Password** – Required + length validation (8-64 chars)
- **Confirm Password** – Cross-field `equals` validation
- **Age** – Range validation (18-120)

### Documentation Tabs
- **Setup Code** – Complete bootstrap and component examples
- **API Reference** – All Angular-specific exports

## Running Locally

```bash
# From repo root
npm run example:angular
```

Then open the URL shown in the terminal (typically http://localhost:4200).

## Angular Integration

### 1. Provide Rules & Messages at Bootstrap

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { providePliantRules, providePliantMessages } from "@pliant/angular";
import { requiredRule, lengthRule, emailRule, equalsRule, inheritRule } from "@pliant/core";

bootstrapApplication(AppComponent, {
  providers: [
    providePliantRules({
      required: requiredRule(),
      email: emailRule(),
      length: lengthRule({ min: 8, max: 64 }),
      usernameLength: inheritRule("length", {
        options: { min: 3, max: 20 },
        message: "Username must be 3-20 characters"
      }),
      equals: equalsRule()
    }),
    providePliantMessages({
      required: "This field is required",
      email: "Please enter a valid email",
      length: (d) => `Must be ${d.min}-${d.max} characters`,
      equals: "Passwords must match"
    })
  ]
});
```

### 2. Use in Components

```typescript
import { pliant } from "@pliant/angular";
import { FormControl, FormGroup } from "@angular/forms";

@Component({ ... })
export class AppComponent {
  form = new FormGroup({
    email: new FormControl("", {
      validators: [pliant(["required", "email"])]
    }),
    username: new FormControl("", {
      validators: [pliant(["required", "usernameLength"])]
    }),
    password: new FormControl("", {
      validators: [pliant(["required", "length"])]
    }),
    confirm: new FormControl("", {
      validators: [pliant([
        { name: "equals", options: { field: "password" } }
      ])]
    })
  });
}
```

### 3. Display Errors in Template

```html
<input formControlName="email" />
<div *ngIf="email.errors?.pliant as errors">
  {{ errors.required?.message }}
  {{ errors.email?.message }}
</div>
```

## Key Exports

| Export | Description |
|--------|-------------|
| `providePliantRules(rules)` | Register rules in DI |
| `providePliantMessages(catalog)` | Register message templates |
| `pliant(rules)` | Create sync ValidatorFn |
| `pliantAsync(rules)` | Create async ValidatorFn |
| `pliantGroup(rules)` | Create FormGroup validator |
| `PLIANT_RULES` | Injection token for rules |
| `PLIANT_MESSAGES` | Injection token for messages |
