import { THEME } from "../../settings/enums";
import { SUPPORT_LOCALES } from "../../config/enums";
import { CurrencyCode } from "../../config/const";
export interface SettingsDto {
    userId: string;
    themeMode: THEME;
    primary: string;
    locale: SUPPORT_LOCALES;
    currency: CurrencyCode;
    favoriteFamilyId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface UpdateSettingsDto {
    themeMode?: THEME;
    primary?: string;
    locale?: SUPPORT_LOCALES;
    currency?: CurrencyCode;
    favoriteFamilyId?: string | null;
}
