import {Language} from '../constants';
import {ChannelOptions} from '../options/options.d.ts';

export type AchievementEntity = {
    id: number;
    languageId: Language;
    parentId: number | null;
    typeId: number;
    name: string;
    description: string;
    imageUrl: string;
    category: number;
    levelId: number;
    levelName: string;
    acquisitionPercentage: number;
}

export type AchievementCategoryEntity = {
    id: number;
    name: string;
}

export type AchievementCategoryEntity = {
    id: number;
    name: string;
}

export type AchievementChannelEntity = {
    id: number;
    additionalInfo: AchievementChannelAdditionalInfoEntity;
    childrenId: Set<number>|null;

    achievement(languageId: Language): Promise<AchievementEntity|null>;
}

export type AchievementChannelAdditionalInfoEntity = {
    awardedAt: Date
    eTag: string;
    steps: number | null;
    total: number | null;
    categoryId: number | null;
}

export type AchievementUserEntity = {
    id: number;
    additionalInfo: AchievementUserAdditionalInfoEntity;
    childrenId: Set<number>|null;

    achievement(languageId: Language): Promise<AchievementEntity|null>;
}

export type AchievementUserAdditionalInfoEntity = {
    awardedAt: Date
    eTag: string;
    steps: number | null;
    total: number | null;
    categoryId: number | null;
}

export type AdEntity = {
    start: number;
    end: number;
    ad: string;
    channelName: string

    channel(opts?: ChannelOptions): Promise<ChannelEntity|null>;
}

export type BlacklistEntity = {
    id: number;
    regex: string;
}