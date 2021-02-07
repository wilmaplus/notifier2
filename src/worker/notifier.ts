/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {workerData} from "worker_threads";
import {Database} from "../db/db";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {getRoutineNames, routines} from "../config/routines";
import {AESCipher} from "../crypto/aes";
import {v4} from "uuid";
import {AsyncIterator} from "../asynciterator/iterator";

import * as admin from 'firebase-admin';
import {Storage} from "../storage/storage";
const wConsole = {log: (msg: string) => {if ((global as any).debug){console.log(msg)}}}

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

// Setting global variables
(global as any).apiSettings = workerData.apiSettings;
(global as any).dataFolder = workerData.dataFolder;
(global as any).debug = workerData.debug;

admin.initializeApp({
    credential: admin.credential.cert(require((global as any).apiSettings.fcmKey))
});


// Routine function
const run = () => {
    wConsole.log("Fetching keys");
    db.getUserKeys(userId, (keys) => {
        if (keys.length < 1) {
            wConsole.log("No keys, exiting");
            new AsyncIterator((routine, iterator) => {
                Storage.removeSavedData(routine, userId)
                    .then(() => {
                        iterator.nextItem();
                    })
                    .catch(error => {
                        wConsole.log(error)
                    });
            }, getRoutineNames(), () => {
                setTimeout(() => {process.exit(0)}, 200);
            }).start();
        } else {
            wilmaClient.checkSession().then(sessionCheck => {
                wConsole.log("Running routines");
                new AsyncIterator((item, iterator) => {
                    new item(encryptionKey, sessionId).check(serverUrl, wilmaSession, keys, sessionCheck.userId, sessionCheck.userType).then(() => {
                        iterator.nextItem();
                    }).catch(err => {
                        wConsole.log("error!");
                        wConsole.log(err);
                        setTimeout(() => {process.exit(0)}, 200);
                    })
                }, routines, () => {
                    wConsole.log("check done, waiting...");
                    // Setting timeout to run after 5 seconds
                    setTimeout(run, 5000);
                }).start();
            }).catch(err => {
                wConsole.log(err);
                wConsole.log("Unable to validate session, exiting");
                setTimeout(() => {process.exit(0)}, 200);
            })
        }
    });
};

wConsole.log("connecting to DB");
let db = new Database(dbConfig.dbname, dbConfig.username, dbConfig.password, dbConfig.host);
let wilmaClient = new WilmaApiClient(serverUrl, wilmaSession);
let encryptionKey = v4();
let sessionId = AESCipher.generateSessionId();
db.connect().then(() => {
    wConsole.log("Connected to DB");
    run();
})
.catch(err => {
    console.log("Unable to connect to DB");
    console.log(err);
})