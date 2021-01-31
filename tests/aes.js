/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

const encryptor = require('../build/crypto/aes');

const KEY = "wilmaplus";
const DATA = "this is a secret message";

async function testCipher() {
    let cipherAES = new encryptor.AESCipher(Buffer.from(KEY));
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
            console.assert(stringData===DATA, "Data was invalid: %s", stringData);
            if (stringData!==DATA) {
                process.exit(-1);
            }
        }).catch(error => {
            console.log(error);
            process.exit(-1);
        });
    }

}

module.exports = {
    testCipher
}