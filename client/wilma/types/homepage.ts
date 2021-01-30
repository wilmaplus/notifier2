/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

export interface Homepage {
    LoginResult: string;
    WilmaId: string;
    ApiVersion: number;
    FormKey: string;
    Name: string;
    Type: number;
    PrimusId: number;
    School: string;
    Photo: string;
    EarlyEduUser: boolean;
    Roles: Role[];
}

export interface Role {
    Slug: string;
    Name: string;
    Type: number;
    PrimusId: number;
    FormKey: string;
    Photo: string;
    EarlyEduUser: boolean;
    School: string;
}