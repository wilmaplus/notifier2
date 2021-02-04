/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

export class IIDInformation {
    applicationVersion: string
    application: string
    scope: string
    authorizedEntity: string
    appSigner: string
    platform: string


    constructor(applicationVersion: string, application: string, scope: string, authorizedEntity: string, appSigner: string, platform: string) {
        this.applicationVersion = applicationVersion;
        this.application = application;
        this.scope = scope;
        this.authorizedEntity = authorizedEntity;
        this.appSigner = appSigner;
        this.platform = platform;
    }
}
