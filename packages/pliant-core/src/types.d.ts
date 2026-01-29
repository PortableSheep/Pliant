export type RuleResult = null | PliantErrorDetail;
export interface PliantErrorDetail {
    code: string;
    message?: string;
    [key: string]: unknown;
}
export interface RuleContext<TData = Record<string, unknown>> {
    field?: string;
    data?: TData;
}
export type MessageBuilder = (detail: PliantErrorDetail, ctx: RuleContext) => string;
export type MessageCatalog = Record<string, string | MessageBuilder>;
export type MessageResolver = (code: string, detail: PliantErrorDetail, ctx: RuleContext) => string | undefined;
export type RuleFn<TOptions = unknown, TValue = unknown, TData = Record<string, unknown>> = (value: TValue, ctx: RuleContext<TData>, options: TOptions) => RuleResult;
export type AsyncRuleFn<TOptions = unknown, TValue = unknown, TData = Record<string, unknown>> = (value: TValue, ctx: RuleContext<TData>, options: TOptions) => Promise<RuleResult>;
export interface RuleDef<TOptions = unknown, TValue = unknown> {
    validate?: RuleFn<TOptions, TValue>;
    validateAsync?: AsyncRuleFn<TOptions, TValue>;
    message?: string | MessageBuilder;
    inherit?: string;
    options?: TOptions;
    enabled?: boolean;
    meta?: Record<string, unknown>;
}
export type Registry = Record<string, RuleDef<any, any>>;
export type RuleRef = string | [string, Record<string, unknown>] | {
    name: string;
    options?: Record<string, unknown>;
    message?: string | MessageBuilder;
    enabled?: boolean;
};
export interface ResolvedRuleDef extends RuleDef {
    name: string;
    validate: RuleFn;
}
//# sourceMappingURL=types.d.ts.map