/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

export class AbstractRoutine {

    encryptionKey: string
    name: string
    fileName: string

    constructor(encryptionKey: string, name: string, fileName: string|null=null) {
        this.encryptionKey = encryptionKey;
        this.name = name;
        if (fileName !== null)
            this.fileName = fileName;
        else
            this.fileName = name;
    }

    check(wilmaServer: string, wilmaSession: string, pushIds: string[], userId: string) {
        throw new Error("check method should be overridden! If you already did it, remove the super method");
    }

}