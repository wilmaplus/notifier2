/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {Storage} from "../storage/storage";
import {PushKey} from "../db/models/push";
import {Query} from "./misc/types";

export class AbstractRoutine {

    encryptionKey: string
    sessionId: Buffer
    name: string
    fileName: string
    static publicName="abstract"

    constructor(encryptionKey: string, sessionId: Buffer, name: string, fileName: string|null=null) {
        this.encryptionKey = encryptionKey;
        this.sessionId = sessionId;
        this.name = name;
        if (fileName !== null)
            this.fileName = fileName;
        else
            this.fileName = name;
    }

    check(wilmaServer: string, wilmaSession: string, userId: number, userType: number): Promise<Query[]> {
        throw new Error("check method should be overridden! If you already did it, remove the super method");
    }

    static getUserIdString(userId: number, userType: number, schoolIdentifier: string) {
        return userId+"."+userType+"."+schoolIdentifier;
    }

    getFile(userId: string): Promise<object|null> {
        return Storage.getSavedData(this.encryptionKey, this.sessionId, this.fileName, userId)
    }

    getContentHash(userId: string): Promise<Buffer|null> {
        return Storage.getSavedDataHash(this.sessionId, this.fileName, userId)
    }

    saveFile(content: object, userId: string): Promise<void> {
        return Storage.saveData(content, this.encryptionKey, this.sessionId, this.fileName, userId);
    }

}