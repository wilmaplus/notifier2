/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {HashUtils} from "../crypto/hash";
import * as fs from "fs";
import path from "path";
import {AESCipher} from "../crypto/aes";
const LONG_FILENAMES = process.env.LONG_FILENAMES || true;

export class Storage {

    static saveData(content: object, encryptionKey: string, fileName: string, randomToken: string, userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let filename = fileName+"_"+Storage.hash(randomToken)+"."+this.hash(userId)+".wplus";
            // Checking if save directory exists, if not, creating it recursively
            this.savePathCheck((global as any).dataFolder);
            // Deleting previous file if saved
            let filePath = path.join((global as any).dataFolder, filename);
            if (fs.existsSync(filename))
                fs.unlinkSync(filename);
            // Encrypting content and writing to a file
            new AESCipher(encryptionKey).encrypt(Buffer.from(JSON.stringify(content))).then((contentBuffer) => {
                fs.writeFileSync(filePath, contentBuffer);
                resolve();
            }).catch(error => reject(error));
        });

    }

    static getSavedData(encryptionKey: string, fileName: string, randomToken: string, userId: string): Promise<object> {
        return new Promise<object>((resolve, reject) => {
            let filename = fileName+"_"+Storage.hash(randomToken)+"."+this.hash(userId)+".wplus";
            // Checking if save directory exists, if not, creating it recursively
            this.savePathCheck((global as any).dataFolder);
            // Deleting previous file if saved
            let filePath = path.join((global as any).dataFolder, filename);
            new AESCipher(encryptionKey).decrypt(fs.readFileSync(filePath))
                .then((dataBuffer) => {
                    resolve(JSON.parse(dataBuffer.toString('utf-8')));
                })
                .catch(error => reject(error));
        });
    }

    static removeSavedData(fileName: string, randomToken: string, userId: string) {
        return new Promise<void>((resolve) => {
            let filename = fileName+"_"+Storage.hash(randomToken)+"."+this.hash(userId)+".wplus";
            // Checking if save directory exists, if not, creating it recursively
            this.savePathCheck((global as any).dataFolder);
            // Deleting previous file if saved
            let filePath = path.join((global as any).dataFolder, filename);
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
            resolve();
        });

    }

    private static hash(content: string) {
        let hashDigest;
        // Option to change, for example, FS encryption with LVM limits file name size
        if (LONG_FILENAMES)
            hashDigest = HashUtils.sha256Digest(content);
        else
            hashDigest = HashUtils.sha1Digest(content);
        return hashDigest;
    }

    private static savePathCheck(path: string) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {recursive: true});
        }
    }
}