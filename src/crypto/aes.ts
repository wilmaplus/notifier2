/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */
import * as crypto from "crypto"
import {HashUtils} from "./hash";
import {v4} from "uuid";

export class DecryptResult {
    private _data: Buffer
    private _sessionId: Buffer


    constructor(data: Buffer, sessionId: Buffer) {
        this._data = data;
        this._sessionId = sessionId;
    }


    get data(): Buffer {
        return this._data;
    }

    set data(value: Buffer) {
        this._data = value;
    }

    get sessionId(): Buffer {
        return this._sessionId;
    }

    set sessionId(value: Buffer) {
        this._sessionId = value;
    }
}

export class AESCipher {
    hashedKey: Buffer

    constructor(key: string) {
        this.hashedKey = AESCipher.hashKey(key);
    }

    private static hashKey(key: string, blockSize=32): Buffer {
        let keyBuffer = Buffer.alloc(blockSize);
        HashUtils.sha256DigestBuffer(key).copy(keyBuffer, 0,0, blockSize);
        return keyBuffer;
    }

    static generateSessionId() {
        return this.hashKey(v4(), 16);
    }

    encrypt(data: Buffer, sessionId: Buffer): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            let iv = crypto.randomBytes(16);
            if (sessionId.byteLength != 16) {
                reject(new Error("Session ID should be exactly 16 bytes!"));
                return;
            }
            let cipher = crypto.createCipheriv("aes-256-gcm", this.hashedKey, iv);
            resolve(Buffer.concat([sessionId, iv, cipher.update(data), cipher.final(), cipher.getAuthTag()]));
        })
    }

    decrypt(data: Buffer): Promise<DecryptResult> {
        return new Promise<DecryptResult>((resolve) => {
            let sessionBuffer = Buffer.alloc(16);
            let ivBuffer = Buffer.alloc(16);
            let tagBuffer = Buffer.alloc(16);
            let dataBuffer = Buffer.alloc(data.byteLength-48);
            data.copy(sessionBuffer, 0, 0, 16);
            data.copy(ivBuffer, 0, 16, 32);
            data.copy(dataBuffer, 0, 32, data.byteLength-16);
            data.copy(tagBuffer, 0, data.byteLength-16, data.byteLength);
            let cipher = crypto.createDecipheriv("aes-256-gcm", this.hashedKey, ivBuffer);
            cipher.setAuthTag(tagBuffer);
            resolve(new DecryptResult(Buffer.concat([cipher.update(dataBuffer), cipher.final()]), sessionBuffer));
        });
    }
}