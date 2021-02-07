/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {HashUtils} from "../crypto/hash";
import * as fs from "fs";
import path from "path";
import {AESCipher} from "../crypto/aes";
const LONG_FILENAMES = process.env.LONG_FILENAMES;

export class Storage {

    static saveData(content: object, encryptionKey: string, sessionId: Buffer, fileName: string, userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let filename = fileName+"."+this.hash(userId)+".wplus";
            // Checking if save directory exists, if not, creating it recursively
            this.savePathCheck((global as any).dataFolder);
            // Deleting previous file if saved
            let filePath = path.join((global as any).dataFolder, filename);
            if (fs.existsSync(filename))
                fs.unlinkSync(filename);
            // Encrypting content and writing to a file
            new AESCipher(encryptionKey).encrypt(Buffer.from(JSON.stringify(content)), sessionId).then((contentBuffer) => {
                try {
                    fs.writeFileSync(filePath, contentBuffer);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }).catch(error => reject(error));
        });

    }

    static getSavedData(encryptionKey: string, sessionId: Buffer, fileName: string, userId: string): Promise<object|null> {
        return new Promise<object|null>((resolve, reject) => {
            let filename = fileName+"."+this.hash(userId)+".wplus";
            // Checking if save directory exists, if not, creating it recursively
            this.savePathCheck((global as any).dataFolder);
            // Deleting previous file if saved
            let filePath = path.join((global as any).dataFolder, filename);
            if (fs.existsSync(filePath)) {
                let fileBuffer = fs.readFileSync(filePath);
                // Checking if sessions match
                AESCipher.getSessionBuffer(fileBuffer)
                    .then(extractedId => {
                        if (extractedId.compare(sessionId) == 0) {
                            // Decrypting content
                            new AESCipher(encryptionKey).decrypt(fileBuffer)
                                .then((dataBuffer) => {
                                    resolve(JSON.parse(dataBuffer.data.toString('utf-8')));
                                })
                                .catch(error => reject(error));
                        } else
                            resolve(null);
                    })
                    .catch(() => resolve(null))
            } else {
                resolve(null);
            }
        });
    }

    static removeSavedData(fileName: string, userId: string) {
        return new Promise<void>((resolve) => {
            let filename = fileName+"."+this.hash(userId)+".wplus";
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
