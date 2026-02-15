export interface EntityTabConfig {
    ROUTE_PREFIX: string;
    ENTITY_KEY: string;
    REF_KEY: string;
}
export declare const ENTITY_TAB_CONFIG: {
    LISTS: {
        ROUTE_PREFIX: string;
        ENTITY_KEY: string;
        REF_KEY: string;
    };
    TEMPLATES: {
        ROUTE_PREFIX: string;
        ENTITY_KEY: string;
        REF_KEY: string;
    };
    LOCATIONS: {
        ROUTE_PREFIX: string;
        ENTITY_KEY: string;
        REF_KEY: string;
    };
    CATALOG: {
        ROUTE_PREFIX: string;
        ENTITY_KEY: string;
        REF_KEY: string;
    };
};
export type EntityTabKey = keyof typeof ENTITY_TAB_CONFIG;
