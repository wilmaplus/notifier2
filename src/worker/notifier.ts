/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {workerData} from "worker_threads";
import {Database} from "../db/db";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {routines} from "../config/routines";
import {AESCipher} from "../crypto/aes";
import {v4} from "uuid";
import {AsyncIterator} from "../asynciterator/iterator";
import * as admin from 'firebase-admin';

if (!workerData.userId || !workerData.serverUrl || !workerData.session || !workerData.dbConfig || !workerData.apiSettings || !workerData.dataFolder) {
    console.log("required parameters not found!");
    process.exit(-1);
}
// Making const variables
const userId = workerData.userId;
const serverUrl = workerData.serverUrl;
const wilmaSession = workerData.session;
const dbConfig = workerData.dbConfig;

process.env.LONG_FILENAMES = workerData.lFN;
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

// Setting global variables
(global as any).apiSettings = workerData.apiSettings;
(global as any).dataFolder = workerData.dataFolder;

// Routine function
const run = () => {
    db.getUserKeys(userId, (keys) => {

        if (keys.length < 1) {
            console.log("No keys, exiting");
            setTimeout(() => {process.exit(0)}, 200);
        } else {
            wilmaClient.checkSession().then(sessionCheck => {
                console.log("Running routines");
                new AsyncIterator((item, iterator) => {
                    new item(encryptionKey, sessionId).check(serverUrl, wilmaSession, keys, sessionCheck.userId, sessionCheck.userType).then(() => {
                        iterator.nextItem();
                    }).catch(err => {
                        console.log("error!");
                        console.log(err);
                        setTimeout(() => {process.exit(0)}, 200);
                    })
                }, routines, () => {
                    console.log("check done, waiting...");
                    setTimeout(run, 5000);
                }).start();
            }).catch(err => {
                console.log(err);
                console.log("Unable to validate session, exiting");
                setTimeout(() => {process.exit(0)}, 200);
            })
        }
    });
};

console.log("connecting to DB");
let db = new Database(dbConfig.dbname, dbConfig.username, dbConfig.password, dbConfig.host);
let wilmaClient = new WilmaApiClient(serverUrl, wilmaSession);
let encryptionKey = v4();
let sessionId = AESCipher.generateSessionId();
db.connect().then(() => {
    console.log("Connected to DB");
    console.log("Fetching keys");
    run();
})
.catch(err => {
    console.log("Unable to connect to DB");
    console.log(err);
})