# @pliant/angular

Angular adapter for @pliant/core.

## Install

```
npm install @pliant/core @pliant/angular
```

## Setup

```ts
import { providePliantRules, providePliantMessages } from "@pliant/angular";
import { requiredRule, lengthRule } from "@pliant/core";

bootstrapApplication(AppComponent, {
  providers: [
    providePliantRules({
      required: requiredRule(),
      length: lengthRule({ min: 3, max: 20 })
    }),
    providePliantMessages({
      required: "Required",
      length: (detail) => `Length ${detail.actual}`
    })
  ]
});
```

## Reactive Forms

```ts
import { FormControl } from "@angular/forms";
import { pliant } from "@pliant/angular";

const username = new FormControl("", {
  validators: [pliant(["required", "length"]) ]
});
```

## Group validation

```ts
import { FormGroup, FormControl } from "@angular/forms";
import { pliantGroup } from "@pliant/angular";

const form = new FormGroup(
  {
    password: new FormControl(""),
    confirm: new FormControl("")
  },
  {
    validators: [
      pliantGroup({
        fields: {
          confirm: [
            {
              name: "equals",
              options: { field: "password" },
              message: "Passwords must match"
            }
          ]
        }
      })
    ]
  }
);
```
