/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {AESCipher} from "../crypto/aes";
const KEY: string = "wilmaplus";
const DATA: string = "this is a secret message";
import {strictEqual} from "assert";

export async function testCipher() {
    let cipherAES = new AESCipher(KEY);
    console.log("Encrypting cipher");
    console.log("key: "+KEY);
    console.log("data: "+DATA);
    let data = null;
    await cipherAES.encrypt(Buffer.from(DATA)).then((bufferData) => {
        data = bufferData;
        console.log("Encrypted");
    }).catch(error => {
        console.log(error);
        process.exit(-1);
    });
    if (data != null) {
        console.log("Decrypting cipher");
        await cipherAES.decrypt(data).then((bufferData) => {
            let stringData = bufferData.toString('utf-8');
            console.log("Decrypted data: "+stringData);
            strictEqual(stringData, DATA, new Error("Data was invalid: "+ stringData));
        }).catch(error => {
            console.log(error);
            process.exit(-1);
        });
    }
}