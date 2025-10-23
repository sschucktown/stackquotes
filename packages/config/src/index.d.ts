import { z } from "zod";
type EnvSource = Record<string, string | undefined>;
declare const serverSchema: z.ZodObject<{
    SUPABASE_URL: z.ZodString;
    SUPABASE_ANON_KEY: z.ZodString;
    SUPABASE_SERVICE_ROLE_KEY: z.ZodString;
    RESEND_API_KEY: z.ZodOptional<z.ZodString>;
    STRIPE_SECRET_KEY: z.ZodOptional<z.ZodString>;
    STRIPE_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    STRIPE_CONNECT_CLIENT_ID: z.ZodOptional<z.ZodString>;
    STRIPE_PRODUCT_ID: z.ZodOptional<z.ZodString>;
    STRIPE_PUBLISHABLE_KEY: z.ZodOptional<z.ZodString>;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.ZodOptional<z.ZodString>;
    PRO_PRICE_ID: z.ZodOptional<z.ZodString>;
    FORCE_REQUIRE_CC_FOR_TEST: z.ZodOptional<z.ZodString>;
    BASE_APP_URL: z.ZodOptional<z.ZodString>;
    BASE_API_URL: z.ZodOptional<z.ZodString>;
    EMAIL_TRACKING_BASE_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY?: string | undefined;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    STRIPE_CONNECT_CLIENT_ID?: string | undefined;
    STRIPE_PRODUCT_ID?: string | undefined;
    STRIPE_PUBLISHABLE_KEY?: string | undefined;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string | undefined;
    PRO_PRICE_ID?: string | undefined;
    FORCE_REQUIRE_CC_FOR_TEST?: string | undefined;
    BASE_APP_URL?: string | undefined;
    BASE_API_URL?: string | undefined;
    EMAIL_TRACKING_BASE_URL?: string | undefined;
}, {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY?: string | undefined;
    STRIPE_SECRET_KEY?: string | undefined;
    STRIPE_WEBHOOK_SECRET?: string | undefined;
    STRIPE_CONNECT_CLIENT_ID?: string | undefined;
    STRIPE_PRODUCT_ID?: string | undefined;
    STRIPE_PUBLISHABLE_KEY?: string | undefined;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string | undefined;
    PRO_PRICE_ID?: string | undefined;
    FORCE_REQUIRE_CC_FOR_TEST?: string | undefined;
    BASE_APP_URL?: string | undefined;
    BASE_API_URL?: string | undefined;
    EMAIL_TRACKING_BASE_URL?: string | undefined;
}>;
declare const clientSchema: z.ZodObject<{
    VITE_SUPABASE_URL: z.ZodString;
    VITE_SUPABASE_ANON_KEY: z.ZodString;
    VITE_APP_NAME: z.ZodDefault<z.ZodString>;
    VITE_API_BASE_URL: z.ZodOptional<z.ZodString>;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.ZodOptional<z.ZodString>;
    VITE_STRIPE_PUBLISHABLE_KEY: z.ZodOptional<z.ZodString>;
    NEXT_PUBLIC_FORCE_REQUIRE_CC_FOR_TEST: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_APP_NAME: string;
    VITE_API_BASE_URL?: string | undefined;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string | undefined;
    VITE_STRIPE_PUBLISHABLE_KEY?: string | undefined;
    NEXT_PUBLIC_FORCE_REQUIRE_CC_FOR_TEST?: string | undefined;
}, {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_APP_NAME?: string | undefined;
    VITE_API_BASE_URL?: string | undefined;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string | undefined;
    VITE_STRIPE_PUBLISHABLE_KEY?: string | undefined;
    NEXT_PUBLIC_FORCE_REQUIRE_CC_FOR_TEST?: string | undefined;
}>;
export type ServerConfig = z.infer<typeof serverSchema>;
export type ClientConfig = z.infer<typeof clientSchema>;
export declare class ConfigError extends Error {
    readonly issues: string[];
    constructor(issues: string[]);
}
export declare function loadServerConfig(env?: EnvSource): ServerConfig;
export declare function loadClientConfig(env: EnvSource): ClientConfig;
export declare const config: {
    server: (env?: EnvSource) => {
        SUPABASE_URL: string;
        SUPABASE_ANON_KEY: string;
        SUPABASE_SERVICE_ROLE_KEY: string;
        RESEND_API_KEY?: string | undefined;
        STRIPE_SECRET_KEY?: string | undefined;
        STRIPE_WEBHOOK_SECRET?: string | undefined;
        STRIPE_CONNECT_CLIENT_ID?: string | undefined;
        STRIPE_PRODUCT_ID?: string | undefined;
        STRIPE_PUBLISHABLE_KEY?: string | undefined;
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string | undefined;
        PRO_PRICE_ID?: string | undefined;
        FORCE_REQUIRE_CC_FOR_TEST?: string | undefined;
        BASE_APP_URL?: string | undefined;
        BASE_API_URL?: string | undefined;
        EMAIL_TRACKING_BASE_URL?: string | undefined;
    };
    client: (env: EnvSource) => {
        VITE_SUPABASE_URL: string;
        VITE_SUPABASE_ANON_KEY: string;
        VITE_APP_NAME: string;
        VITE_API_BASE_URL?: string | undefined;
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string | undefined;
        VITE_STRIPE_PUBLISHABLE_KEY?: string | undefined;
        NEXT_PUBLIC_FORCE_REQUIRE_CC_FOR_TEST?: string | undefined;
    };
};
export { STRIPE_PRICES, PRICE_ID_TO_PLAN, StripePriceKey } from "./stripePrices.js";
//# sourceMappingURL=index.d.ts.map
