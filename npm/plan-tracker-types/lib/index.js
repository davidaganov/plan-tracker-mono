// src/families/enums/family-role.enum.ts
var FAMILY_ROLE = /* @__PURE__ */ ((FAMILY_ROLE2) => {
  FAMILY_ROLE2["ADMIN"] = "admin";
  FAMILY_ROLE2["READER"] = "reader";
  return FAMILY_ROLE2;
})(FAMILY_ROLE || {});

// src/lists/enums/list-sort-mode.enum.ts
var LIST_SORT_MODE = /* @__PURE__ */ ((LIST_SORT_MODE2) => {
  LIST_SORT_MODE2["CREATED_AT"] = "createdAt";
  LIST_SORT_MODE2["MANUAL"] = "manual";
  return LIST_SORT_MODE2;
})(LIST_SORT_MODE || {});

// src/lists/enums/list-type.enum.ts
var LIST_TYPE = /* @__PURE__ */ ((LIST_TYPE2) => {
  LIST_TYPE2["SHOPPING"] = "shopping";
  LIST_TYPE2["TASKS"] = "tasks";
  return LIST_TYPE2;
})(LIST_TYPE || {});

// src/lists/enums/search-scope.enum.ts
var SEARCH_SCOPE = /* @__PURE__ */ ((SEARCH_SCOPE2) => {
  SEARCH_SCOPE2["ALL"] = "all";
  SEARCH_SCOPE2["PERSONAL"] = "personal";
  SEARCH_SCOPE2["FAMILY"] = "family";
  return SEARCH_SCOPE2;
})(SEARCH_SCOPE || {});

// src/products/enums/price-type.enum.ts
var PRICE_TYPE = /* @__PURE__ */ ((PRICE_TYPE2) => {
  PRICE_TYPE2["NONE"] = "none";
  PRICE_TYPE2["EXACT"] = "exact";
  PRICE_TYPE2["RANGE"] = "range";
  return PRICE_TYPE2;
})(PRICE_TYPE || {});

// src/products/enums/quantity-unit.enum.ts
var QUANTITY_UNIT = /* @__PURE__ */ ((QUANTITY_UNIT2) => {
  QUANTITY_UNIT2["PCS"] = "pcs";
  QUANTITY_UNIT2["KG"] = "kg";
  QUANTITY_UNIT2["G"] = "g";
  QUANTITY_UNIT2["L"] = "l";
  QUANTITY_UNIT2["ML"] = "ml";
  return QUANTITY_UNIT2;
})(QUANTITY_UNIT || {});

// src/products/enums/product-quantity-type.enum.ts
var PRODUCT_QUANTITY_TYPE = /* @__PURE__ */ ((PRODUCT_QUANTITY_TYPE2) => {
  PRODUCT_QUANTITY_TYPE2["REGULATED"] = "regulated";
  PRODUCT_QUANTITY_TYPE2["UNREGULATED"] = "unregulated";
  return PRODUCT_QUANTITY_TYPE2;
})(PRODUCT_QUANTITY_TYPE || {});

// src/settings/enums/theme.enum.ts
var THEME = /* @__PURE__ */ ((THEME2) => {
  THEME2["LIGHT"] = "light";
  THEME2["DARK"] = "dark";
  THEME2["SYSTEM"] = "auto";
  return THEME2;
})(THEME || {});

// src/config/enums/locales.enum.ts
var SUPPORT_LOCALES = /* @__PURE__ */ ((SUPPORT_LOCALES2) => {
  SUPPORT_LOCALES2["EN"] = "EN";
  SUPPORT_LOCALES2["RU"] = "RU";
  SUPPORT_LOCALES2["UK"] = "UK";
  return SUPPORT_LOCALES2;
})(SUPPORT_LOCALES || {});

// src/common/enums/sort-order.enum.ts
var SORT_ORDER = /* @__PURE__ */ ((SORT_ORDER2) => {
  SORT_ORDER2["ASC"] = "asc";
  SORT_ORDER2["DESC"] = "desc";
  return SORT_ORDER2;
})(SORT_ORDER || {});

// src/common/enums/access-level.enum.ts
var ACCESS_LEVEL = /* @__PURE__ */ ((ACCESS_LEVEL2) => {
  ACCESS_LEVEL2["READ"] = "read";
  ACCESS_LEVEL2["WRITE"] = "write";
  return ACCESS_LEVEL2;
})(ACCESS_LEVEL || {});

// src/common/const/entity-type.enum.ts
var ENTITY_TAB_CONFIG = {
  LISTS: {
    ROUTE_PREFIX: "/products/lists",
    ENTITY_KEY: "list",
    REF_KEY: "listsTabRef"
  },
  TEMPLATES: {
    ROUTE_PREFIX: "/products/templates",
    ENTITY_KEY: "template",
    REF_KEY: "templatesTabRef"
  },
  LOCATIONS: {
    ROUTE_PREFIX: "/products/locations",
    ENTITY_KEY: "location",
    REF_KEY: "locationsTabRef"
  },
  CATALOG: {
    ROUTE_PREFIX: "/products",
    ENTITY_KEY: "product",
    REF_KEY: "catalogTabRef"
  }
};

// src/config/const/currencies.const.ts
var CURRENCIES = [
  { code: "RUB", symbol: "\u20BD" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "\u20AC" }
];

// src/config/const/languages.const.ts
var LANGUAGES = [
  {
    code: "EN" /* EN */,
    titleKey: "English"
  },
  {
    code: "RU" /* RU */,
    titleKey: "Russian"
  },
  {
    code: "UK" /* UK */,
    titleKey: "Ukrainian"
  }
];
export {
  ACCESS_LEVEL,
  CURRENCIES,
  ENTITY_TAB_CONFIG,
  FAMILY_ROLE,
  LANGUAGES,
  LIST_SORT_MODE,
  LIST_TYPE,
  PRICE_TYPE,
  PRODUCT_QUANTITY_TYPE,
  QUANTITY_UNIT,
  SEARCH_SCOPE,
  SORT_ORDER,
  SUPPORT_LOCALES,
  THEME
};
//# sourceMappingURL=index.js.map