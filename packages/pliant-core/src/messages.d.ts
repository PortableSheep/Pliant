import { MessageCatalog, MessageResolver, PliantErrorDetail, RuleContext } from "./types";
export declare const createMessageResolver: (catalog: MessageCatalog) => MessageResolver;
export declare const applyMessageResolver: (detail: PliantErrorDetail, ctx: RuleContext, resolver?: MessageResolver) => PliantErrorDetail;
export declare const applyMessages: (errors: Record<string, PliantErrorDetail> | null, ctx: RuleContext, resolver?: MessageResolver) => Record<string, PliantErrorDetail> | null;
//# sourceMappingURL=messages.d.ts.map