import { SUPPORT_LOCALES } from "../../config/enums";
export interface LanguageConfig {
    code: SUPPORT_LOCALES;
    titleKey: string;
}
export declare const LANGUAGES: LanguageConfig[];
