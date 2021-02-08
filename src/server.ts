/*
 * Copyright (c) 2021 wilmaplus-notifier2, developed by @developerfromjokela, for Wilma Plus mobile app
 */

import express from 'express';
import bodyParser from "body-parser";
import {responseStatus} from "./utils/response_utilities";
import {Handler} from "./worker/handler";
import {push} from "./handlers/push";
import path from "path";
import {Database} from "./db/db";
import {remove} from "./handlers/remove";
import {AsyncIterator} from "./asynciterator/iterator";
import * as admin from "firebase-admin";
import {FCMApiClient} from "./client/fcm/apiclient";
import {IIDApiClient} from "./client/iid/apiclient";
const rateLimit = require("express-rate-limit");

const DEBUG = process.env.DEBUG || false;
const PORT = process.env.PORT || 3001;
const BEHIND_PROXY = process.env.PROXY || false;
const FCM_KEY = process.env.FCM_KEY || null;
const IID_PKG_NAME = process.env.IID_PKGNAME || null;
const IID_KEY = process.env.IID_KEY || null;
const IID_URL = process.env.IID_URL || "https://iid.googleapis.com";
const DB_CONFIG = process.env.DBCONFIG || './dbconfig.json'
const dbConfig = require(DB_CONFIG);

if (FCM_KEY === null || IID_KEY === null) {
    throw new Error("FCM_KEY or IID_KEY not configured!");
}

// Setting logs to include timestamp
require('console-stamp')(console, '[HH:MM:ss.l]');

// Config
(global as any).apiSettings = {fcmKey: FCM_KEY, iidKey: IID_KEY, iidUrl: IID_URL, iidPackageName: IID_PKG_NAME};
(global as any).debug = DEBUG;

// Setting data folder
(global as any).dataFolder = path.join((process.env.DATA_FOLDER || path.dirname(__dirname)), ".wplus_data");

(global as any).db = new Database(dbConfig.dbname, dbConfig.username, dbConfig.password, dbConfig.host);
let db = (global as any).db as Database;
let app = express();
app.use(bodyParser.json());

// Rate-limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});

// Behind proxy
if (BEHIND_PROXY)
    app.set('trust proxy', 1);

// only apply to requests that begin with /api/
app.use("/api/v1/", apiLimiter);

const workerHandler = new Handler();
((global as any).workerHandler) = workerHandler;

app.route('/api/v1/push').post(push);
app.route('/api/v1/delete').post(remove);

app.get('*', (req, res) => {
    res.status(404).json({'status': false, 'cause': "not found"});
});

// Outputs errors as JSON, not HTML
const jsonErrorHandler = async (err: any, req: any, res: any, next: any) => {
    responseStatus(res, 500, false, {cause: err.toString()});
}
app.use(jsonErrorHandler);

admin.initializeApp({
    credential: admin.credential.cert(require((global as any).apiSettings.fcmKey))
});

const checkWorkers = () => {
    db.getAllUserIDs(items => {
        new AsyncIterator((item, iterator) => {
            let uid = (item as any).userId;
            if (!workerHandler.isWorkerRunning(uid)) {
                db.getUserKeys(uid, keys => {
                    if (keys.length > 0) {
                        let keyMap: string[] = []; keys.forEach((key: { key: string; }) => {
                            keyMap.push(key.key);
                        });
                        FCMApiClient.sendPush(keyMap, {refresh: "true", userId: uid}, 240).then((details) => {
                            iterator.nextItem();
                        }).catch(error => {
                            console.error(error);
                        });
                    } else {
                        iterator.nextItem();
                    }
                });
            } else
                iterator.nextItem();
        }, items, () => {console.log("checkWorkers finished");setTimeout(checkWorkers, 30000);}).start();
    });
}

const checkKeys = () => {
    let iidClient = new IIDApiClient((global as any).apiSettings.iidKey, (global as any).apiSettings.iidUrl)
    db.getAllKeys(items => {
        new AsyncIterator((item, iterator) => {
            iidClient.getPushKeyDetails(item.key).then(() => {
                // Valid key
                iterator.nextItem()
            }).catch(() => {
                // Error while checking key, invalid key
                db.removePushKey(item.key, item.userId).then(() => {iterator.nextItem()})
                    .catch(err => {
                        console.error(err);
                    });
            })
        }, items, () => {console.log("checkKeys finished");setTimeout(checkKeys, 30000);}).start();
    });
}


console.log("Connecting to database");
db.connect().then(() => {
    setInterval(function () {
        console.log(workerHandler.getRunningHandlerIDs().length+" running worker(s)");
    }, 5000);
    // Timeout for checking if all users' workers are running
    checkWorkers();
    checkKeys();
    app.listen(PORT);
});
