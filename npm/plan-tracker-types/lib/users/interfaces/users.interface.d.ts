import type { SettingsDto } from "../../settings/interfaces";
export interface UserDto {
    id: string;
    displayName: string;
    telegramId?: string;
    email?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthUserDto {
    id: string;
    telegramId: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    languageCode: string | null;
    photoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    settings: SettingsDto;
}
export interface UpdateUserDto {
    displayName?: string;
}
export interface LinkTelegramDto {
    telegramId: string;
    initData: string;
}
