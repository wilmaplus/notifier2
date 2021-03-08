/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import {parentPort, workerData} from "worker_threads";
import {WilmaApiClient} from "../client/wilma/apiclient";
import {getRoutineNames, routines} from "../config/routines";
import {AESCipher} from "../crypto/aes";
import {v4} from "uuid";
import {AsyncIterator} from "../asynciterator/iterator";

import * as admin from 'firebase-admin';
import {Storage} from "../storage/storage";
import * as fs from "fs";
import {Query} from "../routines/misc/types";
import {PushKey} from "../db/models/push";
import {sendNotificationQuery} from "../routines/utils/query_runner";

const wConsole = {log: (msg: string) => {
    if ((global as any).debug || (global as any).log){
        console.log(msg)
    }
}}



if (!workerData.userId || !workerData.serverUrl || !workerData.session || !workerData.apiSettings || !workerData.dataFolder) {
    console.log("required parameters not found!");
    process.exit(-1);
}
// Making const variables
const userId = workerData.userId;
const serverUrl = workerData.serverUrl;
const wilmaSession = workerData.session;

if (workerData.log) {
    if (!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }
    let access = fs.createWriteStream('logs/'+userId+'.log');
    // @ts-ignore
    process.stdout.write = process.stderr.write = access.write.bind(access);
}

process.env.LONG_FILENAMES = workerData.lFN;

// Setting global variables
(global as any).apiSettings = workerData.apiSettings;
(global as any).dataFolder = workerData.dataFolder;
(global as any).debug = workerData.debug;
(global as any).log = workerData.log;

admin.initializeApp({
    credential: admin.credential.cert(require((global as any).apiSettings.fcmKey))
});

let queryList: Query[] = [];

const finish = () => {
    queryList = [];
    wConsole.log("check done, waiting...");
    // Setting timeout to run after 5 seconds
    setTimeout(run, 5000);
};

// Routine function
const run = () => {
    wilmaClient.checkSession().then(sessionCheck => {
        wConsole.log("Running routines");
        new AsyncIterator((item, iterator) => {
            new item(encryptionKey, sessionId).check(serverUrl, wilmaSession, sessionCheck.userId, sessionCheck.userType).then(queries => {
                wConsole.log("Ran "+item.publicName);
                queries.forEach(item => queryList.push(item));
                iterator.nextItem();
            }).catch(err => {
                wConsole.log("error!");
                wConsole.log(err);
                setTimeout(() => {process.exit(0)}, 200);
            })
        }, routines, () => {
            if (queryList.length > 0) {
                wConsole.log("Fetching keys");
                // Fetching keys from master
                parentPort?.postMessage(JSON.stringify({request: 'userKeys', params: {userId: userId}}));
            } else
                finish();
        }).start();
    }).catch(err => {
        wConsole.log(err);
        wConsole.log("Unable to validate session, exiting");
        setTimeout(() => {process.exit(0)}, 300);
    });

};

parentPort?.on('message', (msgJson) => {
    let msg = JSON.parse(msgJson);
    wConsole.log("[msg] "+msg.type);
    if (msg.type === 'userKeys') {
        let keys: PushKey[] = msg.data;
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
                setTimeout(() => {process.exit(0)}, 300);
            }).start();
        } else {
            // Iterating queries
            new AsyncIterator((item, iterator) => {
                // Iterating push keys
                new AsyncIterator((key, keyIterator) => {
                    if (key.allowedRoutines.includes(item.internal_type)) {
                        sendNotificationQuery(item, key.key).then(() => {
                            keyIterator.nextItem();
                        }).catch(err => {
                            wConsole.log(err.toString());
                            keyIterator.nextItem();
                        })
                    } else
                        iterator.nextItem();
                }, keys, () => {
                    iterator.nextItem();
                }).start();
            }, queryList, () => {
                finish();
            }).start();
        }
    } else if (msg.type === 'error') {
        throw new Error(msg.data);
    }
});

let wilmaClient = new WilmaApiClient(serverUrl, wilmaSession);
let encryptionKey = v4();
let sessionId = AESCipher.generateSessionId();
run();
