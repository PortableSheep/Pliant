import { InjectionToken, Provider } from "@angular/core";
import { MessageCatalog, MessageResolver, Registry } from "@pliant/core";

export const PLIANT_RULES = new InjectionToken<Registry[]>("PLIANT_RULES");
export const PLIANT_MESSAGES = new InjectionToken<(MessageResolver | MessageCatalog)[]>("PLIANT_MESSAGES");

export const providePliantRules = (rules: Registry): Provider => ({
  provide: PLIANT_RULES,
  multi: true,
  useValue: rules
});

export const providePliantMessages = (messages: MessageResolver | MessageCatalog): Provider => ({
  provide: PLIANT_MESSAGES,
  multi: true,
  useValue: messages
});
