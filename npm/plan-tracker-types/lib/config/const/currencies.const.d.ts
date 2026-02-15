export declare const CURRENCIES: readonly [{
    readonly code: "RUB";
    readonly symbol: "₽";
}, {
    readonly code: "USD";
    readonly symbol: "$";
}, {
    readonly code: "EUR";
    readonly symbol: "€";
}];
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
