/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */
import * as crypto from "crypto"
import {HashUtils} from "./hash";

export class AESCipher {
    hashedKey: Buffer

    constructor(key: string) {
        this.hashedKey = AESCipher.hashKey(key);
    }

    private static hashKey(key: string): Buffer {
        let keyBuffer = Buffer.alloc(32);
        HashUtils.sha256DigestBuffer(key).copy(keyBuffer, 0,0, 32);
        return keyBuffer;
    }

    encrypt(data: Buffer): Promise<Buffer> {
        return new Promise<Buffer>((resolve) => {
            let iv = crypto.randomBytes(16);
            let cipher = crypto.createCipheriv("aes-256-gcm", this.hashedKey, iv);
            resolve(Buffer.concat([iv, cipher.update(data), cipher.final(), cipher.getAuthTag()]));
        })
    }

    decrypt(data: Buffer): Promise<Buffer> {
        return new Promise<Buffer>((resolve) => {
            let ivBuffer = Buffer.alloc(16);
            let tagBuffer = Buffer.alloc(16);
            let dataBuffer = Buffer.alloc(data.byteLength-32);
            data.copy(ivBuffer, 0, 0, 16);
            data.copy(dataBuffer, 0, 16, data.byteLength-16);
            data.copy(tagBuffer, 0, data.byteLength-16, data.byteLength);
            let cipher = crypto.createDecipheriv("aes-256-gcm", this.hashedKey, ivBuffer);
            cipher.setAuthTag(tagBuffer);
            resolve(Buffer.concat([cipher.update(dataBuffer), cipher.final()]));
        });
    }
}